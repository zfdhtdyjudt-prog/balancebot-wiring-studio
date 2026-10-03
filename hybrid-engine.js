import { AnalogEngine } from './analog-engine.js';
import { RobotPhysicsWorld } from './physics-world.js';
import { SensorBus } from './sensor-engine.js';

const $ = (id) => document.getElementById(id);
const analog = new AnalogEngine();
const sensors = new SensorBus();
let world = null;
let running = false;
let last = performance.now();

function setText(id, value) { const node = $(id); if (node) node.textContent = value; }
function updateTelemetry(state) { setText('analogSupply', `${state.supplyVoltage.toFixed(2)} V`); setText('analogCapacitor', `${state.capacitorVoltage.toFixed(2)} V`); setText('analogLeft', `${state.left.rpm.toFixed(0)} RPM · ${state.left.voltage.toFixed(2)} V`); setText('analogRight', `${state.right.rpm.toFixed(0)} RPM · ${state.right.voltage.toFixed(2)} V`); setText('analogCurrent', `${state.totalCurrent.toFixed(2)} A`); }
function updateSensorTelemetry(reading) { const imu = reading.mpu6050; const sonar = reading.hcSr04; setText('mpuPitch', `${imu.pitchDeg.toFixed(2)}°`); setText('mpuGyro', `${imu.gyroZDegS.toFixed(2)}°/s`); setText('mpuAccelX', `${imu.accelX.toFixed(2)} m/s²`); setText('mpuAccelZ', `${imu.accelZ.toFixed(2)} m/s²`); setText('sonarDistance', `${sonar.distanceCm.toFixed(1)} cm`); setText('sonarEcho', `${sonar.echoUs.toFixed(0)} μs`); setText('sonarSafety', sonar.obstacleStop ? 'توقف أمان < 20cm' : 'مسار مفتوح'); setText('sensorStatus', `افتراضي · ${imu.sampleHz.toFixed(0)}Hz`); }
function controls() { return { left: Number($('physicsLeft')?.value || 0), right: Number($('physicsRight')?.value || 0), distance: Number($('sensorDistance')?.value || 80) }; }
function frame(now) { if (!running) return; const dt = Math.min(0.05, (now - last) / 1000); last = now; const values = controls(); const state = analog.step(dt, values.left, values.right); const reading = sensors.update(world?.telemetry() || {}, dt, values.distance); updateTelemetry(state); updateSensorTelemetry(reading); const driveScale = reading.hcSr04.obstacleStop ? 0 : 1; world?.drive(state.left.voltage * driveScale, state.right.voltage * driveScale); requestAnimationFrame(frame); }
async function start() { if (running) return; if (!world) { world = new RobotPhysicsWorld($('physicsCanvas'), (message) => setText('physicsStatus', message)); await world.init(); } else if (!world.ready) { world.resume(); } running = true; last = performance.now(); $('physicsBadge')?.classList.add('on'); setText('physicsBadge', 'يعمل'); requestAnimationFrame(frame); }
function pause() { running = false; world?.pause(); $('physicsBadge')?.classList.remove('on'); setText('physicsBadge', 'متوقف'); }
function reset() { pause(); analog.reset(); sensors.reset(); updateTelemetry(analog.snapshot()); updateSensorTelemetry(sensors.snapshot()); world?.reset(); setText('physicsStatus', world?.ready ? 'Matter.js جاهز · تم إعادة الوضع' : 'جاهز للبدء'); }
function wire() { $('physicsStart')?.addEventListener('click', start); $('physicsPause')?.addEventListener('click', pause); $('physicsReset')?.addEventListener('click', reset); ['physicsLeft', 'physicsRight'].forEach((id) => $(id)?.addEventListener('input', () => setText(`${id}Value`, $(id).value))); $('sensorDistance')?.addEventListener('input', () => setText('sensorDistanceValue', `${$('sensorDistance').value} cm`)); updateTelemetry(analog.snapshot()); updateSensorTelemetry(sensors.snapshot()); }
wire();
window.balancebotPhysics = { start, pause, reset, analog, sensors, getWorld: () => world };
