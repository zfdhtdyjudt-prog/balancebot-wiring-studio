const OPTIONAL_WOKWI_CDN = 'https://cdn.jsdelivr.net/npm/wokwi-elements@0.52.0/+esm';
let externalWokwiLoaded = false;

class BalanceBotLed extends HTMLElement {
  constructor() { super(); this.attachShadow({ mode: 'open' }); this.on = false; }
  connectedCallback() { this.render(); this.addEventListener('click', () => { this.on = !this.on; this.render(); this.dispatchEvent(new CustomEvent('component-change', { bubbles: true, detail: { property: 'on', value: this.on } })); }); }
  render() { this.shadowRoot.innerHTML = `<style>:host{display:inline-grid;place-items:center;width:48px;height:48px;cursor:pointer}i{width:22px;height:22px;border-radius:50%;background:${this.on ? '#ff4545' : '#602d35'};box-shadow:${this.on ? '0 0 20px #ff4545' : 'none'};border:2px solid #f7c6c9}</style><i aria-label="${this.on ? 'LED on' : 'LED off'}"></i>`; }
}

class BalanceBotMotor extends HTMLElement {
  constructor() { super(); this.attachShadow({ mode: 'open' }); this.speed = 0; }
  connectedCallback() { this.render(); this.addEventListener('click', () => { this.speed = this.speed ? 0 : 180; this.render(); this.dispatchEvent(new CustomEvent('component-change', { bubbles: true, detail: { property: 'speed', value: this.speed } })); }); }
  render() { this.shadowRoot.innerHTML = `<style>:host{display:inline-flex;align-items:center;gap:6px;cursor:pointer;color:#dbeaf5;font:11px sans-serif}b{width:30px;height:30px;border:3px solid ${this.speed ? '#20c997' : '#587386'};border-radius:50%;display:grid;place-items:center;transform:rotate(${this.speed ? 180 : 0}deg);transition:transform .35s}small{font-size:10px}</style><b>↻</b><small>${this.speed ? `${this.speed} PWM` : 'متوقف'}</small>`; }
}

class BalanceBotPotentiometer extends HTMLElement {
  constructor() { super(); this.attachShadow({ mode: 'open' }); this.value = 512; }
  connectedCallback() { this.render(); }
  render() { this.shadowRoot.innerHTML = `<style>:host{display:inline-flex;align-items:center;gap:6px;color:#dbeaf5;font:11px sans-serif}input{accent-color:#e2a93b;width:100px}</style><span>WIPER</span><input type="range" min="0" max="1023" value="${this.value}"><output>${this.value}</output>`; this.shadowRoot.querySelector('input').addEventListener('input', (event) => { this.value = Number(event.target.value); this.shadowRoot.querySelector('output').textContent = this.value; this.dispatchEvent(new CustomEvent('component-change', { bubbles: true, detail: { property: 'analog', value: this.value } })); }); }
}

class BalanceBotSonar extends HTMLElement {
  constructor() { super(); this.attachShadow({ mode: 'open' }); this.distance = 80; }
  connectedCallback() { this.render(); }
  render() { this.shadowRoot.innerHTML = `<style>:host{display:inline-flex;align-items:center;gap:6px;color:#dbeaf5;font:11px sans-serif}input{accent-color:#d99e27;width:100px}</style><span>ECHO</span><input type="range" min="2" max="400" value="${this.distance}"><output>${this.distance}cm</output>`; this.shadowRoot.querySelector('input').addEventListener('input', (event) => { this.distance = Number(event.target.value); this.shadowRoot.querySelector('output').textContent = `${this.distance}cm`; this.dispatchEvent(new CustomEvent('component-change', { bubbles: true, detail: { property: 'distanceCm', value: this.distance } })); }); }
}

customElements.define('balancebot-led', BalanceBotLed);
customElements.define('balancebot-motor', BalanceBotMotor);
customElements.define('balancebot-potentiometer', BalanceBotPotentiometer);
customElements.define('balancebot-sonar', BalanceBotSonar);

async function detectOptionalWokwiElements() {
  try { await import(OPTIONAL_WOKWI_CDN); externalWokwiLoaded = true; } catch { externalWokwiLoaded = false; }
  document.dispatchEvent(new CustomEvent('balancebot-interactive-runtime', { detail: { externalWokwiLoaded, runtime: externalWokwiLoaded ? 'wokwi-elements-cdn' : 'local-web-components' } }));
}

function componentElement(type) {
  if (type.includes('led')) return 'balancebot-led';
  if (type === 'tt_motor') return 'balancebot-motor';
  if (type === 'potentiometer_10k') return 'balancebot-potentiometer';
  if (type === 'hc_sr04') return 'balancebot-sonar';
  return null;
}

function renderPlayground(data) {
  const host = document.getElementById('interactivePlayground');
  if (!host) return;
  host.innerHTML = '';
  const title = document.createElement('div'); title.className = 'interactive-runtime-note'; title.textContent = externalWokwiLoaded ? 'Wokwi Elements CDN متاح · تحكم تفاعلي' : 'Local Web Components fallback · تحكم تفاعلي'; host.append(title);
  data.components.filter((component) => componentElement(component.type)).slice(0, 8).forEach((component) => { const card = document.createElement('div'); card.className = 'interactive-card'; const label = document.createElement('b'); label.textContent = component.label || component.id; const element = document.createElement(componentElement(component.type)); element.dataset.componentId = component.id; element.addEventListener('component-change', (event) => document.dispatchEvent(new CustomEvent('balancebot-component-change', { detail: { component, ...event.detail } }))); card.append(label, element); host.append(card); });
}

document.addEventListener('balancebot-diagram-rendered', (event) => renderPlayground(event.detail.data));
document.addEventListener('balancebot-component-change', (event) => { const log = document.getElementById('interactiveEventLog'); if (log) log.textContent = `${event.detail.component.id} · ${event.detail.property} = ${event.detail.value}`; });
detectOptionalWokwiElements();
