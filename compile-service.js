export class CompileService {
  constructor({ endpoint = '/api/compile', fetchImpl = globalThis.fetch } = {}) {
    this.endpoint = endpoint;
    this.fetchImpl = fetchImpl;
  }

  async compileArduinoCode(sketchCode, { signal, board = 'arduino:avr:uno' } = {}) {
    if (typeof sketchCode !== 'string' || sketchCode.trim() === '') throw new Error('اكتب كود Arduino أولًا.');
    const response = await this.fetchImpl(this.endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({ board, code: sketchCode }),
      signal,
    });
    let payload;
    try { payload = await response.json(); } catch { throw new Error(`Compiler returned non-JSON HTTP ${response.status}.`); }
    if (!response.ok || payload.ok === false) {
      const details = payload.buildErrors || payload.error || `Compiler returned HTTP ${response.status}.`;
      throw new Error(details);
    }
    if (typeof payload.hex !== 'string') throw new Error('Compiler response is missing the hex field.');
    return payload;
  }
}
