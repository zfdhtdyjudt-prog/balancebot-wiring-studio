# BalanceBot Hybrid Co-Simulation

## Current status

The project is a staged browser-based wiring editor and educational hybrid-simulation prototype. The current implementation has four layers:

1. **Phase 0/1 — Digital core:** Monaco/fallback editor, Arduino compiler endpoint contract, Intel HEX parser, and bounded `avr8js` execution for Arduino Uno.
2. **Phase 2 — Interactive UI:** local Web Components for LEDs, motors, potentiometers, and HC-SR04-style controls, plus obstacle-aware orthogonal A* routing.
3. **Phase 3 — Analog + physics:** a simplified battery/capacitor/L298N/motor model and a Matter.js 2D chassis-and-wheels world.
4. **Phase 4 — Sensor adapter:** virtual MPU6050 and HC-SR04 readings driven by the Matter.js body state and the shared animation tick.

This is not yet a SPICE/CircuitJS solver, an ESP32 emulator, a real I²C/GPIO bus, or a hardware measurement system.

## Source files

```text
simulation/
├── main.js                 # Digital-core browser bootstrap
├── digital-core.js         # Compile → HEX → AVR execution coordinator
├── monaco-editor.js        # Monaco loader with textarea fallback
├── compile-service.js       # Browser client for /api/compile
├── intel-hex.js             # Validated Intel HEX parser
├── avr8js-runner.js         # ATmega328P/AVR adapter
├── default-sketch.js        # Initial Arduino sketch
├── orthogonal-router.js     # Obstacle-aware grid A* router
├── interactive-components.js# Local Wokwi-style Web Components
├── analog-engine.js         # Educational analog and motor model
├── physics-world.js         # Matter.js chassis, wheels, telemetry, controls
├── sensor-engine.js         # MPU6050Model, HCSR04Model, SensorBus
└── hybrid-engine.js         # Shared tick connecting analog, physics, and sensors
```

The static publication configuration copies `index.html`, `styles.css`, `app.js`, the registry, routes, samples, and schema. Because the publisher does not reliably expose every nested source module as a browser asset, `app.js` contains a generated browser bundle that imports the current phase modules. The separated source files remain the readable and testable source of truth.

## Phase-four sensor contract

`SensorBus.update(bodyState, dtSeconds, distanceCm)` returns:

```js
{
  time,
  mpu6050: {
    address: '0x68',
    pitchDeg,
    rollDeg,
    yawDeg,
    gyroXDegS,
    gyroYDegS,
    gyroZDegS,
    accelX,
    accelY,
    accelZ,
    sampleHz
  },
  hcSr04: {
    distanceCm,
    echoUs,
    triggerMs,
    obstacleStop,
    valid,
    sampleHz
  },
  buses: {
    mpu6050: 'I2C · 0x68',
    hcSr04: 'TRIG/ECHO · virtual pulse'
  }
}
```

### MPU6050 mapping

- Matter.js `chassis.angle` becomes `pitchDeg`/`yawDeg` in degrees.
- Matter.js `chassis.angularVelocity` becomes `gyroZDegS`.
- Gravity is projected into `accelX` and `accelZ` using the body angle.
- The sample frequency is derived from the shared `dtSeconds`.

### HC-SR04 mapping

- The UI distance slider is clamped to 2–400cm.
- Echo duration uses the educational relation `echoUs = distanceCm × 58.2`.
- A distance below 20cm sets `obstacleStop=true`.
- The hybrid loop multiplies both motor voltages by zero when `obstacleStop` is true.

### Shared loop

```js
const reading = sensors.update(world?.telemetry() || {}, dt, distanceCm);
const driveScale = reading.hcSr04.obstacleStop ? 0 : 1;
world?.drive(leftVoltage * driveScale, rightVoltage * driveScale);
```

The virtual sensor panel exposes pitch, gyro, acceleration, distance, Echo duration, and safety state. It explicitly states that the values are virtual and not readings from a physical sensor.

## Verification

The project checks include:

```sh
python3 check-project.py
node --check app.js
node --check simulation/*.js
```

The phase-four focused test verifies 30° pitch conversion, gyro conversion, HC-SR04 Echo timing at 12cm, the under-20cm safety stop, and SensorBus updates with a physics body state.

## Boundaries

- Matter.js is loaded from CDN and has an explicit offline/unavailable state.
- The analog model is educational: it does not solve Kirchhoff/MNA equations or reproduce a manufacturer-accurate L298N thermal/electrical model.
- The MPU6050 and HC-SR04 are virtual adapters; no I²C register emulation or ultrasonic ray-casting exists yet.
- The project has no complete ESP32/QEMU emulator or full PID self-balancing model.
- The compiler service is optional and must run separately with Arduino CLI; a public static page does not receive arbitrary compiler privileges.
