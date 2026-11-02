class VoicedocCapture extends AudioWorkletProcessor {
  constructor() {
    super();
    this.size = 2048;
    this.buf = new Float32Array(this.size);
    this.index = 0;
    this.sumSq = [];
    this.count = [];
    this.peak = [];
    this.connected = [];
  }

  process(inputs) {
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
        this.port.postMessage({ samples: this.buf, stats: this.collectStats() }, [this.buf.buffer]);
        this.buf = new Float32Array(this.size);
        this.index = 0;
      }
    }
    return true;
  }

  collectStats() {
    const stats = [];
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

registerProcessor('voicedoc-capture', VoicedocCapture);
