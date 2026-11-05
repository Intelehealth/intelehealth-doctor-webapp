import { concatFloat32, encodeWav, PcmChunker } from './wav';

describe('wav utils', () => {
  const str = (view: DataView, offset: number, len: number) =>
    String.fromCharCode(...Array.from({ length: len }, (_, i) => view.getUint8(offset + i)));

  it('writes a valid PCM16 mono header', () => {
    const buf = encodeWav(new Float32Array(10), 16000);
    const view = new DataView(buf);
    expect(buf.byteLength).toBe(44 + 10 * 2);
    expect(str(view, 0, 4)).toBe('RIFF');
    expect(view.getUint32(4, true)).toBe(36 + 20);
    expect(str(view, 8, 4)).toBe('WAVE');
    expect(str(view, 12, 4)).toBe('fmt ');
    expect(view.getUint32(16, true)).toBe(16);
    expect(view.getUint16(20, true)).toBe(1);
    expect(view.getUint16(22, true)).toBe(1);
    expect(view.getUint32(24, true)).toBe(16000);
    expect(view.getUint32(28, true)).toBe(32000);
    expect(view.getUint16(32, true)).toBe(2);
    expect(view.getUint16(34, true)).toBe(16);
    expect(str(view, 36, 4)).toBe('data');
    expect(view.getUint32(40, true)).toBe(20);
  });

  it('clamps samples to the int16 range', () => {
    const view = new DataView(encodeWav(new Float32Array([1.5, -1.5, 0]), 16000));
    expect(view.getInt16(44, true)).toBe(32767);
    expect(view.getInt16(46, true)).toBe(-32768);
    expect(view.getInt16(48, true)).toBe(0);
  });

  it('concatenates blocks', () => {
    const out = concatFloat32([new Float32Array([1, 2]), new Float32Array([3])]);
    expect(Array.from(out)).toEqual([1, 2, 3]);
  });

  it('emits chunks exactly at the boundary and drains the remainder', () => {
    const chunker = new PcmChunker(5);
    expect(chunker.push(new Float32Array([1, 2, 3])).length).toBe(0);
    const chunks = chunker.push(new Float32Array([4, 5, 6]));
    expect(chunks.length).toBe(1);
    expect(Array.from(chunks[0])).toEqual([1, 2, 3, 4, 5]);
    const rest = chunker.drain();
    expect(Array.from(rest)).toEqual([6]);
    expect(chunker.drain()).toBeNull();
  });

  it('emits multiple chunks from one large push', () => {
    const chunker = new PcmChunker(2);
    const chunks = chunker.push(new Float32Array([1, 2, 3, 4, 5]));
    expect(chunks.map(c => Array.from(c))).toEqual([[1, 2], [3, 4]]);
    expect(Array.from(chunker.drain())).toEqual([5]);
  });
});
