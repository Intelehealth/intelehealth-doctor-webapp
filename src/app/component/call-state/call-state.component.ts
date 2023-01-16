import {
  Component,
  OnInit,
  EventEmitter,
  Output,
  Input,
  Inject,
  ViewChild,
} from "@angular/core";
import { MatDialogRef, MAT_DIALOG_DATA } from "@angular/material/dialog";
import { MatSnackBar } from "@angular/material/snack-bar";
import { of } from "rxjs";
import { concatMap, delay, repeat } from "rxjs/operators";
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

  @ViewChild("mainContainer") mainContainer: any;
  @ViewChild("localVideo") localVideoRef: any;
  @ViewChild("remoteVideo") remoteVideoRef: any;
  @ViewChild("localContainer") localContainer: any;

  conversations = [
    { id: 1, body: "Hi! How is patient feeling now?", me: true },
    {
      id: 2,
      body: "The patient was not feeling good for 2-3 days but lately the patient is doing well. ",
      me: false,
    },
    { id: 3, body: "Great to hear. Keep me posted on the patient.", me: false },
    { id: 4, body: "Hi! How is patient feeling now?", me: true },
  ];

  constructor(
    @Inject(MAT_DIALOG_DATA) public data,
    public socketService: SocketService,
    public dialogRef: MatDialogRef<CallStateComponent>,
    private snackbar: MatSnackBar,
    private visitSvc: VisitService
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
    const doctorName = getFromStorage("doctorName");
    this.doctorName = doctorName ? doctorName : this.user.display;

    this.nurseId =
      patientVisitProvider && patientVisitProvider.provider
        ? patientVisitProvider.provider
        : this.nurseId;

    this.connectToDrId = this.data.connectToDrId;
    await this.startUserMedia();

    this.socketService.initSocket();
    const res = this.initSocketEvents();
    console.log("res: ", res);
    console.log("this.socketService.incoming: ", this.socketService.incoming);
    await this.connect();
    await this.changeVoiceCallIcons();
  }

  async connect() {
    console.log("this.initiator: ", this.initiator);

    this.socketService.emitEvent("create_or_join_hw", {
      room: this.room,
      connectToDrId: this.connectToDrId,
    });

    console.log("Attempted to create or  join room", this.room);
    if (this.initiator === "dr") {
      this.toast({ message: "Calling....", duration: 3000 });
    }
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
    this.conversations.unshift({
      id: 1,
      body: value,
      me: true,
    });
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
