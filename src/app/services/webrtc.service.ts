import { HttpClient } from '@angular/common/http';
import { Injectable, ElementRef } from '@angular/core';
import { environment } from 'src/environments/environment';
import {
  LocalParticipant,
  LocalTrackPublication,
  Participant,
  RemoteParticipant,
  RemoteTrack,
  RemoteTrackPublication,
  Room,
  RoomConnectOptions,
  RoomEvent,
  Track,
  VideoPresets43,
  setLogLevel
} from 'livekit-client';
import { map } from 'rxjs/operators';
import { getCacheData } from '../utils/utility-functions';

@Injectable({
  providedIn: 'root'
})
export class WebrtcService {
  public room: Room;
  public url: string = environment.webrtcSdkServerUrl;
  public token: any | null = null;
  public appToken: any | null = null;
  public remoteUser: any | null = null;
  public callConnected: boolean = false;

  private localElement: ElementRef | string | any;
  private remoteElement: ElementRef | string | any;

  constructor(private http: HttpClient) {
    if (this.webrtcLogLevel) setLogLevel(this.webrtcLogLevel);
  }

  get webrtcLogLevel() {
    return getCacheData(true, 'webrtcLogLevel');
  }

  getToken(name: string, roomId: string, nurseName: string) {
    return this.http
      .get(`${environment.webrtcTokenServerUrl}api/getToken?name=${name}&roomId=${roomId}&nurseName=${nurseName}`)
      .pipe(
        map((res: any) => {
          this.token = res?.token;
          this.appToken = res?.appToken;
          return res;
        })
      );
  }

  /** ----------------------------------------------------------------------------------
   * CREATE ROOM AND CONNECT CALL
   ----------------------------------------------------------------------------------- */
  async createRoomAndConnectCall({
    handleTrackSubscribed = this.handleTrackSubscribed.bind(this),
    handleTrackUnsubscribed = this.handleTrackUnsubscribed,
    handleActiveSpeakerChange = this.handleActiveSpeakerChange,
    handleDisconnect = this.noop,
    handleConnect = this.noop,
    handleLocalTrackUnpublished = this.handleLocalTrackUnpublished,
    handleLocalTrackPublished = this.attachLocalVideo.bind(this),
    localElement = 'local-video',
    remoteElement = 'remote-video',
    handleTrackMuted = this.noop,
    handleTrackUnmuted = this.noop,
    handleParticipantDisconnected = this.noop,
    handleParticipantConnect = this.noop,
    autoEnableLocalMedia = false
  }) {
    if (!this.token) throw new Error('Token not found!');

    this.localElement = localElement;
    this.remoteElement = remoteElement;

    this.clearAudioVideo();

    this.room = new Room({
      adaptiveStream: true,
      dynacast: true,
      videoCaptureDefaults: { resolution: VideoPresets43.h1080 },
      audioCaptureDefaults: {
        echoCancellation: true,
        autoGainControl: true,
        noiseSuppression: true,
      },
    });

    this.room
      .on(RoomEvent.TrackSubscribed, handleTrackSubscribed)
      .on(RoomEvent.TrackUnsubscribed, handleTrackUnsubscribed)
      .on(RoomEvent.ActiveSpeakersChanged, handleActiveSpeakerChange)
      .on(RoomEvent.Connected, handleConnect)
      .on(RoomEvent.Connected, async () => {
        if (autoEnableLocalMedia) {
          try {
            await this.room.localParticipant.enableCameraAndMicrophone();
          } catch (err) {
            console.error('Error enabling media:', err);
          }
        }
      })
      .on(RoomEvent.Disconnected, handleDisconnect)
      .on(RoomEvent.LocalTrackUnpublished, handleLocalTrackUnpublished)
      .on(RoomEvent.LocalTrackPublished, handleLocalTrackPublished)
      .on(RoomEvent.ParticipantDisconnected, handleParticipantDisconnected)
      .on(RoomEvent.ParticipantConnected, handleParticipantConnect)
      .on(RoomEvent.TrackMuted, handleTrackMuted)
      .on(RoomEvent.TrackUnmuted, handleTrackUnmuted);

    await this.room.connect(this.url, this.token);
  }

  clearAudioVideo() {
    try {
      if (this.localContainer) this.localContainer.innerHTML = '';
      if (this.remoteContainer) this.remoteContainer.innerHTML = '';
    } catch (err) {}
  }

  /** ----------------------------------------------------------------------------------
   * LOCAL VIDEO ATTACH
   ----------------------------------------------------------------------------------- */
  attachLocalVideo() {
    const camTrack = this.room.localParticipant.getTrackPublication(Track.Source.Camera);

    if (camTrack?.isSubscribed) {
      const videoEl = camTrack.videoTrack?.attach();
      videoEl.style.height = '100%';
      this.localContainer.appendChild(videoEl);
    }
  }

  /** ----------------------------------------------------------------------------------
   * REMOTE TRACK SUBSCRIBE
   ----------------------------------------------------------------------------------- */
  handleTrackSubscribed(
    track: RemoteTrack,
    publication: RemoteTrackPublication,
    participant: RemoteParticipant
  ) {
    const el = track.attach();
    if (participant?.identity) this.remoteUser = participant;

    if (track.kind === Track.Kind.Audio) {
      this.remoteContainer.appendChild(el);
    } else if (track.kind === Track.Kind.Video) {
      el.style.height = '100%';
      this.remoteContainer.appendChild(el);
    }
  }

