/*
 * BalanceBot — Arduino Uno R3 firmware
 * Pin names in comments match the physical Uno silkscreen.
 *
 * Arduino Uno wiring:
 *   L298N ENA  -> ~5      IN1 -> 7       IN2 -> 8
 *   L298N IN3  -> ~10     IN4 -> A0      ENB -> ~6
 *   HC-SR04 TRIG -> 2     ECHO -> ~3
 *   MPU6050 SDA -> A4/SDA SCL -> A5/SCL (INT intentionally unused)
 *   Potentiometer WIPER -> A2
 *   Passive Buzzer + -> ~9
 *   IR OUT/S -> A1
 *   LEDs: red1 ~11, red2 12, green1 13, green2 4
 *   Hybrid UART: ESP32 GPIO17/TX2 -> RX←0; TX→1 -> level shifter -> GPIO16/RX2
 */
#include <Arduino.h>
#include <Wire.h>

// L298N pins: ENA ~5, IN1 7, IN2 8, IN3 ~10, IN4 A0, ENB ~6.
constexpr uint8_t LEFT_PWM  = 5;   // ~5
constexpr uint8_t LEFT_IN1  = 7;   // 7
constexpr uint8_t LEFT_IN2  = 8;   // 8
constexpr uint8_t RIGHT_IN1 = 10;  // ~10 (direction output)
constexpr uint8_t RIGHT_IN2 = A0;  // A0 (direction output)
constexpr uint8_t RIGHT_PWM = 6;   // ~6

constexpr uint8_t SONAR_TRIG = 2;  // 2
constexpr uint8_t SONAR_ECHO = 3;  // ~3
constexpr uint8_t BUZZER_PIN = 9;  // ~9
constexpr uint8_t POT_PIN = A2;
constexpr uint8_t IR_PIN = A1;
constexpr uint8_t LED_RED_1 = 11;  // ~11
constexpr uint8_t LED_RED_2 = 12;  // 12
constexpr uint8_t LED_GREEN_1 = 13; // 13
constexpr uint8_t LED_GREEN_2 = 4;  // 4
constexpr bool REVERSE_MOTOR_DIRECTION = true;

int speedLevel = 5;
constexpr int MAX_SPEED_LEVEL = 10;
unsigned long lastTelemetry = 0;

void setOneMotor(uint8_t pwmPin, uint8_t in1, uint8_t in2, int value) {
  value = constrain(value, -255, 255);
  if (REVERSE_MOTOR_DIRECTION) value = -value;
  digitalWrite(in1, value >= 0 ? LOW : HIGH);
  digitalWrite(in2, value >= 0 ? HIGH : LOW);
  analogWrite(pwmPin, abs(value));
}

void setMotors(int left, int right) {
  setOneMotor(LEFT_PWM, LEFT_IN1, LEFT_IN2, left);
  setOneMotor(RIGHT_PWM, RIGHT_IN1, RIGHT_IN2, right);
}

void stopMotors() { setMotors(0, 0); }

int drivePower() { return map(speedLevel, 1, MAX_SPEED_LEVEL, 45, 255); }

void drive(char command) {
  const int p = drivePower();
  switch (command) {
    case 'F': setMotors(p, p); break;
    case 'B': setMotors(-p, -p); break;
    case 'L': setMotors(-p, p); break;
    case 'R': setMotors(p, -p); break;
    case 'C': setMotors(p, -p); break;
    case 'c': setMotors(-p, p); break;
    case 'S': case ' ': stopMotors(); break;
    default: break;
  }
}

void horn(char code) {
  const uint16_t hz = code == '1' ? 880 : code == '2' ? 660 : code == '3' ? 220 : code == '4' ? 1200 : 440;
  const int volume = map(analogRead(POT_PIN), 0, 1023, 25, 255);
  tone(BUZZER_PIN, hz, 180);
  digitalWrite(LED_GREEN_1, volume > 140 ? HIGH : LOW);
}

void updateStatusLeds() {
  digitalWrite(LED_RED_1, digitalRead(IR_PIN) ? LOW : HIGH);
  digitalWrite(LED_RED_2, digitalRead(IR_PIN) ? LOW : HIGH);
  digitalWrite(LED_GREEN_2, speedLevel >= 7 ? HIGH : LOW);
}

void handleCommand(char command) {
  if (command >= '1' && command <= '4') horn(command);
  else if (command == 'h') horn('h');
  else if (command == '+') speedLevel = min(MAX_SPEED_LEVEL, speedLevel + 1);
  else if (command == '-') speedLevel = max(1, speedLevel - 1);
  else drive(command);
}

void printTelemetry() {
  if (millis() - lastTelemetry < 500) return;
  lastTelemetry = millis();
  digitalWrite(SONAR_TRIG, LOW); delayMicroseconds(2);
  digitalWrite(SONAR_TRIG, HIGH); delayMicroseconds(10); digitalWrite(SONAR_TRIG, LOW);
  const unsigned long echoUs = pulseIn(SONAR_ECHO, HIGH, 25000UL);
  const unsigned long distanceMm = echoUs ? (echoUs * 343UL) / 2000UL : 0;
  Serial.print(F("telemetry distance_mm=")); Serial.print(distanceMm);
  Serial.print(F(" pot=")); Serial.print(analogRead(POT_PIN));
  Serial.print(F(" ir=")); Serial.println(digitalRead(IR_PIN));
}

void setup() {
  pinMode(LEFT_PWM, OUTPUT); pinMode(LEFT_IN1, OUTPUT); pinMode(LEFT_IN2, OUTPUT);
  pinMode(RIGHT_PWM, OUTPUT); pinMode(RIGHT_IN1, OUTPUT); pinMode(RIGHT_IN2, OUTPUT);
  pinMode(SONAR_TRIG, OUTPUT); pinMode(SONAR_ECHO, INPUT);
  pinMode(BUZZER_PIN, OUTPUT); pinMode(IR_PIN, INPUT);
  pinMode(LED_RED_1, OUTPUT); pinMode(LED_RED_2, OUTPUT);
  pinMode(LED_GREEN_1, OUTPUT); pinMode(LED_GREEN_2, OUTPUT);
  Wire.begin();
  Serial.begin(115200); // RX←0 / TX→1: use level shifting for TX→1 to ESP32 RX2.
  stopMotors();
}

void loop() {
  while (Serial.available()) handleCommand(static_cast<char>(Serial.read()));
  updateStatusLeds();
  printTelemetry();
}
