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

@Component({
  selector: 'app-video-call',
  templateUrl: './video-call.component.html',
  styleUrls: ['./video-call.component.scss'],
})
export class VideoCallComponent implements OnInit, OnDestroy {
  @ViewChild("localVideo", { static: false }) localVideoRef: any;
  @ViewChild("remoteVideo", { static: false }) remoteVideoRef: any;

  message: string;
  messageList: any = [];
  toUser: any;
  hwName: any;
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

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    private dialogRef: MatDialogRef<VideoCallComponent>,
    private chatSvc: ChatService,
    private socketSvc: SocketService,
    private cs: CoreService,
    private toastr: ToastrService,
    private webrtcSvc: WebrtcService
  ) { }

  async ngOnInit() {
    this.room = this.data.patientId;

    const patientVisitProvider: any = getCacheData(true, visitTypes.PATIENT_VISIT_PROVIDER);
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

  get patientVisitProvider() {
    try {
      return getCacheData(true, 'patientVisitProvider')
    } catch (error) {
      return {};
    }
  }

  get provider() {
    try {
      return getCacheData(true, 'provider')
    } catch (error) {
      return {};
    }
  }

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
    });
  }

  get incomingData() {
    return { ...this.socketSvc.incomingCallData, socketId: this.socketSvc?.socket?.id };
  }

  onHWIncomingCallConnect() {
    this.connecting = false;
    this.callStartedAt = moment();
    this.socketSvc.emitEvent('call-connected', this.incomingData);
  }

  get doctorName() {
    try {
      return getCacheData(true, 'doctorName') || this.user.display;
    } catch (error) {
      return getCacheData(false, 'doctorName') || this.user.display;
    }
  }

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
        this.socketSvc.emitEvent('call_time_up', this.nurseId);
        this.endCallInRoom();
        this.toastr.info("Health worker not available to pick the call, please try again later.", null, { timeOut: 3000 });
      }
    }, ringingTimeout);
  }

  handleParticipantConnect() {
    this.callConnected = true;
    this.callStartedAt = moment();
    this.socketSvc.emitEvent('call-connected', this.incomingData);
  }

  get callConnected() {
    return this.webrtcSvc.callConnected;
  }
  set callConnected(flag) {
    this.webrtcSvc.callConnected = flag;
  }

  get localAudioIcon() {
    return this._localAudioMute ? 'assets/svgs/audio-wave-mute.svg' : this.activeSpeakerIds.includes(this.provider?.uuid) ? 'assets/svgs/audio-wave.svg' : 'assets/svgs/audio-wave-2.svg'
  }

  get remoteAudioIcon() {
    return this._remoteAudioMute ? 'assets/svgs/audio-wave-mute.svg' : this.activeSpeakerIds.includes(this.webrtcSvc.remoteUser?.identity) ? 'assets/svgs/audio-wave.svg' : 'assets/svgs/audio-wave-2.svg'
  }

  handleActiveSpeakerChange(speakers: Participant[]) {
    this.activeSpeakerIds = speakers.map(s => s?.identity);
  }

  handleTrackUnsubscribed(
    track: RemoteTrack,
    publication: RemoteTrackPublication,
    participant: RemoteParticipant
  ) {
    // remove tracks from all attached elements
    track.detach();
  }

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

  handleParticipantDisconnected() {
    this.toastr.info("Call ended from Health Worker's end.", null, { timeOut: 2000 });
    this.callConnected = false;
    this.socketSvc.incomingCallData = null;
    this.endCallInRoom();
    clearTimeout(this.callEndTimeout);
  }

  getMessages(toUser = this.toUser, patientId = this.data.patientId, fromUser = this.fromUser, visitId = this.data.visitId) {
    this.chatSvc
      .getPatientMessages(toUser, patientId, fromUser, visitId)
      .subscribe({
        next: (res: any) => {
          this.messageList = res?.data;
        },
      });
  }

  sendMessage() {
    if (this.message) {
      const payload = {
        visitId: this.data.visitId,
        patientName: this.data.patientName,
        hwName: this.hwName,
        type: this.isAttachment ? 'attachment' : 'text'
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

  readMessages(messageId: any) {
    this.chatSvc.readMessageById(messageId).subscribe({
      next: (res) => {
        this.getMessages();
      },
    });
  }

  get fromUser() {
    return getCacheData(true, doctorDetails.USER).uuid;
  }

  onImgError(event: any) {
    event.target.src = 'assets/svgs/user.svg';
  }

  get user() {
    try {
      return getCacheData(true, doctorDetails.USER);
    } catch (error) {
      return {};
    }
  }

  initSocketEvents() {
    this.socketSvc.onEvent("hw_call_reject").subscribe((data) => {
      if (data === 'app') {
        this.endCallInRoom();
        this.toastr.info("Call rejected by Health Worker", null, { timeOut: 2000 });
      }
    });

    this.socketSvc.onEvent("bye").subscribe((data: any) => {
      if (data === 'app') {
        this.toastr.info("Call ended from Health Worker end.", null, { timeOut: 2000 });
      }
    });

    this.socketSvc.onEvent("isread").subscribe((data: any) => {
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

  endCallInRoom() {
    setTimeout(() => {
      this.close();
      this.webrtcSvc.room.disconnect(true);
    }, 0);
    this.webrtcSvc.token = '';
    this.webrtcSvc.handleDisconnect();
    this.socketSvc.emitEvent("bye", {
      ...this.incomingData,
      nurseId: this.nurseId,
      webapp: true,
      initiator: this.initiator,
    });

    this.socketSvc.emitEvent("cancel_dr", {
      ...this.incomingData,
      nurseId: this.nurseId,
      webapp: true,
      initiator: this.initiator,
    });

    this.close();
  }

  close() {
    clearTimeout(this.callEndTimeout);
    this.dialogRef.close(true);
  }

  toggleAudio() {
    this._localAudioMute = this.webrtcSvc.toggleAudio();

    const event = this._localAudioMute ? 'audioOff' : 'audioOn';
    this.socketSvc.emitEvent(event, { fromWebapp: true });
  }

  toggleVideo() {
    this._localVideoOff = this.webrtcSvc.toggleVideo();

    const event = this._localVideoOff ? 'videoOff' : 'videoOn';
    this.socketSvc.emitEvent(event, { fromWebapp: true });
  }

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

  ngOnDestroy(): void {
    this.socketSvc.incoming = false;
    clearInterval(this.changeDetForDuration);
    this.webrtcSvc.disconnect();
  }

  get callDuration() {
    let duration: any;
    if (this.callStartedAt) {
      duration = moment.duration(moment().diff(this.callStartedAt))
    }
    return duration ? `${duration.minutes()}:${duration.seconds()}` : '';
  }

  isPdf(url) {
    return url.includes('.pdf');
  }

  uploadFile(files) {
    this.chatSvc.uploadAttachment(files, this.messageList).subscribe({
      next: (res: any) => {
        this.isAttachment = true;

        this.message = res.data;
        this.sendMessage();
      }
    });
  }

  setImage(src) {
    this.cs.openImagesPreviewModal({ startIndex: 0, source: [{ src }] }).subscribe();
  }

}
