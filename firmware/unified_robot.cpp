/*
 * BalanceBot Unified Firmware v3.1
 *
 * Build this file for either target:
 *   - Arduino Uno R3: compile firmware/arduino_uno_robot.cpp
 *   - ESP32 Dev Board: compile firmware/esp32_robot.cpp
 *
 * This wrapper is retained for build systems that expect one source file.
 * The board-specific files are the authoritative complete implementations and
 * use the exact silkscreen/GPIO names documented in docs/WIRING_GUIDE_AR.md.
 */
#if defined(ESP32)
  #include "esp32_robot.cpp"
#elif defined(__AVR_ATmega328P__)
  #include "arduino_uno_robot.cpp"
#else
  #error "Select an ESP32 Dev Board or Arduino Uno R3 target"
#endif
