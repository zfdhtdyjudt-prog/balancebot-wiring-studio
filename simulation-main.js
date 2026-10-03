import { DigitalCore } from './digital-core.js';
import { defaultSketch } from './default-sketch.js';

const byId = (id) => document.getElementById(id);
const appendLog = (message) => { const target = byId('digitalLog'); if (!target) return; const line = document.createElement('div'); line.textContent = `${new Date().toLocaleTimeString()} · ${message}`; target.prepend(line); while (target.children.length > 40) target.lastElementChild.remove(); };
const core = new DigitalCore({ editorHost: byId('monacoHost'), fallback: byId('arduinoSource'), status: byId('digitalStatus'), log: appendLog, sketch: defaultSketch, compilerEndpoint: document.body.dataset.compileEndpoint || '/api/compile' });

async function start() {
  await core.mount();
  byId('digitalCompile').addEventListener('click', () => core.compileAndLoad().catch(() => {}));
  byId('digitalRun').addEventListener('click', () => { try { core.run(); } catch (error) { core.setStatus(error.message, 'error'); appendLog(`run:error ${error.message}`); } });
  byId('digitalPause').addEventListener('click', () => core.pause());
  byId('digitalStep').addEventListener('click', () => { try { core.step(); } catch (error) { core.setStatus(error.message, 'error'); appendLog(`step:error ${error.message}`); } });
  document.addEventListener('balancebot-gpio-change', (event) => { const pins = event.detail.pins; byId('digitalGpio').textContent = Object.entries(pins).map(([pin, state]) => `D${pin}:${state ? 'HIGH' : 'LOW'}`).join(' · '); });
  appendLog('phase1:ready');
}

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start, { once: true }); else start();
