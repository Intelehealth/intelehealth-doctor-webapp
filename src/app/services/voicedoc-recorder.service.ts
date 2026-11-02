import { Injectable, NgZone } from '@angular/core';
import { Room, RoomEvent, Track } from 'livekit-client';
import { WebrtcService } from './webrtc.service';
import { VoicedocService, VoicedocSessionRequest } from './voicedoc.service';
import { encodeWav } from '../utils/wav';
import { CaptureBlock, InputLevelStats, LOCAL_INPUT, MeteredChunk, MeteredPcmChunker, REMOTE_INPUT } from '../utils/audio-levels';

const SAMPLE_RATE = 16000;
const SAMPLES_PER_CHUNK = SAMPLE_RATE * 10;
const MIN_TAIL_SAMPLES = SAMPLE_RATE / 2;
const RETRY_DELAYS = [1000, 2000, 4000];
const WORKLET_URL = 'assets/js/voicedoc-capture.worklet.js';
const ROOM_EVENTS = [
  RoomEvent.TrackSubscribed,
  RoomEvent.TrackUnsubscribed,
  RoomEvent.LocalTrackPublished,
  RoomEvent.LocalTrackUnpublished,
  RoomEvent.Reconnected
];

interface QueuedChunk {
  blob: Blob;
  chunkNumber: number;
  fields?: Record<string, string>;
}

