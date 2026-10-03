import { CompileService } from './compile-service.js';
import { parseHexResponse } from './intel-hex.js';
import { Avr8jsRunner } from './avr8js-runner.js';
import { MonacoSourceEditor } from './monaco-editor.js';

export class DigitalCore {
  constructor({ editorHost, fallback, status, log, sketch, compilerEndpoint = '/api/compile' }) {
    this.status = status;
    this.log = log;
    this.compileService = new CompileService({ endpoint: compilerEndpoint });
    this.editor = new MonacoSourceEditor({ host: editorHost, fallback, initialValue: sketch });
    this.runner = new Avr8jsRunner({ onPortChange: (event) => this.handlePort(event), onStateChange: (event) => this.handleState(event) });
    this.lastHex = null;
    this.abortController = null;
  }

  async mount() {
    await this.editor.mount();
    this.editor.onChange(() => this.setStatus('كود Arduino جاهز للتجميع', 'ready'));
    this.setStatus('محرر الكود جاهز', 'ready');
  }

  async compile() {
    this.abortController?.abort();
    this.abortController = new AbortController();
    this.setStatus('جارٍ إرسال الكود إلى خدمة التجميع…', 'busy');
    this.log('compile:start');
    try {
      const payload = await this.compileService.compileArduinoCode(this.editor.getValue(), { signal: this.abortController.signal });
      this.lastHex = parseHexResponse(payload);
      this.setStatus(`تم التجميع: ${this.lastHex.words.length} كلمة Flash`, 'success');
      this.log(`compile:success bytes=${this.lastHex.bytes.length}`);
      return this.lastHex;
    } catch (error) {
      if (error.name === 'AbortError') return null;
      this.setStatus(`فشل التجميع: ${error.message}`, 'error');
      this.log(`compile:error ${error.message}`);
      throw error;
    }
  }

  async loadLastHex() {
    if (!this.lastHex) throw new Error('Compile the sketch before loading the AVR emulator.');
    this.setStatus('جارٍ تحميل avr8js…', 'busy');
    await this.runner.load(this.lastHex);
    this.setStatus('تم تحميل ATmega328P الافتراضي', 'success');
    this.log('avr8js:loaded atmega328p');
  }

  async compileAndLoad() { await this.compile(); await this.loadLastHex(); }
  run() { this.runner.start(); this.setStatus('المعالج يعمل داخل المتصفح', 'success'); this.log('avr8js:run'); }
  pause() { this.runner.pause(); this.setStatus('المعالج متوقف مؤقتًا', 'ready'); this.log('avr8js:pause'); }
  step(cycles = 16000) { const executed = this.runner.executeCycles(cycles); this.log(`avr8js:step cycles=${executed}`); return executed; }

  handlePort(event) {
    this.log(`gpio:PORT${event.port}=0b${event.value.toString(2).padStart(8, '0')}`);
    document.dispatchEvent(new CustomEvent('balancebot-gpio-change', { detail: event }));
  }

  handleState(event) { document.dispatchEvent(new CustomEvent('balancebot-digital-state', { detail: event })); }
  setStatus(message, kind) { this.status.textContent = message; this.status.dataset.kind = kind; }
}
