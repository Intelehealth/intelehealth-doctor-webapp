export function encodeWav(samples: Float32Array, sampleRate: number): ArrayBuffer {
  const buffer = new ArrayBuffer(44 + samples.length * 2);
  const view = new DataView(buffer);
  const writeString = (offset: number, value: string) => {
    for (let i = 0; i < value.length; i++) {
      view.setUint8(offset + i, value.charCodeAt(i));
    }
  };
  writeString(0, 'RIFF');
  view.setUint32(4, 36 + samples.length * 2, true);
  writeString(8, 'WAVE');
  writeString(12, 'fmt ');
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, 1, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * 2, true);
  view.setUint16(32, 2, true);
  view.setUint16(34, 16, true);
  writeString(36, 'data');
  view.setUint32(40, samples.length * 2, true);
  let offset = 44;
  for (let i = 0; i < samples.length; i++, offset += 2) {
    const s = Math.max(-1, Math.min(1, samples[i]));
    view.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7fff, true);
  }
  return buffer;
}

export function concatFloat32(blocks: Float32Array[]): Float32Array {
  const total = blocks.reduce((sum, b) => sum + b.length, 0);
  const out = new Float32Array(total);
  let offset = 0;
  for (const b of blocks) {
    out.set(b, offset);
    offset += b.length;
  }
  return out;
}

export class PcmChunker {
  private blocks: Float32Array[] = [];
  private length = 0;

  constructor(private samplesPerChunk: number) { }

  push(block: Float32Array): Float32Array[] {
    const chunks: Float32Array[] = [];
    let rest = block;
    while (this.length + rest.length >= this.samplesPerChunk) {
      const need = this.samplesPerChunk - this.length;
      this.blocks.push(rest.subarray(0, need));
      chunks.push(concatFloat32(this.blocks));
      this.blocks = [];
      this.length = 0;
      rest = rest.subarray(need);
    }
    if (rest.length) {
      this.blocks.push(rest.slice());
      this.length += rest.length;
    }
    return chunks;
  }

  drain(): Float32Array | null {
    if (!this.length) return null;
    const out = concatFloat32(this.blocks);
    this.blocks = [];
    this.length = 0;
    return out;
  }
}
