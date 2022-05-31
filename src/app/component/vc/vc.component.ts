import {
  Component,
  HostListener,
  Inject,
  OnInit,
  ViewChild,
} from "@angular/core";
import { MatDialogRef, MAT_DIALOG_DATA } from "@angular/material/dialog";
import { MatSnackBar } from "@angular/material/snack-bar";
import { SocketService } from "src/app/services/socket.service";
declare const getFromStorage: Function;
@Component({
  selector: "app-vc",
  templateUrl: "./vc.component.html",
  styleUrls: ["./vc.component.css"],
})
export class VcComponent implements OnInit {
  @ViewChild("remoteVideo") remoteVideoRef: any;
  @ViewChild("localVideo") localVideoRef: any;
  @ViewChild("mainContainer") mainContainer: any;
  @ViewChild("localContainer") localContainer: any;

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
  nurseId: { uuid } = { uuid: null };
  doctorName = "";
  initiator = "dr";

  constructor(
    public socketService: SocketService,
    @Inject(MAT_DIALOG_DATA) public data,
    public dialogRef: MatDialogRef<VcComponent>,
    private snackbar: MatSnackBar
  ) { }

  close() {
    this.socketService.initSocket(true);
    this.dialogRef.close();
  }

  toast({
    message,
    duration = 5000,
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
    this.socketService.incoming = false
    console.log('ngOnDestroy:::this.socketService.incoming: ', this.socketService.incoming);
  }

  async ngOnInit() {
    this.room = this.data.patientUuid;
    if (this.data.initiator) this.initiator = this.data.initiator;
    const patientVisitProvider = getFromStorage("patientVisitProvider");
    const doctorName = getFromStorage("doctorName");
    this.doctorName = doctorName ? doctorName : this.user.display;

    this.nurseId =
      patientVisitProvider && patientVisitProvider.provider
        ? patientVisitProvider.provider
        : this.nurseId;

    await this.startUserMedia();

    this.socketService.initSocket();
    this.initSocketEvents();
    console.log('this.socketService.incoming: ', this.socketService.incoming);
    await this.connect();
  }

  @HostListener("fullscreenchange")
  fullScreenChange() {
    this.isFullscreen = document.fullscreenEnabled;
  }

  call() {
    this.socketService.emitEvent("call", {
      nurseId: this.nurseId.uuid,
      doctorName: this.doctorName,
      roomId: this.room,
    });
  }

  async connect() {
    console.log("this.initiator: ", this.initiator);
    // if (this.initiator === "hw") {
    this.socketService.emitEvent("create_or_join_hw", { room: this.room });
    // } else {
    //   this.socketService.emitEvent("create or join", this.room);
    // }
    console.log("Attempted to create or  join room", this.room);
    this.toast({ message: "Calling....", duration: 8000 });
  }

  mute() {
    this.localStream.getAudioTracks()[0].enabled = this.isMute;
    this.isMute = !this.isMute;
  }

  video() {
    this.localStream.getVideoTracks()[0].enabled = this.isVideoOff;
    this.isVideoOff = !this.isVideoOff;
  }

  fullscreen() {
    if (this.isFullscreen) {
      document.exitFullscreen();
    } else {
      this.mainContainer.nativeElement.requestFullscreen();
    }
    this.isFullscreen = !this.isFullscreen;
  }

  isStreamAvailable;
  async startUserMedia(config?: any) {
    let mediaConfig = {
      video: true,
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
    this.socketService.onEvent('message').subscribe(data => {
      console.log('Data received: ', data);
      this.handleSignalingData(data);
    })

    this.socketService.onEvent('ready').subscribe(() => {
      console.log('ready: ');
      this.createPeerConnection();
      this.sendOffer();
    })

    this.socketService.onEvent('bye').subscribe(() => {
      this.stop();
    });

  }

  handleSignalingData(data) {
    switch (data.type) {
      case 'offer':
        this.createPeerConnection();
        this.pc.setRemoteDescription(new RTCSessionDescription(data));
        this.sendAnswer();
        break;
      case 'answer':
        this.pc.setRemoteDescription(new RTCSessionDescription(data));
        break;
      case 'candidate':
        this.pc.addIceCandidate(new RTCIceCandidate(data.candidate));
        break;
    }
  };

  onIceCandidate(event) {
    if (event.candidate) {
      console.log('ICE candidate');
      this.sendMessage({
        type: 'candidate',
        candidate: event.candidate
      });
    }
  }

  onAddStream(event) {
    console.log('Add stream');
    this.remoteVideoRef.nativeElement.srcObject = event.stream;
  }

  sendOffer() {
    console.log('Send offer');
    this.pc.createOffer().then(
      this.setAndSendLocalDescription.bind(this),
      (error) => { console.error('Send offer failed: ', error); }
    );
  };

  sendAnswer() {
    console.log('Send answer');
    this.pc.createAnswer().then(
      this.setAndSendLocalDescription.bind(this),
      (error) => { console.error('Send answer failed: ', error); }
    );
  };

  setAndSendLocalDescription(sessionDescription) {
    this.pc.setLocalDescription(sessionDescription);
    console.log('Local description set');
    this.sendMessage(sessionDescription);
  };

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

  sendMessage(data) {
    this.socketService.emitEvent('message', data)
  }

  endCallInRoom() {
    this.socketService.emitEvent("bye", this.room);
    this.stop();
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
