import { CaptureBlockAccumulator, InputLevelStats, MeteredPcmChunker, rmsFromStats } from './audio-levels';

describe('audio levels', () => {
  const stat = (sumSq: number, n: number, peak: number): InputLevelStats => ({ sumSq, n, peak, connected: n > 0 });

  describe('CaptureBlockAccumulator', () => {
    it('keeps the summed mono mix and measures each input separately', () => {
      const acc = new CaptureBlockAccumulator(4);
      const local = new Float32Array([0.5, -0.5, 0.5, -0.5]);
      const remote = new Float32Array([0.1, 0.2, -0.3, 0.4]);
      const blocks = acc.process([[local], [remote]]);
      expect(blocks.length).toBe(1);
      expect(Array.from(blocks[0].samples)).toEqual(Array.from(local).map((v, i) => Math.fround(v + remote[i])));
      const [l, r] = blocks[0].stats;
      expect(l.n).toBe(4);
      expect(l.peak).toBeCloseTo(0.5, 6);
      expect(l.connected).toBeTrue();
      expect(rmsFromStats(l)).toBe(0.5);
      expect(r.peak).toBeCloseTo(0.4, 6);
      expect(r.sumSq).toBeCloseTo(0.01 + 0.04 + 0.09 + 0.16, 6);
      expect(rmsFromStats(r)).toBe(0.2739);
    });

    it('reports an unconnected input as zero samples and buffers until a block is full', () => {
      const acc = new CaptureBlockAccumulator(4);
      expect(acc.process([[new Float32Array([0.2, 0.2])], []]).length).toBe(0);
      const blocks = acc.process([[new Float32Array([0.2, 0.2, 0.2])], []]);
      expect(blocks.length).toBe(1);
      expect(Array.from(blocks[0].samples)).toEqual([0.2, 0.2, 0.2, 0.2].map(Math.fround));
      expect(blocks[0].stats[0].n).toBe(4);
      expect(blocks[0].stats[1]).toEqual({ sumSq: 0, n: 0, peak: 0, connected: false });
      expect(rmsFromStats(blocks[0].stats[1])).toBeNull();
      const next = acc.process([[new Float32Array([0, 0, 0, 0])], []]);
      expect(next[0].stats[0].n).toBe(4);
      expect(next[0].samples[0]).toBeCloseTo(0.2, 6);
    });

    it('handles empty inputs without emitting blocks', () => {
      const acc = new CaptureBlockAccumulator(4);
      expect(acc.process([])).toEqual([]);
      expect(acc.process([[], []])).toEqual([]);
    });
  });

  describe('MeteredPcmChunker', () => {
    it('splits block stats proportionally across chunk boundaries', () => {
      const chunker = new MeteredPcmChunker(10);
      expect(chunker.push(new Float32Array(6), [stat(6 * 0.04, 6, 0.3), stat(0, 6, 0)]).length).toBe(0);
      const out = chunker.push(new Float32Array(8), [stat(8 * 0.01, 8, 0.1), stat(8 * 0.25, 8, 0.6)]);
      expect(out.length).toBe(1);
      expect(out[0].samples.length).toBe(10);
      expect(out[0].levels.localRms).toBe(Math.round(Math.sqrt((0.24 + 0.04) / 10) * 10000) / 10000);
      expect(out[0].levels.localPeak).toBe(0.3);
      expect(out[0].levels.remoteRms).toBe(Math.round(Math.sqrt(1 / 10) * 10000) / 10000);
      expect(out[0].levels.remotePeak).toBe(0.6);
      const tail = chunker.drain();
      expect(tail.samples.length).toBe(4);
      expect(tail.levels.localRms).toBe(0.1);
      expect(tail.levels.remoteRms).toBe(0.5);
      expect(chunker.drain()).toBeNull();
    });

    it('emits null levels when no stats were provided', () => {
      const chunker = new MeteredPcmChunker(4);
      const out = chunker.push(new Float32Array(9), null);
      expect(out.map(c => c.levels)).toEqual([null, null]);
      expect(chunker.drain().levels).toBeNull();
    });

    it('reports null for a side that never had samples', () => {
      const chunker = new MeteredPcmChunker(4);
      const out = chunker.push(new Float32Array(4), [stat(4 * 0.09, 4, 0.3), stat(0, 0, 0)]);
      expect(out[0].levels).toEqual({ localRms: 0.3, localPeak: 0.3, remoteRms: null, remotePeak: null });
    });
  });
});
