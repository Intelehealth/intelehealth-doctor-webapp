import { TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { VoicedocRecorderService } from './voicedoc-recorder.service';
import { VoicedocService } from './voicedoc.service';
import { WebrtcService } from './webrtc.service';

describe('VoicedocRecorderService', () => {
  let service: VoicedocRecorderService;
  let voicedoc: jasmine.SpyObj<VoicedocService>;
  const opts = { visitUuid: 'v', patientUuid: 'p', doctorUuid: 'd', chwUuid: 'c', roomId: 'r' };

  beforeEach(() => {
    voicedoc = jasmine.createSpyObj<VoicedocService>('VoicedocService', ['createSession', 'uploadChunk', 'endSession', 'endSessionKeepalive']);
    voicedoc.endSession.and.returnValue(of({}));
    TestBed.configureTestingModule({
      providers: [
        { provide: VoicedocService, useValue: voicedoc },
        { provide: WebrtcService, useValue: { room: null } }
      ]
    });
    service = TestBed.inject(VoicedocRecorderService);
  });

  afterEach(async () => {
    await service.stop();
  });

  it('does not start capture when session creation returns 403', async () => {
    voicedoc.createSession.and.returnValue(throwError({ status: 403, error: { code: 'VOICEDOC_DISABLED' } }));
    await service.start(opts);
    const s = service as any;
    expect(s.disabled).toBeTrue();
    expect(s.ctx).toBeNull();
    expect(s.sink).toBeNull();
    expect(s.chunker).toBeNull();
    expect(s.syncTimer).toBeNull();
  });

  it('stops uploading without retries when a chunk upload returns 403', async () => {
    voicedoc.uploadChunk.and.returnValue(throwError({ status: 403 }));
    const s = service as any;
    s.active = true;
    s.sessionPromise = Promise.resolve('s1');
    s.enqueue(new Blob(['a']));
    s.enqueue(new Blob(['b']));
    await s.draining;
    expect(voicedoc.uploadChunk).toHaveBeenCalledTimes(1);
    expect(s.ended).toBeTrue();
    expect(s.disabled).toBeTrue();
    expect(s.queue.length).toBe(0);
    s.enqueue(new Blob(['c']));
    expect(voicedoc.uploadChunk).toHaveBeenCalledTimes(1);
  });

  it('still stops on 409 without disabling capture', async () => {
    voicedoc.uploadChunk.and.returnValue(throwError({ status: 409 }));
    const s = service as any;
    s.active = true;
    s.sessionPromise = Promise.resolve('s1');
    s.enqueue(new Blob(['a']));
    await s.draining;
    expect(voicedoc.uploadChunk).toHaveBeenCalledTimes(1);
    expect(s.ended).toBeTrue();
    expect(s.disabled).toBeFalse();
  });

  describe('capture routing and levels', () => {
    const originals: any = {};
    let workletNode: any;
    let scriptNode: any;
    let sourceNodes: any[];
    let addModule: jasmine.Spy;
    let room: any;
    const localTrack = { id: 'mic', kind: 'audio', readyState: 'live' };
    const remoteTrack = { id: 'hw', kind: 'audio', readyState: 'live' };

    const makeRoom = (local: any, remotes: any[]) => ({
      localParticipant: { getTrackPublication: () => (local ? { track: { mediaStreamTrack: local } } : undefined) },
      remoteParticipants: new Map([['p1', { audioTrackPublications: new Map(remotes.map((t, i) => [`a${i}`, { track: { mediaStreamTrack: t } }])) }]]),
      on: () => {},
      off: () => {}
    });

    beforeEach(() => {
      ['AudioContext', 'AudioWorkletNode', 'MediaStream'].forEach(key => (originals[key] = (window as any)[key]));
      sourceNodes = [];
      workletNode = null;
      scriptNode = null;
      addModule = jasmine.createSpy('addModule').and.returnValue(Promise.resolve());
      (window as any).AudioContext = function () {
        return {
          state: 'running',
          destination: {},
          resume: () => Promise.resolve(),
          close: () => Promise.resolve(),
          audioWorklet: { addModule },
          createGain: () => ({ gain: { value: 1 }, connect: () => {}, disconnect: () => {} }),
          createMediaStreamSource: (stream: any) => {
            const node = { track: stream.tracks[0], connect: jasmine.createSpy('connect'), disconnect: jasmine.createSpy('disconnect') };
            sourceNodes.push(node);
            return node;
          },
          createScriptProcessor: () => {
            scriptNode = { connect: () => {}, disconnect: () => {}, onaudioprocess: null };
            return scriptNode;
          }
        };
      };
      (window as any).AudioWorkletNode = function (_ctx: any, name: string, options: any) {
        workletNode = { name, options, port: { onmessage: null }, connect: () => {}, disconnect: () => {} };
        return workletNode;
      };
      (window as any).MediaStream = function (tracks: any[]) {
        return { tracks };
      };
      voicedoc.createSession.and.returnValue(of({ success: true, data: { sessionId: 's1' } }));
      voicedoc.uploadChunk.and.returnValue(of({}));
      room = makeRoom(localTrack, [remoteTrack]);
      (service as any).webrtcSvc.room = room;
    });

    afterEach(async () => {
      await service.stop();
      Object.keys(originals).forEach(key => ((window as any)[key] = originals[key]));
    });

    const nodeFor = (track: any) => sourceNodes.filter(n => n.track === track).pop();
    const statsFor = (localRms: number, remoteRms: number, n: number) => [
      { sumSq: localRms * localRms * n, n, peak: localRms * 2, connected: true },
      { sumSq: remoteRms * remoteRms * n, n, peak: remoteRms * 2, connected: true }
    ];

    it('creates a two-input worklet and routes the doctor mic to input 0 and remote audio to input 1', async () => {
      await service.start(opts);
      expect(workletNode.options.numberOfInputs).toBe(2);
      expect(workletNode.options.channelCount).toBe(1);
      expect(nodeFor(localTrack).connect).toHaveBeenCalledWith(workletNode, 0, 0);
      expect(nodeFor(remoteTrack).connect).toHaveBeenCalledWith(workletNode, 0, 1);
    });

    it('reconnects a track to the other input when it changes category', async () => {
      await service.start(opts);
      const firstLocal = nodeFor(localTrack);
      (service as any).webrtcSvc.room = makeRoom(null, [remoteTrack, localTrack]);
      (service as any).syncSources();
      expect(firstLocal.disconnect).toHaveBeenCalled();
      const moved = nodeFor(localTrack);
      expect(moved).not.toBe(firstLocal);
      expect(moved.connect).toHaveBeenCalledWith(workletNode, 0, 1);
      expect(nodeFor(remoteTrack).disconnect).not.toHaveBeenCalled();
    });

    it('appends per-chunk level fields and source counts, including the final partial chunk', async () => {
      await service.start(opts);
      workletNode.port.onmessage({ data: { samples: new Float32Array(160000), stats: statsFor(0.1, 0.002, 160000) } });
      await service.idle();
      expect(voicedoc.uploadChunk).toHaveBeenCalledTimes(1);
      expect(voicedoc.uploadChunk.calls.argsFor(0)[3]).toEqual({
        localRms: '0.1000', localPeak: '0.2000', remoteRms: '0.0020', remotePeak: '0.0040', localSources: '1', remoteSources: '1'
      });
      workletNode.port.onmessage({ data: { samples: new Float32Array(9000), stats: statsFor(0.05, 0.3, 9000) } });
      await service.stop();
      expect(voicedoc.uploadChunk).toHaveBeenCalledTimes(2);
      expect(voicedoc.uploadChunk.calls.argsFor(1)[2]).toBe(2);
      expect(voicedoc.uploadChunk.calls.argsFor(1)[3]).toEqual(jasmine.objectContaining({ localRms: '0.0500', remoteRms: '0.3000' }));
    });

    it('omits level fields but keeps source counts in the ScriptProcessor fallback', async () => {
      addModule.and.returnValue(Promise.reject(new Error('no worklet')));
      await service.start(opts);
      expect(workletNode).toBeNull();
      expect(nodeFor(localTrack).connect).toHaveBeenCalledWith(scriptNode);
      expect(nodeFor(remoteTrack).connect).toHaveBeenCalledWith(scriptNode);
      const samples = new Float32Array(160000);
      scriptNode.onaudioprocess({ inputBuffer: { getChannelData: () => samples } });
      await service.idle();
      expect(voicedoc.uploadChunk.calls.argsFor(0)[3]).toEqual({ localSources: '1', remoteSources: '1' });
    });

    it('still accepts plain Float32Array messages from an older worklet', async () => {
      await service.start(opts);
      workletNode.port.onmessage({ data: new Float32Array(160000) });
      await service.idle();
      expect(voicedoc.uploadChunk.calls.argsFor(0)[3]).toEqual({ localSources: '1', remoteSources: '1' });
    });

    describe('mic mode', () => {
      const micTrack = { id: 'laptop-mic', kind: 'audio', readyState: 'live', stop: jasmine.createSpy('stop') };
      let getUserMedia: jasmine.Spy;

      beforeEach(() => {
        micTrack.stop.calls.reset();
        getUserMedia = spyOn(navigator.mediaDevices, 'getUserMedia').and.returnValue(
          Promise.resolve({ tracks: [micTrack], getTracks: () => [micTrack] } as any)
        );
      });

      it('records the laptop mic on input 0, ignores the LiveKit room and releases the mic on stop', async () => {
        await service.start(opts, 'mic');
        expect(getUserMedia).toHaveBeenCalledWith({ audio: jasmine.objectContaining({ echoCancellation: true }) });
        expect(nodeFor(micTrack).connect).toHaveBeenCalledWith(workletNode, 0, 0);
        expect(nodeFor(localTrack)).toBeUndefined();
        expect(nodeFor(remoteTrack)).toBeUndefined();
        expect(service.state$.value).toBe('recording');
        await service.stop();
        expect(micTrack.stop).toHaveBeenCalled();
        expect(service.state$.value).toBe('idle');
        expect(voicedoc.endSession).toHaveBeenCalledWith('s1');
      });

      it('reports an error state and releases capture when the mic is denied', async () => {
        getUserMedia.and.returnValue(Promise.reject(new Error('NotAllowedError')));
        await service.start(opts, 'mic');
        await (service as any).stopping;
        expect(service.state$.value).toBe('error');
        expect((service as any).ctx).toBeNull();
        expect((service as any).active).toBeFalse();
      });

      it('drops audio while paused, flushes the partial chunk on pause and resumes on resume', async () => {
        await service.start(opts, 'mic');
        const send = (n: number) => workletNode.port.onmessage({ data: { samples: new Float32Array(n), stats: statsFor(0.1, 0, n) } });
        send(16000);
        service.pause();
        expect(service.state$.value).toBe('paused');
        await service.idle();
        expect(voicedoc.uploadChunk).toHaveBeenCalledTimes(1);
        send(160000);
        await service.idle();
        expect(voicedoc.uploadChunk).toHaveBeenCalledTimes(1);
        service.resume();
        expect(service.state$.value).toBe('recording');
        send(160000);
        await service.idle();
        expect(voicedoc.uploadChunk).toHaveBeenCalledTimes(2);
        expect(voicedoc.uploadChunk.calls.argsFor(1)[2]).toBe(2);
      });
    });
  });
});
