import { Component, Inject, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ToastrService } from 'ngx-toastr';
import { ChatService } from 'src/app/services/chat.service';
import { SocketService } from 'src/app/services/socket.service';
import { environment } from 'src/environments/environment';
import * as moment from 'moment';
import { CoreService } from 'src/app/services/core/core.service';
import { getCacheData } from 'src/app/utils/utility-functions';
import { Participant, RemoteParticipant, RemoteTrack, RemoteTrackPublication, Track } from 'livekit-client';
import { WebrtcService } from 'src/app/services/webrtc.service';
import { notifications, doctorDetails, visitTypes } from 'src/config/constant';
import { ApiResponseModel, EncounterProviderModel, MessageModel, ProviderModel, UserModel } from 'src/app/model/model';

@Component({
  selector: 'app-video-call',
  templateUrl: './video-call.component.html',
  styleUrls: ['./video-call.component.scss'],
})
export class VideoCallComponent implements OnInit, OnDestroy {
  @ViewChild("localVideo", { static: false }) localVideoRef: any;
  @ViewChild("remoteVideo", { static: false }) remoteVideoRef: any;

  message: string;
  messageList: MessageModel[] = [];
  toUser: string;
  hwName: string;
  baseUrl: string = environment.baseURL;
  _chatOpened: boolean = false;
  _localAudioMute: boolean = false;
  _localVideoOff: boolean = false;
  _remoteAudioMute: boolean = false;
  _remoteVideoOff: boolean = false;
  _minimized: boolean = false;

