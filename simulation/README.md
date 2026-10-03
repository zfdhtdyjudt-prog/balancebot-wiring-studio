# BalanceBot Hybrid Co-Simulation — Phase 0/1

## Phase 0 structure

```text
simulation/
├── README.md
├── main.js
├── digital-core.js
├── monaco-editor.js
├── compile-service.js
├── intel-hex.js
├── avr8js-runner.js
└── default-sketch.js

compiler-service/
├── server.mjs
├── package.json
├── Dockerfile
└── README.md
```

## Phase 1 scope

This phase implements the digital-core boundary only:

- Monaco Editor is loaded lazily from the official CDN.
- Arduino source is sent to a configurable `/api/compile` endpoint.
- Intel HEX is decoded into AVR flash words.
- `avr8js` is loaded as an ES module when a HEX image is run.
- ATmega328P CPU cycles execute in bounded batches.
- AVR ports B, C, and D are observed and exposed as Arduino pin states.
- The UI reports compile, load, run, pause, and GPIO events.
- The optional compiler service invokes `arduino-cli` in a temporary isolated directory.

Phase 1 does not claim analog, CircuitJS, Matter.js, ESP32, or physical simulation support. Those belong to later phases.

## Later boundaries

- Phase 2: interactive component Web Components and advanced A* routing.
- Phase 3: capacitors, resistors, diodes, L298N/TB6612FNG models, ADC injection, and analog ticks.
- Phase 4: Matter.js robot body, wheels, friction, motor torque, IMU feedback, and balancing physics.

## Phase 2 implementation status

Phase 2 includes `orthogonal-router.js` for obstacle-aware grid A* paths and `interactive-components.js` for Wokwi-style local Web Components. Optional CDN loading is best-effort and falls back to local components. A real Arduino Uno compiler API test completed with `arduino:avr:uno` and returned valid Intel HEX.
