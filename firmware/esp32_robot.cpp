/*
 * BalanceBot — ESP32 Dev Board firmware
 * GPIO names are written explicitly to avoid confusing GPIO numbers with Uno pins.
 *
 * ESP32 wiring:
 *   L298N ENA GPIO25, IN1 GPIO27, IN2 GPIO14, IN3 GPIO13, IN4 GPIO23, ENB GPIO26
 *   HC-SR04 TRIG GPIO16, ECHO GPIO17 through 1k/2k voltage divider
 *   MPU6050 SDA GPIO21, SCL GPIO22; INT intentionally unused
 *   Passive Buzzer GPIO4; Potentiometer WIPER GPIO35; IR OUT GPIO34
 *   LEDs: red1 GPIO18, red2 GPIO19, green1 GPIO32, green2 GPIO33
 *   Hybrid UART2: TX2 GPIO17 -> Uno RX←0; RX2 GPIO16 <- level-shifted Uno TX→1
 */
#include <Arduino.h>
#include <Wire.h>
#include <WiFi.h>
#include <WebServer.h>
#include <BluetoothSerial.h>

// Set to 1 for Hybrid Arduino + ESP32; keep 0 for ESP32 Standalone.
// GPIO16/17 cannot be UART2 and HC-SR04 pins at the same time.
#ifndef BALANCEBOT_HYBRID_MODE
#define BALANCEBOT_HYBRID_MODE 0
#endif

constexpr uint8_t LEFT_PWM = 25;    // GPIO25
constexpr uint8_t LEFT_IN1 = 27;    // GPIO27
constexpr uint8_t LEFT_IN2 = 14;    // GPIO14
constexpr uint8_t RIGHT_IN1 = 13;   // GPIO13
constexpr uint8_t RIGHT_IN2 = 23;   // GPIO23
constexpr uint8_t RIGHT_PWM = 26;   // GPIO26
constexpr uint8_t SONAR_TRIG = 16;  // GPIO16
constexpr uint8_t SONAR_ECHO = 17;  // GPIO17, divider output
constexpr uint8_t BUZZER_PIN = 4;   // GPIO4
constexpr uint8_t POT_PIN = 35;     // GPIO35, input-only
constexpr uint8_t IR_PIN = 34;      // GPIO34, input-only
constexpr uint8_t LED_RED_1 = 18;
constexpr uint8_t LED_RED_2 = 19;
constexpr uint8_t LED_GREEN_1 = 32;
constexpr uint8_t LED_GREEN_2 = 33;
constexpr uint8_t UART2_RX = 16;
constexpr uint8_t UART2_TX = 17;
constexpr bool REVERSE_MOTOR_DIRECTION = true;

BluetoothSerial BalanceBotBluetooth;
HardwareSerial RobotSerial(2);
WebServer server(80);
int speedLevel = 5;
constexpr int MAX_SPEED_LEVEL = 10;
unsigned long lastTelemetry = 0;

