import { Component, OnInit, ViewChild } from "@angular/core";
import { SocketService } from "src/app/services/socket.service";
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

  constructor(public socketService: SocketService) {}

  ngOnInit(): void {
    this.socketService.initSocket();
    this.socketService.onEvent("myId").subscribe((id) => (this.myId = id));
    this.initSocketEvents();
  }

  videoPos = {
    x: 0,
    y: 0,
  };
  dragVideo(e) {
    console.log("e: ", e);
    this.videoPos = {
      x: e.pageX,
      y: e.pageY,
    };
  }

  makeCall() {
    this.startUserMedia();
    this.socketService.emitEvent("create or join", this.room);
    console.log("Attempted to create or  join room", this.room);
  }

  dragVideoLeave() {
    console.log("this.videoPos: ", this.videoPos);
    this.localContainer.nativeElement.style.bottom = this.videoPos.x + "px";
    this.localContainer.nativeElement.style.left = this.videoPos.y + "px";
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
  startUserMedia(config?: any, cb = () => {}): void {
    let mediaConfig = {
      video: {
        width: { min: 1024, ideal: 1280, max: 1920 },
        height: { min: 576, ideal: 720, max: 1080 },
      },
      audio: true,
    };

    if (config) {
      mediaConfig = config;
    }

    const n = <any>navigator;
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
        cb();
      },
      (err) => {
        this.isStreamAvailable = false;
        console.error(err);
      }
    );
  }

  initSocketEvents() {
    this.socketService.onEvent("message").subscribe((room) => {
      this.isInitiator = true;
    });

    this.socketService.onEvent("message").subscribe((room) => {
      console.log("Room " + room + " is full");
    });

    this.socketService.onEvent("join").subscribe((room) => {
      console.log("Another peer made a request to join room " + room);
      console.log("This peer is the initiator of room " + room + "!");
      this.isChannelReady = true;
    });

    this.socketService.onEvent("joined").subscribe((room) => {
      console.log("joined: " + room);
      this.isChannelReady = true;
    });

    this.socketService.onEvent("log").subscribe((array) => {
      console.log("array:log ", array);
      console.log.apply(console, array);
    });

    this.socketService.onEvent("message").subscribe((message) => {
      console.log("Client received message:", message);
      if (message === "got user media") {
        this.maybeStart();
      } else if (message.type === "offer") {
        if (!this.isInitiator && !this.isStarted) {
          this.maybeStart();
        }
        this.pc.setRemoteDescription(new RTCSessionDescription(message));
        this.doAnswer();
      } else if (message.type === "answer" && this.isStarted) {
        this.pc.setRemoteDescription(new RTCSessionDescription(message));
      } else if (message.type === "candidate" && this.isStarted) {
        var candidate = new RTCIceCandidate({
          sdpMLineIndex: message.label,
          candidate: message.candidate,
        });
        this.pc.addIceCandidate(candidate);
      } else if (message === "bye" && this.isStarted) {
        this.handleRemoteHangup();
      }
    });
  }

  maybeStart() {
    console.log(
      ">>>>>>> maybeStart() ",
      this.isStarted,
      this.localStream,
      this.isChannelReady
    );
    if (
      !this.isStarted &&
      typeof this.localStream !== "undefined" &&
      this.isChannelReady
    ) {
      console.log(">>>>>> creating peer connection");
      this.createPeerConnection();
      this.pc.addStream(this.localStream);
      this.isStarted = true;
      console.log("isInitiator", this.isInitiator);
      if (this.isInitiator) {
        this.doCall();
      }
    }
  }

  createPeerConnection() {
    try {
      this.pc = new RTCPeerConnection({
        iceServers: [
          {
            urls: ["turn:40.80.93.209:3478"],
            credential: "nochat",
            username: "chat",
          },
          {
            urls: ["turn:numb.viagenie.ca"],
            username: "sultan1640@gmail.com",
            credential: "98376683",
          },
          { urls: ["stun:stun.l.google.com:19302"] },
          { urls: ["stun:stun1.l.google.com:19302"] },
        ],
      });
      this.pc.onicecandidate = this.handleIceCandidate.bind(this);
      this.pc.onaddstream = this.handleRemoteStreamAdded.bind(this);
      this.pc.onremovestream = this.handleRemoteStreamRemoved.bind(this);
      console.log("Created RTCPeerConnnection");
    } catch (e) {
      console.log("Failed to create PeerConnection, exception: " + e.message);
      alert("Cannot create RTCPeerConnection object.");
      return;
    }
  }

  handleRemoteStreamRemoved(event) {
    console.log("Remote stream removed. Event: ", event);
  }

  handleRemoteStreamAdded(event) {
    console.log("Remote stream added.");
    const remoteStream = event.stream;
    this.remoteVideoRef.nativeElement.srcObject = remoteStream;
  }

  handleIceCandidate(event) {
    console.log("icecandidate event: ", event);
    if (event.candidate) {
      this.sendMessage({
        type: "candidate",
        label: event.candidate.sdpMLineIndex,
        id: event.candidate.sdpMid,
        candidate: event.candidate.candidate,
      });
    } else {
      console.log("End of candidates.");
    }
  }

  doCall() {
    console.log("Sending offer to peer");
    this.pc.createOffer(
      this.setLocalAndSendMessage.bind(this),
      this.handleCreateOfferError.bind(this)
    );
  }

  handleCreateOfferError(event) {
    console.log("createOffer() error: ", event);
  }

  doAnswer() {
    console.log("Sending answer to peer.");
    this.pc
      .createAnswer()
      .then(
        this.setLocalAndSendMessage.bind(this),
        this.onCreateSessionDescriptionError.bind(this)
      );
  }

  setLocalAndSendMessage(sessionDescription) {
    this.pc.setLocalDescription(sessionDescription);
    console.log("setLocalAndSendMessage sending message", sessionDescription);
    this.sendMessage(sessionDescription);
  }

  onCreateSessionDescriptionError(error) {
    console.log("Failed to create session description: " + error.toString());
  }

  sendMessage(data) {
    this.socketService.emitEvent("message", data);
  }

  handleRemoteHangup() {
    console.log("Session terminated.");
    stop();
    this.isInitiator = false;
  }

  stop() {
    this.isStarted = false;
    this.pc.close();
    this.pc = null;
  }

  get users() {
    return this.socketService.activeUsers;
  }
}