  handleTrackUnsubscribed(track: RemoteTrack) {
    track?.detach?.();
  }

  /** ----------------------------------------------------------------------------------
   * LOCAL TRACK UNPUBLISH
   ----------------------------------------------------------------------------------- */
  handleLocalTrackUnpublished(track: LocalTrackPublication | any) {
    try {
      if (track?.detach) track.detach();
      track?.audioTrack?.stop?.();
      track?.videoTrack?.stop?.();
    } catch (e) {}
  }

  handleActiveSpeakerChange() {}

  toggleVideo() {
    this.room.localParticipant.setCameraEnabled(
      !this.room.localParticipant.isCameraEnabled
    );
    return this.room.localParticipant.isCameraEnabled;
  }

  toggleAudio() {
    this.room.localParticipant.setMicrophoneEnabled(
      !this.room.localParticipant.isMicrophoneEnabled
    );
    return this.room.localParticipant.isMicrophoneEnabled;
  }

  /** ----------------------------------------------------------------------------------
   * PUBLIC: Stop & detach all local published tracks (safe for older LiveKit SDKs)
   ----------------------------------------------------------------------------------- */
  public stopAllLocalTracks() {
    try {
      if (!this.room || !this.room.localParticipant) return;

      // trackPublications is a Map-like collection in older SDKs
      try {
        this.room.localParticipant.trackPublications.forEach((pub: any) => {
          const t = pub.track;
          if (t) {
            try { t.stop?.(); } catch (e) {}
            try { t.detach?.(); } catch (e) {}
          }
        });
      } catch (e) {
        console.warn('[WebrtcService] stopAllLocalTracks: iteration failed', e);
      }
    } catch (err) {
      console.warn('[WebrtcService] stopAllLocalTracks error', err);
    }
  }

  /** ----------------------------------------------------------------------------------
   * ROBUST DISCONNECT (stops tracks, unpublishes, disconnects once)
   ----------------------------------------------------------------------------------- */
  async disconnect(stopTracks: boolean = true) {
    if (!this.room) return;

    try {
      // 1) ensure tracks are stopped
      try {
        this.stopAllLocalTracks();
      } catch (e) {
        console.warn('[WebrtcService] disconnect: stopAllLocalTracks failed', e);
      }

      // 2) unpublish camera & mic if present (best-effort)
      try {
        const camPub = this.room.localParticipant.getTrackPublication?.(Track.Source.Camera);
        if (camPub?.track) {
          try { this.room.localParticipant.unpublishTrack(camPub.track, true); } catch (e) {}
          try { camPub.track.stop?.(); } catch (e) {}
          try { camPub.track.detach?.(); } catch (e) {}
        }

        const micPub = this.room.localParticipant.getTrackPublication?.(Track.Source.Microphone);
        if (micPub?.track) {
          try { this.room.localParticipant.unpublishTrack(micPub.track, true); } catch (e) {}
          try { micPub.track.stop?.(); } catch (e) {}
          try { micPub.track.detach?.(); } catch (e) {}
        }
      } catch (e) {
        console.warn('[WebrtcService] disconnect: unpublish failed', e);
      }

      // 3) disconnect (await if promise)
      try {
        const maybePromise = this.room.disconnect(stopTracks);
        if (maybePromise && typeof (maybePromise as any).then === 'function') {
          await maybePromise;
        }
      } catch (e) {
        // retry once if initial disconnect throws
        try { await this.room.disconnect(stopTracks); } catch (err) {}
      }
    } catch (err) {
      console.error('[WebrtcService] disconnect error', err);
    } finally {
      try { this.clearAudioVideo(); } catch (e) {}
      this.callConnected = false;
      try { this.room = null as any; } catch (e) {}
    }
  }

  handleDisconnect() {
    this.disconnect(true);
  }

  get remoteContainer() {
    return this.remoteElement?.nativeElement || document.getElementById(this.remoteElement);
  }

  get localContainer() {
    return this.localElement?.nativeElement || document.getElementById(this.localElement);
  }

  get currentRoom() {
    return this.room;
  }

  getRoomConnectionOpts(opts: any = {}): RoomConnectOptions {
    let connectOpts: RoomConnectOptions = {}

    connectOpts.rtcConfig = {
      iceTransportPolicy: 'relay',
      iceServers: [
        {
          "username": "dc2d2894d5a9023620c467b0e71cfa6a35457e6679785ed6ae9856fe5bdfa269",
          "credential": "tE2DajzSJwnsSbc123",
          "urls": "turn:global.turn.twilio.com:3478?transport=udp"
        },
        {
          "username": "dc2d2894d5a9023620c467b0e71cfa6a35457e6679785ed6ae9856fe5bdfa269",
          "credential": "tE2DajzSJwnsSbc123",
          "urls": "turn:global.turn.twilio.com:3478?transport=tcp"
        },
        {
          urls: ["turn:demo.intelehealth.org:3478"],
          username: "ihuser",
          credential: "keepitsecrect",
        },
        {
          urls: ["turn:testing.intelehealth.org:3478"],
          username: "ihuser",
          credential: "keepitsecrect",
        },
        { urls: ["stun:stun.l.google.com:19302"] },
        { urls: ["stun:stun1.l.google.com:19302"] },
      ]
    }

    return { ...connectOpts, ...opts };
  }

  /**
   * Noop function to be passed as default function if nothing passed
   */
  noop() {
    console.log('Not Implemented.')
  }
}