interface AttachedSource {
  node: MediaStreamAudioSourceNode;
  remote: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class VoicedocRecorderService {
  private active = false;
  private generation = 0;
  private ctx: AudioContext | null = null;
  private sink: AudioNode | null = null;
  private mute: GainNode | null = null;
  private sources = new Map<string, AttachedSource>();
  private splitInputs = false;
  private chunker: MeteredPcmChunker | null = null;
  private room: Room | null = null;
  private syncTimer: any = null;
  private sessionPromise: Promise<string | null> | null = null;
  private sessionId: string | null = null;
  private queue: QueuedChunk[] = [];
  private chunkNumber = 0;
  private processing = false;
  private draining: Promise<void> | null = null;
  private stopping: Promise<void> | null = null;
  private disabled = false;
  private ended = false;
  private failed = 0;
  private warned = false;

  private onRoomChange = () => this.syncSources();

  private onBeforeUnload = () => {
    this.flush();
    if (this.sessionId && !this.ended) {
      this.voicedocSvc.endSessionKeepalive(this.sessionId);
    }
  };

  constructor(
    private webrtcSvc: WebrtcService,
    private voicedocSvc: VoicedocService,
    private ngZone: NgZone
  ) { }

  async start(opts: VoicedocSessionRequest): Promise<void> {
    if (this.active) return;
    this.active = true;
    const gen = ++this.generation;
    if (this.stopping) {
      await this.stopping;
      if (gen !== this.generation) return;
    }
    this.resetState();
    this.chunker = new MeteredPcmChunker(SAMPLES_PER_CHUNK);
    this.sessionPromise = this.voicedocSvc.createSession(opts).toPromise()
      .then(res => {
        this.sessionId = res?.data?.sessionId || null;
        return this.sessionId;
      })
      .catch(err => {
        if (err?.status === 403 && gen === this.generation) {
          this.disabled = true;
          this.releaseCapture();
        }
        return null;
      });
    window.addEventListener('beforeunload', this.onBeforeUnload);

    try {
      const ctx = new AudioContext({ sampleRate: SAMPLE_RATE });
      this.ctx = ctx;
      await Promise.race([
        ctx.resume().catch(() => {}),
        new Promise(resolve => setTimeout(resolve, 1000))
      ]);
      if (gen !== this.generation || this.disabled) return;

      let sink: AudioNode = null;
      try {
        await ctx.audioWorklet.addModule(WORKLET_URL);
        if (gen !== this.generation || this.disabled) return;
        this.ngZone.runOutsideAngular(() => {
          const node = new AudioWorkletNode(ctx, 'voicedoc-capture', {
            numberOfInputs: 2,
            numberOfOutputs: 1,
            channelCount: 1,
            channelCountMode: 'explicit',
            channelInterpretation: 'speakers'
          });
          node.port.onmessage = (e: MessageEvent) => this.onWorkletMessage(e.data);
          sink = node;
        });
        this.splitInputs = true;
      } catch (_e) {
        if (gen !== this.generation || this.disabled) return;
        this.ngZone.runOutsideAngular(() => {
          const node = ctx.createScriptProcessor(4096, 1, 1);
          node.onaudioprocess = (e: AudioProcessingEvent) => this.onBlock(new Float32Array(e.inputBuffer.getChannelData(0)), null);
          sink = node;
        });
        this.splitInputs = false;
      }

      const mute = ctx.createGain();
      mute.gain.value = 0;
      sink.connect(mute);
      mute.connect(ctx.destination);
      this.sink = sink;
      this.mute = mute;

      this.room = this.webrtcSvc.room || null;
      ROOM_EVENTS.forEach(evt => this.room?.on(evt as any, this.onRoomChange));
      this.ngZone.runOutsideAngular(() => {
        this.syncTimer = setInterval(() => this.syncSources(), 2000);
      });
      this.syncSources();
    } catch (err) {
      this.warnOnce('voicedoc: audio capture unavailable', err);
    }
  }

  stop(): Promise<void> {
    if (!this.active) return this.stopping || Promise.resolve();
    this.active = false;
    this.generation++;
    this.stopping = this.teardown().catch(() => {}).then(() => {
      this.stopping = null;
    });
    return this.stopping;
  }

  async idle(): Promise<void> {
    while (this.processing && this.draining) {
      await this.draining;
    }
  }

  private async teardown(): Promise<void> {
    window.removeEventListener('beforeunload', this.onBeforeUnload);
    this.flush();
    await this.releaseCapture();
    await this.idle();
    const sessionId = this.sessionPromise ? await this.sessionPromise : null;
    if (sessionId && !this.ended) {
      this.voicedocSvc.endSession(sessionId).subscribe({ error: () => {} });
    }
    if (this.failed) {
      console.warn(`voicedoc: ${this.failed} chunk(s) failed to upload`);
    }
    this.resetState();
  }

  private async releaseCapture(): Promise<void> {
    if (this.room) {
      ROOM_EVENTS.forEach(evt => this.room.off(evt as any, this.onRoomChange));
    }
    this.room = null;
    clearInterval(this.syncTimer);
    this.syncTimer = null;
    this.sources.forEach(source => {
      try { source.node.disconnect(); } catch (_e) {}
    });
    this.sources.clear();
    try { this.sink?.disconnect(); } catch (_e) {}
    try { this.mute?.disconnect(); } catch (_e) {}
    this.sink = null;
    this.mute = null;
    this.chunker = null;
    const ctx = this.ctx;
    this.ctx = null;
    if (ctx && ctx.state !== 'closed') {
      try { await ctx.close(); } catch (_e) {}
    }
  }

  private resetState(): void {
    this.ctx = null;
    this.sink = null;
    this.mute = null;
    this.sources.clear();
    this.splitInputs = false;
    this.chunker = null;
    this.room = null;
    this.syncTimer = null;
    this.sessionPromise = null;
    this.sessionId = null;
    this.queue = [];
    this.chunkNumber = 0;
    this.disabled = false;
    this.ended = false;
    this.failed = 0;
    this.warned = false;
  }

  private flush(): void {
    const rest = this.chunker?.drain();
    if (rest && rest.samples.length >= MIN_TAIL_SAMPLES) {
      this.enqueueChunk(rest);
    }
  }

  private syncSources(): void {
    const ctx = this.ctx;
    const room = this.webrtcSvc.room;
    if (!ctx || !this.sink || ctx.state === 'closed') return;
    const tracks = new Map<string, { track: MediaStreamTrack; remote: boolean }>();
    const add = (track: MediaStreamTrack | undefined, remote: boolean) => {
      if (track && track.kind === 'audio' && track.readyState === 'live' && !tracks.has(track.id)) {
        tracks.set(track.id, { track, remote });
      }
    };
    add(room?.localParticipant?.getTrackPublication(Track.Source.Microphone)?.track?.mediaStreamTrack, false);
    room?.remoteParticipants?.forEach(participant => {
      participant.audioTrackPublications.forEach(pub => add(pub.track?.mediaStreamTrack, true));
    });
    this.sources.forEach((source, id) => {
      const wanted = tracks.get(id);
      if (!wanted || wanted.remote !== source.remote) {
        try { source.node.disconnect(); } catch (_e) {}
        this.sources.delete(id);
      }
    });
    tracks.forEach(({ track, remote }, id) => {
      if (this.sources.has(id)) return;
      try {
        const node = ctx.createMediaStreamSource(new MediaStream([track]));
        if (this.splitInputs) {
          node.connect(this.sink, 0, remote ? REMOTE_INPUT : LOCAL_INPUT);
        } else {
          node.connect(this.sink);
        }
        this.sources.set(id, { node, remote });
      } catch (err) {
        this.warnOnce('voicedoc: could not attach audio track', err);
      }
    });
  }

  private onWorkletMessage(data: CaptureBlock | Float32Array): void {
    if (data instanceof Float32Array) {
      this.onBlock(data, null);
    } else {
      this.onBlock(data?.samples, data?.stats ?? null);
    }
  }

  private onBlock(block: Float32Array, stats: InputLevelStats[] | null): void {
    if (!this.chunker || !block?.length) return;
    this.chunker.push(block, stats).forEach(chunk => this.enqueueChunk(chunk));
  }

  private enqueueChunk(chunk: MeteredChunk): void {
    const fields: Record<string, string> = {};
    if (chunk.levels) {
      Object.entries(chunk.levels).forEach(([key, value]) => {
        if (value !== null && value !== undefined) fields[key] = value.toFixed(4);
      });
    }
    let localSources = 0;
    let remoteSources = 0;
    this.sources.forEach(source => source.remote ? remoteSources++ : localSources++);
    fields.localSources = String(localSources);
    fields.remoteSources = String(remoteSources);
    this.enqueue(new Blob([encodeWav(chunk.samples, SAMPLE_RATE)], { type: 'audio/wav' }), fields);
  }

  private enqueue(blob: Blob, fields?: Record<string, string>): void {
    if (this.disabled || this.ended) return;
    this.queue.push({ blob, chunkNumber: ++this.chunkNumber, fields });
    if (this.processing) return;
    this.processing = true;
    this.draining = this.processQueue();
  }

  private async processQueue(): Promise<void> {
    try {
      const sessionId = this.sessionPromise ? await this.sessionPromise : null;
      if (!sessionId) {
        this.disabled = true;
        this.queue = [];
        this.warnOnce('voicedoc: session could not be created, transcription disabled');
        return;
      }
      while (this.queue.length && !this.ended) {
        await this.upload(sessionId, this.queue.shift());
      }
    } finally {
      this.processing = false;
    }
  }

  private async upload(sessionId: string, item: QueuedChunk): Promise<void> {
    for (let attempt = 0; attempt <= RETRY_DELAYS.length; attempt++) {
      try {
        await this.voicedocSvc.uploadChunk(sessionId, item.blob, item.chunkNumber, item.fields).toPromise();
        return;
      } catch (err) {
        const status = err?.status ?? 0;
        if (status === 409 || status === 403) {
          this.ended = true;
          this.queue = [];
          if (status === 403) {
            this.disabled = true;
            this.releaseCapture();
          }
          return;
        }
        const retriable = status === 0 || status === 429 || status >= 500;
        if (!retriable || attempt === RETRY_DELAYS.length) {
          this.failed++;
          return;
        }
        await new Promise(resolve => setTimeout(resolve, RETRY_DELAYS[attempt]));
      }
    }
  }

  private warnOnce(message: string, err?: any): void {
    if (this.warned) return;
    this.warned = true;
    console.warn(message, err ?? '');
  }
}
