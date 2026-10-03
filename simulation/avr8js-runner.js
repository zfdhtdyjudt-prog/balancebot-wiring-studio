const AVR8JS_URL = 'https://cdn.jsdelivr.net/npm/avr8js@1.2.1/dist/esm/index.js';

export class Avr8jsRunner {
  constructor({ onPortChange = () => {}, onStateChange = () => {}, moduleUrl = AVR8JS_URL } = {}) {
    this.onPortChange = onPortChange;
    this.onStateChange = onStateChange;
    this.moduleUrl = moduleUrl;
    this.module = null;
    this.cpu = null;
    this.program = null;
    this.running = false;
    this.portValues = { B: 0, C: 0, D: 0 };
  }

  async load(hexImage) {
    if (!hexImage?.words || !(hexImage.words instanceof Uint16Array)) throw new Error('AVR runner requires parsed flash words.');
    this.module = this.module || await import(this.moduleUrl);
    const { CPU, AVRGPIO, portBConfig, portCConfig, portDConfig } = this.module;
    if (!CPU || !AVRGPIO || !portBConfig || !portCConfig || !portDConfig) throw new Error('The avr8js CDN module does not expose the expected AVR API.');
    this.program = new Uint16Array(16384);
    this.program.set(hexImage.words.subarray(0, this.program.length));
    this.cpu = new CPU(this.program);
    this.portValues = { B: 0, C: 0, D: 0 };
    this.attachPort('B', new AVRGPIO(this.cpu, portBConfig));
    this.attachPort('C', new AVRGPIO(this.cpu, portCConfig));
    this.attachPort('D', new AVRGPIO(this.cpu, portDConfig));
    this.onStateChange({ state: 'loaded', cycles: this.cpu.cycles || 0 });
  }

  attachPort(name, port) {
    port.addListener((value, oldValue) => {
      const next = Number(value) & 0xff;
      const previous = Number(oldValue) & 0xff;
      this.portValues[name] = next;
      this.onPortChange({ port: name, value: next, previous, changedMask: next ^ previous, pins: this.mapPortPins(name, next) });
    });
  }

  mapPortPins(port, value) {
    const pins = {};
    const ranges = { B: [8, 6], C: [14, 6], D: [0, 8] };
    const [start, count] = ranges[port];
    for (let bit = 0; bit < count; bit += 1) pins[start + bit] = Boolean(value & (1 << bit));
    return pins;
  }

  executeCycles(cycles) {
    if (!this.cpu || !this.module) throw new Error('Load a compiled HEX image before executing cycles.');
    const { avrInstruction } = this.module;
    const bounded = Math.max(0, Math.min(Math.floor(cycles), 2_000_000));
    for (let index = 0; index < bounded; index += 1) {
      avrInstruction(this.cpu);
      this.cpu.tick();
    }
    this.onStateChange({ state: 'paused', cycles: this.cpu.cycles || 0, executed: bounded });
    return bounded;
  }

  start({ cyclesPerFrame = 16000 } = {}) {
    if (this.running) return;
    this.running = true;
    this.onStateChange({ state: 'running', cycles: this.cpu?.cycles || 0 });
    const frame = () => {
      if (!this.running) return;
      try { this.executeCycles(cyclesPerFrame); } catch (error) { this.running = false; this.onStateChange({ state: 'error', error }); return; }
      requestAnimationFrame(frame);
    };
    requestAnimationFrame(frame);
  }

  pause() {
    this.running = false;
    this.onStateChange({ state: 'paused', cycles: this.cpu?.cycles || 0 });
  }

  getDigitalPin(pin) {
    if (pin >= 8 && pin <= 13) return Boolean(this.portValues.B & (1 << (pin - 8)));
    if (pin >= 14 && pin <= 19) return Boolean(this.portValues.C & (1 << (pin - 14)));
    if (pin >= 0 && pin <= 7) return Boolean(this.portValues.D & (1 << pin));
    throw new Error(`Arduino digital pin ${pin} is not mapped.`);
  }
}
