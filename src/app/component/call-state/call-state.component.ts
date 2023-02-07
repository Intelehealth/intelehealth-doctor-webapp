import {
  Component,
  OnInit,
  EventEmitter,
  Output,
  Input,
  Inject,
  ViewChild,
  ElementRef,
} from "@angular/core";
import { MatDialogRef, MAT_DIALOG_DATA } from "@angular/material/dialog";
import { MatSnackBar } from "@angular/material/snack-bar";
import { ActivatedRoute } from "@angular/router";
import { of } from "rxjs";
import { concatMap, delay, repeat } from "rxjs/operators";
import { ChatService } from "src/app/services/chat.service";
import { SocketService } from "src/app/services/socket.service";
import { VisitService } from "src/app/services/visit.service";
declare const getFromStorage: Function;

@Component({
  selector: "app-call-state",
  templateUrl: "./call-state.component.html",
  styleUrls: ["./call-state.component.scss"],
})
export class CallStateComponent implements OnInit {
  @Input() conversation;
  message = "";
  collapsed_message = true;
  callerStream: any;
  localStream: MediaStream;
  myId;
  callerSignal;
  callerInfo;
  incomingCall;
  isInitiator;
  isStarted;
  pc;
  isChannelReady;
  room = "";
  isMute = false;
  isVideoOff = false;
  isFullscreen = false;
  classFlag = false;
  patientUuid = "";
  connectToDrId = "";
  nurseId: { uuid } = { uuid: null };
  doctorName = "";
  initiator = "dr";
  isRemote = false;
  voiceCallIcons: any;
  hwName: any;
  toUser: string;
  messages: any = [];
  patientId: string;
  visitId: string;

