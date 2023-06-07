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
  VideoPresets,
  setLogLevel
} from 'livekit-client';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class WebrtcService {
  public room: any | null = null;
  public url: string = environment.webrtcSdkServerUrl;
  public token: any | null = null;
  public remoteUser: any | null = null;
  private localElement: ElementRef | string | any;
  private remoteElement: ElementRef | string | any;

  constructor(
    private http: HttpClient
  ) {
    /**
     *  trace = 0,
     *  debug = 1,
     *  info = 2,
     *  warn = 3,
     *  error = 4,
     *  silent = 5,
     */
    if (localStorage.webrtcLogLevel) {
      try {
        setLogLevel(JSON.parse(localStorage.webrtcLogLevel));
      } catch (error) {
        console.log('error: ', error);
      }
    }
  }

  getToken(name: string, roomId: string) {
    return this.http.get(`${environment.webrtcTokenServerUrl}api/getToken?name=${name}&roomId=${roomId}`)
      .pipe(map((res: any) => {
        this.token = res?.token;
        return res;
      }));
  }

  async createRoomAndConnectCall({
    handleTrackSubscribed = this.handleTrackSubscribed.bind(this),
    handleTrackUnsubscribed = this.handleTrackUnsubscribed,
    handleActiveSpeakerChange = this.handleActiveSpeakerChange,
    handleDisconnect = this.noop,
    handleConnect = this.noop,
    handleLocalTrackUnpublished = this.handleLocalTrackUnpublished,
    handleLocalTrackPublished = this.attachLocalVideo.bind(this),
    autoEnableCameraOnConnect = true,
    localElement = 'local-video', /** It can be ElementRef or unique id in string for the local video container element */
    remoteElement = 'remote-video' /** It can be ElementRef or unique id in string for the remote video container element */
  }) {
    if (!this.token) {
      throw new Error('Token not found!');
      return;
    }

    this.localElement = localElement;
    this.remoteElement = remoteElement;

    this.room = new Room({
      adaptiveStream: true, /* automatically manage subscribed video quality */
      dynacast: true, /* optimize publishing bandwidth and CPU for published tracks */
      videoCaptureDefaults: {
        resolution: VideoPresets.h90.resolution,
      },
    });

    this.room
      .on(RoomEvent.TrackSubscribed, handleTrackSubscribed)
      .on(RoomEvent.TrackUnsubscribed, handleTrackUnsubscribed)
      .on(RoomEvent.ActiveSpeakersChanged, handleActiveSpeakerChange)
      .on(RoomEvent.Connected, handleConnect)
      .on(RoomEvent.Disconnected, handleDisconnect)
      .on(RoomEvent.LocalTrackUnpublished, handleLocalTrackUnpublished)
      .on(RoomEvent.LocalTrackPublished, handleLocalTrackPublished)

    // let connectOpts: RoomConnectOptions = this.getRoomConnectionOpts();

    console.log('url:- ', this.url);
    await this.room.connect(this.url, this.token, {});

    if (autoEnableCameraOnConnect) {
      await this.room.localParticipant.enableCameraAndMicrophone();
    }
  }

  /**
   * Assign received streaming video to the passed local video container or id
   */
  attachLocalVideo() {
    const track = this.room.localParticipant.getTrack(Track.Source.Camera);
    console.log('track?.isSubscribed: ', track?.isSubscribed);
    if (track?.isSubscribed) {
      const videoElement = track.videoTrack?.attach();
      // videoElement.height = '100';
      const localContainer: any = this.localContainer;
      videoElement.style.width = '100%';
      videoElement.style.height = '100%';
      localContainer.innerHTML = "";
      localContainer.appendChild(videoElement);
    }
  }

  handleTrackSubscribed(
    track: RemoteTrack,
    publication: RemoteTrackPublication,
    participant: RemoteParticipant,
  ) {
    const videoElement: any = track.attach();
    if (participant?.identity) {
      this.remoteUser = participant;
    }

    if (track.kind === Track.Kind.Audio) {
      let remoteContainer: any = this.remoteContainer;
      remoteContainer.appendChild(videoElement);
    } else if (track.kind === Track.Kind.Video) {
      let remoteContainer: any = this.remoteContainer;
      remoteContainer.innerHTML = "";
      videoElement.style.width = '100%';
      videoElement.style.height = '100%';
      remoteContainer.appendChild(videoElement);
    }
  }

  handleTrackUnsubscribed(
    track: RemoteTrack,
    publication: RemoteTrackPublication,
    participant: RemoteParticipant,
  ) {
    console.log('track:handleTrackUnsubscribed ', track);
    // remove tracks from all attached elements
    track.detach();
  }

  handleLocalTrackUnpublished(track: LocalTrackPublication | any, participant: LocalParticipant) {
    console.log('track: handleLocalTrackUnpublished', track);
    console.log('participant: ', participant);
    // when local tracks are ended, update UI to remove them from rendering
    track.detach();
  }

  handleActiveSpeakerChange(speakers: Participant[]) {
    console.log('speakers: ', speakers);
    // show UI indicators when participant is speaking
  }

  /**
   * Method to toggle local video
   */
  public toggleVideo() {
    this.room.localParticipant.setCameraEnabled(!this.room.localParticipant.isCameraEnabled);
    return this.room.localParticipant.isCameraEnabled;
  }


  /**
   * Method to toggle local audio
   */
  public toggleAudio() {
    this.room.localParticipant.setMicrophoneEnabled(!this.room.localParticipant.isMicrophoneEnabled);
    return this.room.localParticipant.isMicrophoneEnabled;
  }


  handleDisconnect() {
    console.log('disconnected from room');
    this.room.disconnect(true);
    this.localContainer.innerHTML = '';
    this.remoteContainer.innerHTML = '';
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
