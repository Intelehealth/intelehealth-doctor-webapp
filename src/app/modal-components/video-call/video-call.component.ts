import { Component, Inject, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ToastrService } from 'ngx-toastr';
import { ChatService } from 'src/app/services/chat.service';
import { SocketService } from 'src/app/services/socket.service';
import { environment } from 'src/environments/environment';
import * as moment from 'moment';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-video-call',
  templateUrl: './video-call.component.html',
  styleUrls: ['./video-call.component.scss'],
})
export class VideoCallComponent implements OnInit, OnDestroy {
  @ViewChild("localVideo") localVideoRef: any;
  @ViewChild("remoteVideo") remoteVideoRef: any;

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
  doctorName = "";
  nurseId: { uuid: string } = { uuid: null };
  connectToDrId = "";
  isStreamAvailable: any;
  localStream: MediaStream;
  pc: any;
  isRemote: boolean = false;
  isStarted: boolean = false;
  callStartedAt = null;
  changeDetForDuration: any = null;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    private dialogRef: MatDialogRef<VideoCallComponent>,
    private chatSvc: ChatService,
    private socketSvc: SocketService,
    private toastr: ToastrService) { }

  async ngOnInit() {
    this.room = this.data.patientId;

    if (this.data.initiator) {
      this.initiator = this.data.initiator;
    }
    const patientVisitProvider = JSON.parse(localStorage.getItem("patientVisitProvider"));
    this.toUser = patientVisitProvider?.provider?.uuid;
    this.hwName = patientVisitProvider?.display?.split(":")?.[0];
    const doctorName = localStorage.getItem("doctorName");
    this.doctorName = doctorName ? doctorName : this.user.display;
    this.nurseId = patientVisitProvider && patientVisitProvider.provider ? patientVisitProvider.provider : this.nurseId;
    this.connectToDrId = this.data.connectToDrId;
    await this.startUserMedia();

    if (this.data.patientId && this.data.visitId) {
      this.getMessages();
    }
    this.socketSvc.initSocket(true);
    this.initSocketEvents();

    this.socketSvc.onEvent("updateMessage").subscribe((data) => {
      this.socketSvc.showNotification({
        title: "New chat message",
        body: data.message,
        timestamp: new Date(data.createdAt).getTime(),
      });

      this.readMessages(data.id);
    });

    this.socketSvc.onEvent("isread").subscribe((data) => {
      this.getMessages();
    });


    await this.connect();
    // await this.changeVoiceCallIcons();
    /**
     * Don't remove this, required change detection for duration
     */
    this.changeDetForDuration = setInterval(() => { }, 1000);
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
      };
      this.chatSvc
        .sendMessage(this.toUser, this.data.patientId, this.message, payload)
        .subscribe({
          next: (res) => {
            this.getMessages();
          },
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
    return JSON.parse(localStorage.user).uuid;
  }

  onImgError(event: any) {
    event.target.src = 'assets/svgs/user.svg';
  }

  get user() {
    try {
      return JSON.parse(localStorage.user);
    } catch (error) {
      return {};
    }
  }

  async startUserMedia(config?: any) {
    let mediaConfig = {
      video: {
        mandatory: {
          minWidth: 276,
          minHeight: 160,
          maxWidth: 276,
          maxHeight: 160,
        }
      },
      audio: true,
    };

    if (config) {
      mediaConfig = config;
    }

    const n = <any>navigator;
    await new Promise((res, rej) => {
      n.getUserMedia =
        n.getUserMedia ||
        n.webkitGetUserMedia ||
        n.mozGetUserMedia ||
        n.msGetUserMedia;
      n.getUserMedia(
        mediaConfig,
        (stream: MediaStream) => {
          this.localStream = stream;
          const localStream = new MediaStream();
          localStream.addTrack(stream.getVideoTracks()[0]);
          this.localVideoRef.nativeElement.srcObject = localStream;
          res(1);
        },
        (err: any) => {
          rej(err);
          this.isStreamAvailable = false;

        }
      );
    });
  }

  async connect() {


    if (this.initiator === "dr") {
      this.toastr.info("Calling....", null, { timeOut: 2000 });
      this.call();
    } else {
      this.socketSvc.emitEvent("create_or_join_hw", {
        room: this.room,
        connectToDrId: this.connectToDrId,
      });
    }
  }

  call() {
    this.socketSvc.emitEvent("call", {
      nurseId: this.nurseId.uuid,
      doctorName: this.doctorName,
      roomId: this.room,
      visitId: this.data?.visitId,
      doctorId: this.data?.connectToDrId
    });

    setTimeout(() => {
      this.socketSvc.emitEvent("create or join", this.room);
    }, 500);
  }

  // async changeVoiceCallIcons() {
  //   this.voiceCallIcons = of(
  //     "assets/svgs/mute-voice.svg",
  //     "assets/svgs/Unmute.svg"
  //   ).pipe(
  //     concatMap((url) => of(url).pipe(delay(1000))),
  //     repeat()
  //   );
  // }

  initSocketEvents() {
    this.socketSvc.onEvent("message").subscribe((data) => {

      this.handleSignalingData(data);
    });

    this.socketSvc.onEvent("ready").subscribe(() => {

      this.createPeerConnection();
      this.sendOffer();
    });

    this.socketSvc.onEvent("bye").subscribe((data: any) => {
      console.log('data:>>> ', data);
      if (!data?.webapp) {
        this.toastr.info("Call ended from Health Worker end.", null, { timeOut: 2000 });
      }
      this.stop();
    });
  }

  handleSignalingData(data: any) {
    switch (data.type) {
      case "offer":
        this.createPeerConnection();
        this.pc.setRemoteDescription(new RTCSessionDescription(data));
        this.sendAnswer();
        break;
      case "answer":
        this.callStartedAt = moment();
        this.pc.setRemoteDescription(new RTCSessionDescription(data));
        break;
      case "candidate":
        this.callStartedAt = moment();
        this.pc.addIceCandidate(new RTCIceCandidate(data.candidate));
        break;
    }
  }

  createPeerConnection() {
    try {
      this.pc = new RTCPeerConnection({
        iceServers: [
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
        ],
      });
      this.pc.onicecandidate = this.onIceCandidate.bind(this);
      this.pc.onaddstream = this.onAddStream.bind(this);
      this.pc.addStream(this.localStream);

    } catch (e) {

      alert("Cannot create RTCPeerConnection object.");
      return;
    }
  }

  onIceCandidate(event: any) {
    if (event.candidate) {

      this.sendMessage2({
        type: "candidate",
        candidate: event.candidate,
      });
    }
  }

  onAddStream(event: any) {

    if (!event.stream.getVideoTracks()[0].enabled) {
      this._remoteVideoOff = false;
    } else {
      this._remoteVideoOff = true;
    }
    if (!event.stream.getAudioTracks()[0].enabled) {
      this._remoteAudioMute = false;
    } else {
      this._remoteAudioMute = true;
    }
    this.remoteVideoRef.nativeElement.srcObject = event.stream;
    this.isRemote = true;
  }

  sendOffer() {

    this.pc.createOffer().then(this.setAndSendLocalDescription.bind(this), (error: any) => {

    });
  }

  stop() {
    this.isStarted = false;
    this.localStream && this.localStream.getTracks().forEach(function (track) {
      track.stop();
    });
    if (this.pc) {
      this.pc.close();
      this.pc = null;
    }
    this.close();
  }

  sendAnswer() {

    this.pc.createAnswer().then(this.setAndSendLocalDescription.bind(this), (error: any) => {

    });
  }

  setAndSendLocalDescription(sessionDescription) {
    this.pc.setLocalDescription(sessionDescription);

    this.sendMessage2(sessionDescription);
  }

  endCallInRoom() {
    this.socketSvc.emitEvent("bye", {
      nurseId: this.nurseId.uuid,
      webapp: true
    });

    this.stop();
  }

  sendMessage2(data: any) {
    this.socketSvc.emitEvent("message", data);
  }

  close() {
    this.dialogRef.close(true);
  }

  toggleAudio() {
    this.localStream.getAudioTracks()[0].enabled = this._localAudioMute;
    this._localAudioMute = !this._localAudioMute;
  }

  toggleVideo() {
    this.localStream.getVideoTracks()[0].enabled = this._localVideoOff;
    this._localVideoOff = !this._localVideoOff;
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
  }

  get callDuration() {
    let duration;
    if (this.callStartedAt) {
      duration = moment.duration(moment().diff(this.callStartedAt))
    }
    return duration ? `${duration.minutes()}:${duration.seconds()}` : ''
  }

}