  @ViewChild("mainContainer") mainContainer: any;
  @ViewChild("localVideo") localVideoRef: any;
  @ViewChild("remoteVideo") remoteVideoRef: any;
  @ViewChild("localContainer") localContainer: any;
  @ViewChild("chatBody") chatBody: ElementRef;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data,
    public socketService: SocketService,
    public dialogRef: MatDialogRef<CallStateComponent>,
    private snackbar: MatSnackBar,
    private visitSvc: VisitService,
    private chatSvc: ChatService
  ) {}

  toast({
    message,
    duration = 2000,
    horizontalPosition = "center",
    verticalPosition = "bottom",
  }) {
    const opts: any = {
      duration,
      horizontalPosition,
      verticalPosition,
    };
    this.snackbar.open(message, null, opts);
  }

  ngOnDestroy() {
    this.socketService.incoming = false;
    this.modalOpenClose();
  }

  async ngOnInit() {
    this.collapsed_message = false;
    this.room = this.data.patientUuid;
    if (this.data.initiator) {
      this.initiator = this.data.initiator;
    }
    const patientVisitProvider = getFromStorage("patientVisitProvider");
    this.hwName = patientVisitProvider?.display?.split(":")?.[0];
    const doctorName = localStorage.getItem("doctorName");
    this.doctorName = doctorName ? doctorName : this.user.display;

    this.nurseId =
      patientVisitProvider && patientVisitProvider.provider
        ? patientVisitProvider.provider
        : this.nurseId;

    this.connectToDrId = this.data.connectToDrId;
    await this.startUserMedia();
    this.toUser = patientVisitProvider?.provider?.uuid;
    if (this.data) {
      this.visitId = this.data?.visitId;
      this.patientId = this.data?.patientUuid;
      this.getMessages();
    }

    this.socketService.initSocket();
    const res = this.initSocketEvents();
    console.log("res: ", res);
    this.socketService.onEvent("updateMessage").subscribe((data) => {
      this.socketService.showNotification({
        title: "New chat message",
        body: data.message,
        timestamp: new Date(data.createdAt).getTime(),
      });

      this.readMessages(data.id);
    });
    this.socketService.onEvent("isread").subscribe((data) => {
      this.getMessages();
    });
    console.log("this.socketService.incoming: ", this.socketService.incoming);
     await this.connect();
    await this.changeVoiceCallIcons();
  }

  getMessages(
    toUser = this.toUser,
    patientId = this.patientId,
    fromUser = this.fromUser,
    visitId = this.visitId
  ) {
    this.chatSvc
      .getPatientMessages(toUser, patientId, fromUser, visitId)
      .subscribe({
        next: (res: any) => {
          this.messages = res?.data;
          this.scroll();
        },
      });
  }

  sendMessages() {
    if (this.message) {
      const payload = {
        visitId: this.visitId,
        patientName: this.patientName,
        hwName: this.hwName,
      };
      this.chatSvc
        .sendMessage(this.toUser, this.patientId, this.message, payload)
        .subscribe({
          next: (res) => {
            this.getMessages();
          },
        });
      this.message = "";
    }
  }

  readMessages(messageId) {
    this.chatSvc.readMessageById(messageId).subscribe({
      next: (res) => {
        this.getMessages();
      },
    });
  }

  scroll() {
    try {
      setTimeout(() => {
        this.chatBody?.nativeElement?.scroll(0, 99999999);
      }, 500);
    } catch (error) {}
  }

  get fromUser() {
    return JSON.parse(localStorage.user).uuid;
  }

  get patientName() {
    return localStorage.patientName || "";
  }

  async connect() {
    console.log("this.initiator: ", this.initiator);

    console.log("Attempted to create or  join room", this.room);
    if (this.initiator === "dr") {
      this.toast({ message: "Calling....", duration: 3000 });
      this.call();
    } else {
      this.socketService.emitEvent("create_or_join_hw", {
        room: this.room,
        connectToDrId: this.connectToDrId,
      });
    }
  }

  call() {
    this.socketService.emitEvent("call", {
      nurseId: this.nurseId.uuid,
      doctorName: this.doctorName,
      roomId: this.room,
    });

    setTimeout(() => {
      this.socketService.emitEvent("create or join", this.room);
    }, 500);
  }

  async changeVoiceCallIcons() {
    this.voiceCallIcons = of(
      "assets/svgs/mute-voice.svg",
      "assets/svgs/Unmute.svg"
    ).pipe(
      concatMap((url) => of(url).pipe(delay(1000))),
      repeat()
    );
  }

  modalOpenClose() {
    this.visitSvc.isVisitSummaryShow = false;
    const bodyElement = document.body;
    bodyElement.classList.remove("body-hide-overflow");
  }

  isStreamAvailable;
  async startUserMedia(config?: any) {
    let mediaConfig = {
      video: {
        mandatory: {
          minWidth: 276,
          minHeight: 160,
          maxWidth: 276,
          maxHeight: 160,
        },
        // width: { ideal: 1255 },
        // height: { ideal: 1024 },
        // // facingMode: "environment",
        // optional: [
        //   { minWidth: 320 },
        //   { minWidth: 640 },
        //   { minWidth: 1024 },
        //   { minWidth: 1280 },
        //   { minWidth: 1920 },
        //   { minWidth: 2560 },
        // ],
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
        (err) => {
          rej(err);
          this.isStreamAvailable = false;
          console.error(err);
        }
      );
    });
  }

  initSocketEvents() {
    this.socketService.onEvent("message").subscribe((data) => {
      console.log("Data received: ", data);
      this.handleSignalingData(data);
    });

    this.socketService.onEvent("ready").subscribe(() => {
      console.log("ready: ");
      this.createPeerConnection();
      this.sendOffer();
    });

    this.socketService.onEvent("bye").subscribe(() => {
      this.stop();
    });
  }

  handleSignalingData(data) {
    switch (data.type) {
      case "offer":
        this.createPeerConnection();
        this.pc.setRemoteDescription(new RTCSessionDescription(data));
        this.sendAnswer();
        break;
      case "answer":
        this.pc.setRemoteDescription(new RTCSessionDescription(data));
        break;
      case "candidate":
        this.pc.addIceCandidate(new RTCIceCandidate(data.candidate));
        break;
    }
  }

  sendMessage(data) {
    this.socketService.emitEvent("message", data);
  }

  endCallInRoom() {
    this.socketService.emitEvent("bye", this.room);
    this.modalOpenClose();
    this.stop();
  }

  sendAnswer() {
    console.log("Send answer");
    this.pc
      .createAnswer()
      .then(this.setAndSendLocalDescription.bind(this), (error) => {
        console.error("Send answer failed: ", error);
      });
  }

  setAndSendLocalDescription(sessionDescription) {
    this.pc.setLocalDescription(sessionDescription);
    console.log("Local description set");
    this.sendMessage(sessionDescription);
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
      console.log("Created RTCPeerConnnection");
    } catch (e) {
      console.log("Failed to create PeerConnection, exception: " + e.message);
      alert("Cannot create RTCPeerConnection object.");
      return;
    }
  }

  onIceCandidate(event) {
    if (event.candidate) {
      console.log("ICE candidate");
      this.sendMessage({
        type: "candidate",
        candidate: event.candidate,
      });
    }
  }

  onAddStream(event) {
    console.log("Add stream");
    this.remoteVideoRef.nativeElement.srcObject = event.stream;
    this.isRemote = true;
  }

  sendOffer() {
    console.log("Send offer");
    this.pc
      .createOffer()
      .then(this.setAndSendLocalDescription.bind(this), (error) => {
        console.error("Send offer failed: ", error);
      });
  }

  toggleVideo() {
    this.localStream.getVideoTracks()[0].enabled = this.isVideoOff;
    this.isVideoOff = !this.isVideoOff;
  }

  toggleMute() {
    this.localStream.getAudioTracks()[0].enabled = this.isMute;
    this.isMute = !this.isMute;
  }

  toggleCollapseMessage(): void {
    this.collapsed_message = !this.collapsed_message;
  }

  toggleZoomIn() {
    const bodyElement = document.body;
    bodyElement.classList.add("minimize-video-dialog");
    bodyElement.classList.remove("body-hide-overflow");
    this.collapsed_message = false;
    this.visitSvc.isVisitSummaryShow = false;
    this.isFullscreen = !this.isFullscreen;
  }

  toggleZoomOut() {
    const bodyElement = document.body;
    bodyElement.classList.remove("minimize-video-dialog");
    bodyElement.classList.add("body-hide-overflow");
    this.visitSvc.isVisitSummaryShow = true;
    this.isFullscreen = !this.isFullscreen;
  }

  submitMessage(event) {
    let value = event.target.value.trim();
    this.message = "";
    if (value.length < 1) return false;
  }

  stop() {
    this.isStarted = false;
    this.localStream &&
      this.localStream.getTracks().forEach(function (track) {
        track.stop();
      });
    if (this.pc) {
      this.pc.close();
      this.pc = null;
    }
    this.close();
  }

  close() {
    this.socketService.initSocket(true);
    this.dialogRef.close();
  }

  get users() {
    return this.socketService.activeUsers;
  }

  get user() {
    try {
      return JSON.parse(localStorage.user);
    } catch (error) {
      return {};
    }
  }
}
