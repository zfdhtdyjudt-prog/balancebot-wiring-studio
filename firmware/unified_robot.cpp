/* BalanceBot Unified Firmware v3.0
 * One source for Arduino Uno R3 and ESP32 Dev Board.
 * Safety model: 3S battery -> L298N VMS; L298N 5V jumper output -> logic VIN/5V.
 */

#if defined ( ESP32 )
  #include <WiFi.h>
  #include <BluetoothSerial.h>
  BluetoothSerial BalanceBotBluetooth ;
  const int LEFT_PWM_PIN  = 25 ;
  const int LEFT_IN1_PIN  = 26 ;
  const int LEFT_IN2_PIN  = 14 ;
  const int RIGHT_IN1_PIN = 18 ;
  const int RIGHT_IN2_PIN = 19 ;
  const int RIGHT_PWM_PIN = 27 ;
  const int MPU_SDA_PIN   = 21 ;
  const int MPU_SCL_PIN   = 22 ;
  const int POT_PIN       = 32 ;
  const int BUZZER_PIN    = 33 ;
  const int TRIG_PIN      = 5 ;
  const int ECHO_PIN      = 34 ;
  HardwareSerial RobotSerial ( 2 ) ;
#elif defined ( __AVR_ATmega328P__ )
  #include <SoftwareSerial.h>
  const int LEFT_PWM_PIN  = 5 ;
  const int LEFT_IN1_PIN  = 6 ;
  const int LEFT_IN2_PIN  = 7 ;
  const int RIGHT_IN1_PIN = 9 ;
  const int RIGHT_IN2_PIN = 10 ;
  const int RIGHT_PWM_PIN = 11 ;
  const int MPU_SDA_PIN   = A4 ;
  const int MPU_SCL_PIN   = A5 ;
  const int POT_PIN       = A2 ;
  const int BUZZER_PIN    = 3 ;
  const int TRIG_PIN      = A0 ;
  const int ECHO_PIN      = A1 ;
  SoftwareSerial RobotSerial ( 0 , 1 ) ;
#else
  #error "Select an ESP32 or ATmega328P board"
#endif

// -------------------- Configuration --------------------
const bool REVERSE_MOTOR_DIRECTION = true ;
const int SPEED_LEVELS = 10 ;
int speedLevel = 5 ;

// -------------------- Motor Module --------------------
void setMotorPair ( int leftPwm , int rightPwm )
{
  leftPwm = constrain ( leftPwm , -255 , 255 ) ;
  rightPwm = constrain ( rightPwm , -255 , 255 ) ;
  if ( REVERSE_MOTOR_DIRECTION )
  {
    leftPwm = -leftPwm ;
    rightPwm = -rightPwm ;
  }
  digitalWrite ( LEFT_IN1_PIN , leftPwm >= 0 ? LOW : HIGH ) ;
  digitalWrite ( LEFT_IN2_PIN , leftPwm >= 0 ? HIGH : LOW ) ;
  digitalWrite ( RIGHT_IN1_PIN , rightPwm >= 0 ? LOW : HIGH ) ;
  digitalWrite ( RIGHT_IN2_PIN , rightPwm >= 0 ? HIGH : LOW ) ;
  analogWrite ( LEFT_PWM_PIN , abs ( leftPwm ) ) ;
  analogWrite ( RIGHT_PWM_PIN , abs ( rightPwm ) ) ;
}

void stopMotors ( ) { setMotorPair ( 0 , 0 ) ; }
void driveCommand ( char command )
{
  const int power = map ( speedLevel , 1 , SPEED_LEVELS , 45 , 255 ) ;
  if ( command == 'F' ) setMotorPair ( power , power ) ;
  else if ( command == 'B' ) setMotorPair ( -power , -power ) ;
  else if ( command == 'L' ) setMotorPair ( -power , power ) ;
  else if ( command == 'R' ) setMotorPair ( power , -power ) ;
  else if ( command == 'C' ) setMotorPair ( power , -power ) ;
  else if ( command == 'c' ) setMotorPair ( -power , power ) ;
  else stopMotors ( ) ;
}

// -------------------- Potentiometer and Buzzer --------------------
int readBuzzerVolume ( ) { return map ( analogRead ( POT_PIN ) , 0 , 1023 , 25 , 255 ) ; }
void playHorn ( char soundCode )
{
  const int volume = readBuzzerVolume ( ) ;
  const int frequency = soundCode == '1' ? 880 : soundCode == '2' ? 660 : soundCode == '3' ? 220 : soundCode == '4' ? 1200 : 440 ;
  #if defined ( ESP32 )
    ledcAttach ( BUZZER_PIN , frequency , 8 ) ;
    ledcWrite ( BUZZER_PIN , volume ) ;
  #else
    tone ( BUZZER_PIN , frequency ) ;
  #endif
}
void stopHorn ( )
{
  #if defined ( ESP32 )
    ledcWrite ( BUZZER_PIN , 0 ) ;
  #else
    noTone ( BUZZER_PIN ) ;
  #endif
}

// -------------------- Command Loop --------------------
void handleCommand ( char command )
{
  if ( command >= '1' && command <= '4' ) playHorn ( command ) ;
  else if ( command == 'h' ) playHorn ( 'h' ) ;
  else if ( command == '+' ) speedLevel = min ( SPEED_LEVELS , speedLevel + 1 ) ;
  else if ( command == '-' ) speedLevel = max ( 1 , speedLevel - 1 ) ;
  else if ( command == ' ' ) stopHorn ( ) ;
  else driveCommand ( command ) ;
}

void setup ( )
{
  pinMode ( LEFT_PWM_PIN , OUTPUT ) ; pinMode ( LEFT_IN1_PIN , OUTPUT ) ; pinMode ( LEFT_IN2_PIN , OUTPUT ) ;
  pinMode ( RIGHT_PWM_PIN , OUTPUT ) ; pinMode ( RIGHT_IN1_PIN , OUTPUT ) ; pinMode ( RIGHT_IN2_PIN , OUTPUT ) ;
  pinMode ( BUZZER_PIN , OUTPUT ) ; pinMode ( TRIG_PIN , OUTPUT ) ; pinMode ( ECHO_PIN , INPUT ) ;
  Serial.begin ( 115200 ) ; RobotSerial.begin ( 115200 ) ; stopMotors ( ) ;
  #if defined ( ESP32 )
    BalanceBotBluetooth.begin ( "BalanceBot" ) ;
  #endif
}

void loop ( )
{
  if ( Serial.available ( ) ) handleCommand ( ( char ) Serial.read ( ) ) ;
  if ( RobotSerial.available ( ) ) handleCommand ( ( char ) RobotSerial.read ( ) ) ;
}
