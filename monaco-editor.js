const MONACO_LOADER = 'https://cdn.jsdelivr.net/npm/monaco-editor@0.52.2/min/vs/loader.js';

export class MonacoSourceEditor {
  constructor({ host, fallback, initialValue, language = 'cpp' }) {
    this.host = host;
    this.fallback = fallback;
    this.initialValue = initialValue;
    this.language = language;
    this.editor = null;
    this.ready = false;
  }

  async mount() {
    if (this.ready) return this;
    try {
      await this.loadScript(MONACO_LOADER);
      const monaco = await new Promise((resolve, reject) => {
        window.require.config({ paths: { vs: 'https://cdn.jsdelivr.net/npm/monaco-editor@0.52.2/min/vs' } });
        window.require(['vs/editor/editor.main'], () => resolve(window.monaco), reject);
      });
      this.editor = monaco.editor.create(this.host, { value: this.initialValue, language: this.language, theme: 'vs-dark', automaticLayout: true, minimap: { enabled: false }, fontSize: 13, wordWrap: 'on', scrollBeyondLastLine: false });
      this.fallback.hidden = true;
      this.ready = true;
    } catch (error) {
      this.host.hidden = true;
      this.fallback.hidden = false;
      this.fallback.value = this.initialValue;
      this.ready = true;
      this.fallback.dataset.editorError = error.message;
    }
    return this;
  }

  loadScript(src) {
    return new Promise((resolve, reject) => {
      const existing = document.querySelector(`script[src="${src}"]`);
      if (existing) { existing.addEventListener('load', resolve, { once: true }); existing.addEventListener('error', reject, { once: true }); if (window.require) resolve(); return; }
      const script = document.createElement('script');
      script.src = src;
      script.onload = resolve;
      script.onerror = () => reject(new Error('تعذر تحميل Monaco Editor من CDN.'));
      document.head.appendChild(script);
    });
  }

  getValue() { return this.editor ? this.editor.getValue() : this.fallback.value; }
  setValue(value) { if (this.editor) this.editor.setValue(value); else this.fallback.value = value; }
  onChange(callback) { if (this.editor) this.editor.onDidChangeModelContent(() => callback(this.getValue())); else this.fallback.addEventListener('input', () => callback(this.getValue())); }
}
