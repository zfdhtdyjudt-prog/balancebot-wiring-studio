const clamp = (value, min, max) => Math.max(min, Math.min(max, Number(value) || 0));

export class MPU6050Model {
  constructor({ address = '0x68', gravity = 9.80665 } = {}) { this.address = address; this.gravity = gravity; this.state = this.#zero(); }
  #zero() { return { address: this.address, pitchDeg: 0, rollDeg: 0, yawDeg: 0, gyroXDegS: 0, gyroYDegS: 0, gyroZDegS: 0, accelX: 0, accelY: 0, accelZ: this.gravity, sampleHz: 0 }; }
  reset() { this.state = this.#zero(); }
  sample(body = {}, dtSeconds = 0) { const dt = Math.max(0.0001, Number(dtSeconds) || 0.016); const angle = Number(body.angle) || 0; const angularVelocity = Number(body.angularVelocity) || 0; const pitchDeg = angle * 180 / Math.PI; const gyroZDegS = angularVelocity * 180 / Math.PI; const accelX = Math.sin(angle) * this.gravity; const accelY = 0; const accelZ = Math.cos(angle) * this.gravity; this.state = { address: this.address, pitchDeg, rollDeg: 0, yawDeg: pitchDeg, gyroXDegS: 0, gyroYDegS: 0, gyroZDegS, accelX, accelY, accelZ, sampleHz: 1 / dt }; return { ...this.state }; }
}

export class HCSR04Model {
  constructor({ minDistanceCm = 2, maxDistanceCm = 400 } = {}) { this.minDistanceCm = minDistanceCm; this.maxDistanceCm = maxDistanceCm; this.requestedDistanceCm = 80; this.state = this.#zero(); }
  #zero() { return { distanceCm: this.requestedDistanceCm, echoUs: this.requestedDistanceCm * 58.2, triggerMs: 0.01, obstacleStop: false, valid: true, sampleHz: 0 }; }
  setDistance(distanceCm) { this.requestedDistanceCm = clamp(distanceCm, this.minDistanceCm, this.maxDistanceCm); }
  reset() { this.requestedDistanceCm = 80; this.state = this.#zero(); }
  sample(dtSeconds = 0) { const dt = Math.max(0.0001, Number(dtSeconds) || 0.016); const distanceCm = clamp(this.requestedDistanceCm, this.minDistanceCm, this.maxDistanceCm); this.state = { distanceCm, echoUs: distanceCm * 58.2, triggerMs: 0.01, obstacleStop: distanceCm < 20, valid: true, sampleHz: 1 / dt }; return { ...this.state }; }
}

export class SensorBus {
  constructor() { this.mpu6050 = new MPU6050Model(); this.hcSr04 = new HCSR04Model(); this.running = false; this.last = null; }
  reset() { this.mpu6050.reset(); this.hcSr04.reset(); this.running = false; this.last = null; }
  update(bodyState = {}, dtSeconds = 0.016, distanceCm = 80) { this.hcSr04.setDistance(distanceCm); this.last = { time: performance.now(), mpu6050: this.mpu6050.sample(bodyState, dtSeconds), hcSr04: this.hcSr04.sample(dtSeconds), buses: { mpu6050: 'I2C · 0x68', hcSr04: 'TRIG/ECHO · virtual pulse' } }; this.running = true; return this.last; }
  snapshot() { return this.last || { time: 0, mpu6050: this.mpu6050.state, hcSr04: this.hcSr04.state, buses: { mpu6050: 'I2C · 0x68', hcSr04: 'TRIG/ECHO · virtual pulse' } }; }
}
