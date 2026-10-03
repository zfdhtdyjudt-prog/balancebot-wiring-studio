import { AnalogEngine } from './analog-engine.js';
import { RobotPhysicsWorld } from './physics-world.js';

const $ = (id) => document.getElementById(id);
const analog = new AnalogEngine();
let world = null;
let running = false;
let last = performance.now();

function setText(id, value) { const node = $(id); if (node) node.textContent = value; }
function updateTelemetry(state) { setText('analogSupply', `${state.supplyVoltage.toFixed(2)} V`); setText('analogCapacitor', `${state.capacitorVoltage.toFixed(2)} V`); setText('analogLeft', `${state.left.rpm.toFixed(0)} RPM · ${state.left.voltage.toFixed(2)} V`); setText('analogRight', `${state.right.rpm.toFixed(0)} RPM · ${state.right.voltage.toFixed(2)} V`); setText('analogCurrent', `${state.totalCurrent.toFixed(2)} A`); }
function controls() { return { left: Number($('physicsLeft')?.value || 0), right: Number($('physicsRight')?.value || 0) }; }
function frame(now) { if (!running) return; const dt = Math.min(0.05, (now - last) / 1000); last = now; const values = controls(); const state = analog.step(dt, values.left, values.right); updateTelemetry(state); world?.drive(state.left.voltage, state.right.voltage); requestAnimationFrame(frame); }
async function start() { if (running) return; if (!world) { world = new RobotPhysicsWorld($('physicsCanvas'), (message) => setText('physicsStatus', message)); await world.init(); } else if (!world.ready) { world.resume(); } running = true; last = performance.now(); $('physicsBadge')?.classList.add('on'); setText('physicsBadge', 'يعمل'); requestAnimationFrame(frame); }
function pause() { running = false; world?.pause(); $('physicsBadge')?.classList.remove('on'); setText('physicsBadge', 'متوقف'); }
function reset() { pause(); analog.reset(); updateTelemetry(analog.snapshot()); world?.reset(); setText('physicsStatus', world?.ready ? 'Matter.js جاهز · تم إعادة الوضع' : 'جاهز للبدء'); }
function wire() { $('physicsStart')?.addEventListener('click', start); $('physicsPause')?.addEventListener('click', pause); $('physicsReset')?.addEventListener('click', reset); ['physicsLeft', 'physicsRight'].forEach((id) => $(id)?.addEventListener('input', () => setText(`${id}Value`, $(id).value))); updateTelemetry(analog.snapshot()); }
wire();
window.balancebotPhysics = { start, pause, reset, analog, getWorld: () => world };