void setOneMotor(uint8_t pwmPin, uint8_t in1, uint8_t in2, int value) {
  value = constrain(value, -255, 255);
  if (REVERSE_MOTOR_DIRECTION) value = -value;
  digitalWrite(in1, value >= 0 ? LOW : HIGH);
  digitalWrite(in2, value >= 0 ? HIGH : LOW);
  ledcWrite(pwmPin, abs(value));
}
void setMotors(int left, int right) { setOneMotor(LEFT_PWM, LEFT_IN1, LEFT_IN2, left); setOneMotor(RIGHT_PWM, RIGHT_IN1, RIGHT_IN2, right); }
void stopMotors() { setMotors(0, 0); }
int drivePower() { return map(speedLevel, 1, MAX_SPEED_LEVEL, 45, 255); }
void drive(char c) {
  const int p = drivePower();
  if (c == 'F') setMotors(p, p); else if (c == 'B') setMotors(-p, -p);
  else if (c == 'L') setMotors(-p, p); else if (c == 'R') setMotors(p, -p);
  else if (c == 'C') setMotors(p, -p); else if (c == 'c') setMotors(-p, p);
  else if (c == 'S' || c == ' ') stopMotors();
}
void horn(char code) {
  const uint16_t hz = code == '1' ? 880 : code == '2' ? 660 : code == '3' ? 220 : code == '4' ? 1200 : 440;
  const int volume = map(analogRead(POT_PIN), 0, 4095, 25, 255);
  ledcAttach(BUZZER_PIN, hz, 8); ledcWrite(BUZZER_PIN, volume); delay(180); ledcWrite(BUZZER_PIN, 0);
}
void handleCommand(char c) {
  if (c >= '1' && c <= '4') horn(c); else if (c == 'h') horn('h');
  else if (c == '+') speedLevel = min(MAX_SPEED_LEVEL, speedLevel + 1);
  else if (c == '-') speedLevel = max(1, speedLevel - 1); else drive(c);
}
void pollTransports() {
  while (Serial.available()) handleCommand(static_cast<char>(Serial.read()));
#if BALANCEBOT_HYBRID_MODE
  while (RobotSerial.available()) handleCommand(static_cast<char>(RobotSerial.read()));
#endif
  while (BalanceBotBluetooth.available()) handleCommand(static_cast<char>(BalanceBotBluetooth.read()));
}
void sendTelemetry(Stream &out) {
  if (millis() - lastTelemetry < 500) return;
  lastTelemetry = millis();
#if BALANCEBOT_HYBRID_MODE
  const unsigned long distanceMm = 0; // HC-SR04 belongs to Arduino in Hybrid mode.
#else
  digitalWrite(SONAR_TRIG, LOW); delayMicroseconds(2); digitalWrite(SONAR_TRIG, HIGH); delayMicroseconds(10); digitalWrite(SONAR_TRIG, LOW);
  const unsigned long echoUs = pulseIn(SONAR_ECHO, HIGH, 25000UL);
  const unsigned long distanceMm = echoUs ? (echoUs * 343UL) / 2000UL : 0;
#endif
  out.print(F("telemetry distance_mm=")); out.print(distanceMm); out.print(F(" pot=")); out.print(analogRead(POT_PIN)); out.print(F(" ir=")); out.println(digitalRead(IR_PIN));
}
void handleHttpCommand() { if (server.hasArg("c") && server.arg("c").length()) handleCommand(server.arg("c")[0]); server.send(200, "text/plain", "ok"); }
void setup() {
  pinMode(LEFT_IN1, OUTPUT); pinMode(LEFT_IN2, OUTPUT); pinMode(RIGHT_IN1, OUTPUT); pinMode(RIGHT_IN2, OUTPUT);
#if !BALANCEBOT_HYBRID_MODE
  pinMode(SONAR_TRIG, OUTPUT); pinMode(SONAR_ECHO, INPUT);
#endif
  pinMode(IR_PIN, INPUT);
  pinMode(LED_RED_1, OUTPUT); pinMode(LED_RED_2, OUTPUT); pinMode(LED_GREEN_1, OUTPUT); pinMode(LED_GREEN_2, OUTPUT);
  ledcAttach(LEFT_PWM, 20000, 8); ledcAttach(RIGHT_PWM, 20000, 8); ledcAttach(BUZZER_PIN, 440, 8);
  Wire.begin(21, 22); Serial.begin(115200);
#if BALANCEBOT_HYBRID_MODE
  RobotSerial.begin(115200, SERIAL_8N1, UART2_RX, UART2_TX);
#endif
  BalanceBotBluetooth.begin("BalanceBot");
  WiFi.mode(WIFI_AP); WiFi.softAP("BalanceBot", "balancebot");
  server.on("/command", HTTP_GET, handleHttpCommand); server.begin(); stopMotors();
}
void loop() {
  pollTransports(); server.handleClient();
  digitalWrite(LED_RED_1, digitalRead(IR_PIN) ? LOW : HIGH); digitalWrite(LED_RED_2, digitalRead(IR_PIN) ? LOW : HIGH);
  digitalWrite(LED_GREEN_1, speedLevel >= 5 ? HIGH : LOW); digitalWrite(LED_GREEN_2, speedLevel >= 8 ? HIGH : LOW);
  sendTelemetry(Serial);
}