  room = "";
  initiator = "dr";
  nurseId: string = null;
  connectToDrId = "";
  isStreamAvailable: any;
  localStream: MediaStream;
  pc: any;
  isRemote: boolean = false;
  isStarted: boolean = false;
  isAttachment = false;
  callStartedAt = null;
  changeDetForDuration: any = null;
  defaultImage = 'assets/images/img-icon.jpeg';
  pdfDefaultImage = 'assets/images/pdf-icon.png';
  activeSpeakerIds: any = [];
  connecting = false;
  callEndTimeout = null;
  endCall: boolean = false;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data,
    private dialogRef: MatDialogRef<VideoCallComponent>,
    private chatSvc: ChatService,
    private socketSvc: SocketService,
    private cs: CoreService,
    private toastr: ToastrService,
    private webrtcSvc: WebrtcService
  ) { }

  async ngOnInit() {
    this.room = this.data.patientId;

    const patientVisitProvider: EncounterProviderModel = getCacheData(true, visitTypes.PATIENT_VISIT_PROVIDER);
    this.toUser = patientVisitProvider?.provider?.uuid;
    this.hwName = patientVisitProvider?.display?.split(":")?.[0];
    this.nurseId = patientVisitProvider && patientVisitProvider.provider ? patientVisitProvider.provider?.uuid : this.nurseId;
    this.connectToDrId = this.data.connectToDrId;

    if (this.data.initiator) this.initiator = this.data.initiator;
    this.socketSvc.initSocket();
    this.initSocketEvents();
    if (this.data.patientId && this.data.visitId) {
      this.getMessages();
    }
    /**
     * Don't remove this, required change detection for duration
     */
    this.changeDetForDuration = setInterval(() => { }, 1000);
    if (this.initiator === 'hw') {
      this.connecting = true;
      this.webrtcSvc.token = this.data.token;
      /**
       * Changing the execution cycle
       */
      setTimeout(() => {
        this.startCall();
      }, 0);
    } else {
      this.startCall();
    }
  }

  /**
  * Getter for visit provider
  * @param {boolean} val - Dialog result
  * @return {void}
  */
  get patientVisitProvider() {
    try {
      return getCacheData(true, 'patientVisitProvider')
    } catch (error) {
      return {};
    }
  }

  /**
  * Get provider from localstorage
  * @return {ProviderModel} - Provider
  */
  get provider() {
    try {
      return getCacheData(true, 'provider')
    } catch (error) {
      return {};
    }
  }

  /**
  * Start video call
  * @return {void}
  */
  async startCall() {
    if (!this.webrtcSvc.token) {
      await this.webrtcSvc.getToken(this.provider?.uuid, this.room, this.nurseId).toPromise().catch(err => {
        this.toastr.show('Failed to generate a video call token.', null, { timeOut: 1000 });
      });
    }
    if (!this.webrtcSvc.token) return;
    this.webrtcSvc.createRoomAndConnectCall({
      localElement: this.localVideoRef,
      remoteElement: this.remoteVideoRef,
      handleDisconnect: this.endCallInRoom.bind(this),
      handleConnect: this.initiator === 'hw' ? this.onHWIncomingCallConnect.bind(this) : this.onCallConnect.bind(this),
      handleActiveSpeakerChange: this.handleActiveSpeakerChange.bind(this),
      handleTrackMuted: this.handleTrackMuted.bind(this),
      handleTrackUnmuted: this.handleTrackUnmuted.bind(this),
      handleParticipantDisconnected: this.handleParticipantDisconnected.bind(this),
      handleParticipantConnect: this.handleParticipantConnect.bind(this),
      autoEnableLocalMedia: true
    });
  }

  /**
  * Getter for incoming call details
  * @return {void}
  */
  get incomingData() {
    return { ...this.socketSvc.incomingCallData, socketId: this.socketSvc?.socket?.id };
  }

  /**
  * Callback for HW incoming call connect
  * @param {boolean} val - Dialog result
  * @return {void}
  */
  onHWIncomingCallConnect() {
    this.connecting = false;
    this.callStartedAt = moment();
    this.socketSvc.emitEvent('call-connected', this.incomingData);
  }

  /**
  * Get doctor name
  * @return {string} - Doctor name
  */
  get doctorName() {
    try {
      return getCacheData(false, 'doctorName') || this.user.display;
    } catch (error) {
      return getCacheData(false, 'doctorName') || this.user.display;
    }
  }

  /**
  * Callback for call connect
  * @param {boolean} val - Dialog result
  * @return {void}
  */
  onCallConnect() {
    this.socketSvc.incomingCallData = {
      nurseId: this.nurseId,
      doctorName: this.doctorName,
      roomId: this.room,
      visitId: this.data?.visitId,
      doctorId: this.data?.connectToDrId,
      appToken: this.webrtcSvc.appToken,
      socketId: this.socketSvc?.socket?.id,
      initiator: this.initiator
    };

    this.socketSvc.emitEvent("call", this.socketSvc.incomingCallData);

    /**
     *  60 seconds ringing timeout after which it will show toastr
     *  and hang up if HW not picked up
    */
    const ringingTimeout = 60 * 1000;
    this.callEndTimeout = setTimeout(() => {
      if (!this.callConnected) {
  //      this.socketSvc.emitEvent('call_time_up', this.nurseId);
        this.endCallInRoom('call_time_up');
        this.toastr.info("Sevika not available to pick the call, please try again later.", null, { timeOut: 3000 });
      }
    }, ringingTimeout);
  }

  /**
  * Handle participant disconnect callback
  * @return {void}
  */
  handleParticipantConnect() {
    this.callConnected = true;
    this.callStartedAt = moment();
    this.socketSvc.emitEvent('call-connected', this.incomingData);
  }

  /**
  * Returns call connected or not
  * @return {boolean} true/false
  */
  get callConnected() {
    return this.webrtcSvc.callConnected;
  }

  /**
  * Setter call connected flag
  * @param {boolean} flag - Flag true/false
  * @return {void}
  */
  set callConnected(flag) {
    this.webrtcSvc.callConnected = flag;
  }

  /**
  * Getter for local audio icon
  * @return {string} - Local audio icon url
  */
  get localAudioIcon() {
    return this._localAudioMute ? 'assets/svgs/audio-wave-mute.svg' : this.activeSpeakerIds.includes(this.provider?.uuid) ? 'assets/svgs/audio-wave.svg' : 'assets/svgs/audio-wave-2.svg'
  }

  /**
  * Getter for remote audio icon
  * @return {string} - Remote audio icon url
  */
  get remoteAudioIcon() {
    return this._remoteAudioMute ? 'assets/svgs/audio-wave-mute.svg' : this.activeSpeakerIds.includes(this.webrtcSvc.remoteUser?.identity) ? 'assets/svgs/audio-wave.svg' : 'assets/svgs/audio-wave-2.svg'
  }

  /**
  * Handle active speakers changed callback
  * @param {Participant[]} speakers - Array of speakers
  * @return {string[]} - Array of active speaker id's
  */
  handleActiveSpeakerChange(speakers: Participant[]) {
    this.activeSpeakerIds = speakers.map(s => s?.identity);
  }

  /**
  * Handle track unsubscribed callback
  * @param {RemoteTrack} track - Track
  * @param {RemoteTrackPublication} publication - Publication
  * @param {RemoteParticipant} participant -Remote participant
  * @return {void}
  */
  handleTrackUnsubscribed(
    track: RemoteTrack,
    publication: RemoteTrackPublication,
    participant: RemoteParticipant
  ) {
    // remove tracks from all attached elements
    track.detach();
  }

  /**
  * Handle track muted callback
  * @param {any} event - Track muted Event
  * @return {void}
  */
  handleTrackMuted(event: any) {
    if (event instanceof RemoteTrackPublication) {
      if (event.kind === Track.Kind.Audio) {
        this._remoteAudioMute = event.isMuted;
      }
      if (event.kind === Track.Kind.Video) {
        this._remoteVideoOff = event.isMuted;
      }
    }
  }

  handleTrackUnmuted(event: any) {
    if (event instanceof RemoteTrackPublication) {
      if (event.kind === Track.Kind.Audio) {
        this._remoteAudioMute = event.isMuted;
      }
      if (event.kind === Track.Kind.Video) {
        this._remoteVideoOff = event.isMuted;
      }
    }
  }

  /**
  * Handle participant disconnected callback
  * @param {any} event - Track muted Event
  * @return {void}
  */
  handleParticipantDisconnected() {
    this.toastr.info("Call ended from Sevika's end.", null, { timeOut: 2000 });
    this.callConnected = false;
    this.socketSvc.incomingCallData = null;
    this.endCallInRoom();
    clearTimeout(this.callEndTimeout);
  }

  /**
  * Get all messages
  * @param {string} toUser - To user uuid
  * @param {string} patientId - Patient uuid
  * @param {string} fromUser - from user uuid
  * @param {string} visitId - Visit uuid
  * @return {void}
  */
  getMessages(toUser = this.toUser, patientId = this.data.patientId, fromUser = this.fromUser, visitId = this.data.visitId) {
    this.chatSvc
      .getPatientMessages(toUser, patientId, fromUser, visitId)
      .subscribe({
        next: (res: ApiResponseModel) => {
          this.messageList = res?.data;
        },
      });
  }

  /**
  * Send a message.
  * @return {void}
  */
  sendMessage() {
    if (this.message) {
      const payload = {
        visitId: this.data.visitId,
        patientName: this.data.patientName,
        hwName: this.hwName,
        type: this.isAttachment ? 'attachment' : 'text',
        openMrsId: this.data.patientOpenMrsId
      };
      this.chatSvc
        .sendMessage(this.toUser, this.data.patientId, this.message, payload)
        .subscribe({
          next: (res) => {
            this.isAttachment = false;
            this.getMessages();
          },
          error: () => {
            this.isAttachment = false;
          },
          complete: () => {
            this.isAttachment = false;
          }
        });
      this.message = "";
    }
  }

  /**
  * Update message status to read using message id.
  * @param {number} messageId - Message id
  * @return {void}
  */
  readMessages(messageId: number) {
    this.chatSvc.readMessageById(messageId).subscribe({
      next: (res) => {
        this.getMessages();
      },
    });
  }

  /**
  * Getter for from user uuid
  * @return {string} - user uuid
  */
  get fromUser() {
    return getCacheData(true, doctorDetails.USER).uuid;
  }

  /**
  * Get user from localstorage
  * @return {UserModel} - User
  */
  get user() {
    try {
      return getCacheData(true, doctorDetails.USER);
    } catch (error) {
      return {};
    }
  }

  /**
  * Subscribe to socket events
  * @return {void}
  */
  initSocketEvents() {
    this.socketSvc.onEvent("hw_call_reject").subscribe((data) => {
      if (data === 'app') {
        this.endCallInRoom('hw_call_reject');
        this.toastr.info("Call rejected by Sevika", null, { timeOut: 2000 });
      }
    });

    this.socketSvc.onEvent("bye").subscribe((data: any) => {
      if (data === 'app') {
        this.toastr.info("Call ended from Sevika end.", null, { timeOut: 2000 });
      }
    });

    this.socketSvc.onEvent("isread").subscribe((data) => {
      this.getMessages();
    });

    this.socketSvc.onEvent("videoOn").subscribe((data: any) => {
      if (!data?.fromWebapp)
        this._remoteVideoOff = false;
    });

    this.socketSvc.onEvent("videoOff").subscribe((data: any) => {
      if (!data?.fromWebapp)
        this._remoteVideoOff = true;
    });

    this.socketSvc.onEvent("audioOn").subscribe((data: any) => {
      if (!data?.fromWebapp)
        this._remoteAudioMute = false;
    });

    this.socketSvc.onEvent("audioOff").subscribe((data: any) => {
      if (!data?.fromWebapp)
        this._remoteAudioMute = true;
    });
  }

  setFlag() {
    this.endCall = true;
  }
  
  /**
  * End call and disconnect from the room
  * @return {void}
  */
  endCallInRoom(flag?) {
    try {
      if (this.endCall) {
        // already ending - avoid double execution
        return;
      }
      this.endCall = true;

      // 1) Stop LiveKit local tracks
      try { this.webrtcSvc.stopAllLocalTracks(); } catch (e) { console.warn('stopAllLocalTracks failed', e); }

      // 2) Cleanup local/remote video elements (ViewChild refs)
      this.cleanupVideoElement(this.localVideoRef);
      this.cleanupVideoElement(this.remoteVideoRef);

      // 3) Disconnect the room (service handles defensive cleanup)
      try { this.webrtcSvc.disconnect(true); } catch (e) { console.warn('webrtcSvc.disconnect failed', e); }

      // 4) Clear token & cancel timers
      this.webrtcSvc.token = '';
      clearTimeout(this.callEndTimeout);

      // 5) Emit appropriate socket events
      if (this.callDuration) {
        this.socketSvc.emitEvent("bye", {
          ...this.incomingData,
          nurseId: this.nurseId,
          webapp: true,
          initiator: this.initiator,
        });
      } else if(this.endCall && !['hw_call_reject', 'call_time_up'].includes(flag)) {
        this.socketSvc.emitEvent("cancel_dr", {
          ...this.incomingData,
          nurseId: this.nurseId,
          webapp: true,
          initiator: this.initiator,
        });
      } else if (this.callDuration === "" && (flag === 'call_time_up')) {
        this.socketSvc.emitEvent('call_time_up', this.nurseId);
      }

      // 6) Close dialog once
      this.close();
    } catch (err) {
      console.error('endCallInRoom error', err);
      try { this.close(); } catch (e) {}
    }
  }

  cleanupVideoElement(refOrId: any) {
    try {
      if (!refOrId) return;

      let videoEl: HTMLVideoElement | null = null;

      if (typeof refOrId === 'string') {
        videoEl = document.getElementById(refOrId) as HTMLVideoElement;
      } else if (refOrId?.nativeElement) {
        videoEl = refOrId.nativeElement as HTMLVideoElement;
      } else if (refOrId instanceof HTMLVideoElement) {
        videoEl = refOrId;
      }

      if (!videoEl) return;

      try { videoEl.pause?.(); } catch (e) {}
      try {
        if (videoEl.srcObject && (videoEl.srcObject as MediaStream).getTracks) {
          (videoEl.srcObject as MediaStream).getTracks().forEach(t => {
            try { t.stop(); } catch (e) {}
          });
        }
      } catch (e) {}

      try { (videoEl as any).detach?.(); } catch (e) {}
      try { videoEl.srcObject = null; } catch (e) {}
      try { videoEl.remove?.(); } catch (e) {}
    } catch (err) {
      console.warn('cleanupVideoElement error', err);
    }
  }

  close() {
    clearTimeout(this.callEndTimeout);
    this.dialogRef.close(true);
  }

  /**
  * Toggle audio
  * @return {void}
  */
  toggleAudio() {
    this._localAudioMute = this.webrtcSvc.toggleAudio();

    const event = this._localAudioMute ? 'audioOff' : 'audioOn';
    this.socketSvc.emitEvent(event, { fromWebapp: true });
  }

  /**
  * Toggle video
  * @return {void}
  */
  toggleVideo() {
    this._localVideoOff = this.webrtcSvc.toggleVideo();

    const event = this._localVideoOff ? 'videoOff' : 'videoOn';
    this.socketSvc.emitEvent(event, { fromWebapp: true });
  }

  /**
  * Toggle window
  * @return {void}
  */
  toggleWindow() {
    this._minimized = !this._minimized;
    if (this._minimized) {
      this.dialogRef.addPanelClass('minimized');
      this.dialogRef.updatePosition({
        top: '30px',
        right: '10px'
      });
    } else {
      this.dialogRef.removePanelClass('minimized');
      this.dialogRef.updatePosition(null);
    }
  }

  /**
  * Getter for call duration
  * @return {string} - Call duration
  */
  get callDuration() {
    let duration: any;
    if (this.callStartedAt) {
      duration = moment.duration(moment().diff(this.callStartedAt))
    }
    return duration ? `${duration.minutes()}:${duration.seconds()}` : '';
  }

  /**
  * Check if attachement is pdf
  * @return {boolean} - True if pdf else false
  */
  isPdf(url) {
    return url.includes('.pdf');
  }

  /**
  * Upload attachment
  * @param {file[]} files - Array of attachemnet files
  * @return {void}
  */
  uploadFile(files) {
    this.chatSvc.uploadAttachment(files, this.messageList).subscribe({
      next: (res: ApiResponseModel) => {
        this.isAttachment = true;

        this.message = res.data;
        this.sendMessage();
      }
    });
  }

  /**
  * Set image for an attachment
  * @param {string} src - Attachemnet url
  * @return {void}
  */
  setImage(src) {
    this.cs.openImagesPreviewModal({ startIndex: 0, source: [{ src }] }).subscribe();
  }

  ngOnDestroy(): void {
    this.socketSvc.incoming = false;
    clearInterval(this.changeDetForDuration);

    try {
      this.webrtcSvc.stopAllLocalTracks();
      this.cleanupVideoElement(this.localVideoRef);
      this.cleanupVideoElement(this.remoteVideoRef);
      this.webrtcSvc.disconnect(true);
      this.webrtcSvc.token = '';
    } catch (e) {
      console.warn('ngOnDestroy cleanup error', e);
    }
  }
}
