export function parseIntelHex(text, flashBytes = 32768) {
  if (typeof text !== 'string' || text.trim() === '') throw new Error('Intel HEX output is empty.');
  const bytes = new Uint8Array(flashBytes);
  bytes.fill(0xff);
  let baseAddress = 0;
  let sawData = false;
  let sawEnd = false;
  const lines = text.replace(/\r/g, '').split('\n').map((line) => line.trim()).filter(Boolean);
  for (const [index, line] of lines.entries()) {
    if (!line.startsWith(':')) throw new Error(`Intel HEX line ${index + 1} must start with ':'.`);
    if (line.length < 11 || (line.length - 1) % 2 !== 0) throw new Error(`Intel HEX line ${index + 1} has an invalid length.`);
    const raw = line.slice(1);
    const record = new Uint8Array(raw.length / 2);
    for (let i = 0; i < record.length; i += 1) {
      const pair = raw.slice(i * 2, i * 2 + 2);
      const value = Number.parseInt(pair, 16);
      if (!Number.isInteger(value)) throw new Error(`Intel HEX line ${index + 1} contains invalid hexadecimal data.`);
      record[i] = value;
    }
    const byteCount = record[0];
    if (record.length !== byteCount + 5) throw new Error(`Intel HEX line ${index + 1} byte count is inconsistent.`);
    let checksum = 0;
    for (const value of record) checksum = (checksum + value) & 0xff;
    if (checksum !== 0) throw new Error(`Intel HEX line ${index + 1} has a checksum error.`);
    const address = (record[1] << 8) | record[2];
    const type = record[3];
    if (type === 0x00) {
      const absolute = baseAddress + address;
      for (let i = 0; i < byteCount; i += 1) {
        const target = absolute + i;
        if (target >= bytes.length) throw new Error(`Intel HEX data exceeds the configured AVR flash size at 0x${target.toString(16)}.`);
        bytes[target] = record[4 + i];
      }
      sawData = true;
    } else if (type === 0x01) {
      if (byteCount !== 0) throw new Error('Intel HEX EOF record must contain zero data bytes.');
      sawEnd = true;
    } else if (type === 0x02) {
      if (byteCount !== 2) throw new Error('Intel HEX extended segment address record must contain two data bytes.');
      baseAddress = ((record[4] << 8) | record[5]) << 4;
    } else if (type === 0x04) {
      if (byteCount !== 2) throw new Error('Intel HEX extended linear address record must contain two data bytes.');
      baseAddress = ((record[4] << 8) | record[5]) << 16;
    } else if (type !== 0x03 && type !== 0x05) {
      throw new Error(`Intel HEX record type 0x${type.toString(16).padStart(2, '0')} is not supported.`);
    }
  }
  if (!sawData) throw new Error('Intel HEX contains no data records.');
  if (!sawEnd) throw new Error('Intel HEX is missing its EOF record.');
  const words = new Uint16Array(Math.ceil(bytes.length / 2));
  for (let i = 0; i < words.length; i += 1) words[i] = bytes[i * 2] | (bytes[i * 2 + 1] << 8);
  return { bytes, words };
}

export function parseHexResponse(payload) {
  if (!payload || typeof payload !== 'object') throw new Error('Compiler response must be a JSON object.');
  if (typeof payload.hex !== 'string') throw new Error(payload.buildErrors || 'Compiler response does not contain Intel HEX.');
  return parseIntelHex(payload.hex, Number(payload.flashBytes) || 32768);
}
