import { PcmChunker } from './wav';

export const LOCAL_INPUT = 0;
export const REMOTE_INPUT = 1;

export interface InputLevelStats {
  sumSq: number;
  n: number;
  peak: number;
  connected: boolean;
}

export interface CaptureBlock {
  samples: Float32Array;
  stats: InputLevelStats[];
}

export interface ChunkLevels {
  localRms: number | null;
  localPeak: number | null;
  remoteRms: number | null;
  remotePeak: number | null;
}

export interface MeteredChunk {
  samples: Float32Array;
  levels: ChunkLevels | null;
}

export class CaptureBlockAccumulator {
  private buf: Float32Array;
  private index = 0;
  private sumSq: number[] = [];
  private count: number[] = [];
  private peak: number[] = [];
  private connected: boolean[] = [];

  constructor(private size = 2048) {
    this.buf = new Float32Array(size);
  }

  process(inputs: ArrayLike<ArrayLike<number>>[]): CaptureBlock[] {
    const blocks: CaptureBlock[] = [];
    const inputCount = inputs.length;
    while (this.sumSq.length < inputCount) {
      this.sumSq.push(0);
      this.count.push(0);
      this.peak.push(0);
      this.connected.push(false);
    }
    let frames = 0;
    for (let k = 0; k < inputCount; k++) {
      const channel = inputs[k] && inputs[k][0];
      if (channel && channel.length > frames) frames = channel.length;
    }
    for (let i = 0; i < frames; i++) {
      let sum = 0;
      for (let k = 0; k < inputCount; k++) {
        const channel = inputs[k] && inputs[k][0];
        if (channel && i < channel.length) {
          const v = channel[i];
          sum += v;
          this.sumSq[k] += v * v;
          this.count[k]++;
          const abs = v < 0 ? -v : v;
          if (abs > this.peak[k]) this.peak[k] = abs;
          this.connected[k] = true;
        }
      }
      this.buf[this.index++] = sum;
      if (this.index === this.size) {
        blocks.push({ samples: this.buf, stats: this.collectStats() });
        this.buf = new Float32Array(this.size);
        this.index = 0;
      }
    }
    return blocks;
  }

  private collectStats(): InputLevelStats[] {
    const stats: InputLevelStats[] = [];
    for (let k = 0; k < this.sumSq.length; k++) {
      stats.push({ sumSq: this.sumSq[k], n: this.count[k], peak: this.peak[k], connected: this.connected[k] });
      this.sumSq[k] = 0;
      this.count[k] = 0;
      this.peak[k] = 0;
      this.connected[k] = false;
    }
    return stats;
  }
}

export function roundLevel(value: number): number {
  return Math.round(value * 10000) / 10000;
}

export function rmsFromStats(stats: Pick<InputLevelStats, 'sumSq' | 'n'> | null | undefined): number | null {
  if (!stats || !(stats.n > 0)) return null;
  return roundLevel(Math.sqrt(stats.sumSq / stats.n));
}

interface SideAccumulator {
  sumSq: number;
  n: number;
  peak: number;
}

const emptySide = (): SideAccumulator => ({ sumSq: 0, n: 0, peak: 0 });

export class MeteredPcmChunker {
  private pcm: PcmChunker;
  private filled = 0;
  private local = emptySide();
  private remote = emptySide();
  private metered = false;

  constructor(private samplesPerChunk: number) {
    this.pcm = new PcmChunker(samplesPerChunk);
  }

  push(block: Float32Array, stats?: InputLevelStats[] | null): MeteredChunk[] {
    const chunks = this.pcm.push(block);
    const levels: (ChunkLevels | null)[] = [];
    const total = block.length;
    let remaining = total;
    while (this.filled + remaining >= this.samplesPerChunk) {
      const portionInCurrentChunk = this.samplesPerChunk - this.filled;
      this.addProportionalStats(stats, portionInCurrentChunk / total);
      levels.push(this.takeLevels());
      this.filled = 0;
      remaining -= portionInCurrentChunk;
    }
    if (remaining > 0) {
      this.addProportionalStats(stats, remaining / total);
      this.filled += remaining;
    }
    return chunks.map((samples, i) => ({ samples, levels: levels[i] ?? null }));
  }

  drain(): MeteredChunk | null {
    const samples = this.pcm.drain();
    const levels = this.takeLevels();
    this.filled = 0;
    return samples ? { samples, levels } : null;
  }

  private addProportionalStats(stats: InputLevelStats[] | null | undefined, fraction: number): void {
    if (!stats || !stats.length || !(fraction > 0)) return;
    this.metered = true;
    this.addSide(this.local, stats[LOCAL_INPUT], fraction);
    this.addSide(this.remote, stats[REMOTE_INPUT], fraction);
  }

  private addSide(side: SideAccumulator, stats: InputLevelStats | undefined, fraction: number): void {
    if (!stats || !(stats.n > 0)) return;
    side.sumSq += stats.sumSq * fraction;
    side.n += stats.n * fraction;
    if (stats.peak > side.peak) side.peak = stats.peak;
  }

  private takeLevels(): ChunkLevels | null {
    const levels = this.metered ? {
      localRms: rmsFromStats(this.local),
      localPeak: this.local.n > 0 ? roundLevel(this.local.peak) : null,
      remoteRms: rmsFromStats(this.remote),
      remotePeak: this.remote.n > 0 ? roundLevel(this.remote.peak) : null
    } : null;
    this.local = emptySide();
    this.remote = emptySide();
    this.metered = false;
    return levels;
  }
}
