import { Component, Inject, OnInit, OnDestroy, ViewChild, NgZone } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ToastrService } from 'ngx-toastr';
import { ChatService } from 'src/app/services/chat.service';
import { SocketService } from 'src/app/services/socket.service';
import { environment } from 'src/environments/environment';
import * as moment from 'moment';
import { CoreService } from 'src/app/services/core/core.service';
import { getCacheData, isFeaturePresent } from 'src/app/utils/utility-functions';
import { Participant, RemoteParticipant, RemoteTrack, RemoteTrackPublication, Track, ConnectionQuality } from 'livekit-client';
import { WebrtcService } from 'src/app/services/webrtc.service';
import { doctorDetails, visitTypes } from 'src/config/constant';
import { ApiResponseModel, EncounterProviderModel, MessageModel, RecordingResponse } from 'src/app/model/model';
import { AppConfigService } from 'src/app/services/app-config.service';
import { AnalyticsService } from 'src/app/services/analytics.service';

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
  callDurationDisplay = '00:00';
  defaultImage = 'assets/images/img-icon.jpeg';
  pdfDefaultImage = 'assets/images/pdf-icon.png';
  activeSpeakerIds: any = [];
  connecting = false;
  callEndTimeout = null;
  endCall: boolean = false;
  patientRegFields: string[] = [];
  recodingStarted = false;
  tableId: number;
  location: string;

  callType: string;
  videoBitrateTooLow: boolean = false;
  videoBitrateCheckInterval: any;
  lastVideoBytesSent = 0;
  lastTimestamp = 0;
  lastAudioBytesSent = 0;
  lastAudioTimestamp = 0;

  isVideoRecordingEnabled: boolean;

  cameraIssue: boolean = false;
  microphoneIssue: boolean = false;

  private hasShownPoorToast: boolean = false;
  private hasShownReconnectToast: boolean = false;

  private callDurationStr: string = '00:00';
  
  // Reconnection state management
  public isReconnecting: boolean = false;
  private reconnectionSubscriptions: any[] = [];

  // Connection quality state
  public localConnectionQuality: ConnectionQuality | null = null;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data,
    private dialogRef: MatDialogRef<VideoCallComponent>,
    private chatSvc: ChatService,
    private socketSvc: SocketService,
    private cs: CoreService,
    private toastr: ToastrService,
    private webrtcSvc: WebrtcService,
    private appConfigService: AppConfigService,
    private analytics: AnalyticsService,
    private ngZone: NgZone
  ) { }

  async ngOnInit() {
    this.patientRegFields = this.appConfigService.patientRegFields;
    this.room = this.data.patientId;
    this.location = this.data.location;

    const patientVisitProvider: EncounterProviderModel = getCacheData(true, visitTypes.PATIENT_VISIT_PROVIDER);
    this.toUser = patientVisitProvider?.provider?.uuid;
    this.hwName = patientVisitProvider?.display?.split(":")?.[0];
    this.nurseId = patientVisitProvider && patientVisitProvider.provider ? patientVisitProvider.provider?.uuid : this.nurseId;
    this.connectToDrId = this.data.connectToDrId;
    this.callType = this.data.callType;
    if (this.data.initiator) this.initiator = this.data.initiator;
    this.socketSvc.initSocket();
    this.initSocketEvents();
    if (this.data.patientId && this.data.visitId) {
      this.getMessages();
    }
    // Update duration every second to avoid computed getter changing during check
    this.changeDetForDuration = setInterval(() => {
      if (this.callStartedAt) {
        const duration = moment.duration(moment().diff(this.callStartedAt));
        const [h, m, s] = [duration.hours(), duration.minutes(), duration.seconds()].map(n => String(n).padStart(2, '0'));
        this.callDurationStr = h !== '00' ? `${h}:${m}:${s}` : `${m}:${s}`;
      }
    }, 1000);
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
    // set flag for audio/video enable/disable

    this.isVideoRecordingEnabled = this.appConfigService.ai_llm_recording_section

    // Subscribe to connection quality updates
    const localQualitySub = this.webrtcSvc.localConnectionQuality$.subscribe((q) => {
      this.localConnectionQuality = q;
    });
    this.reconnectionSubscriptions.push(localQualitySub, localQualitySub);
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

        this.analytics.logEvent('generate-token_failed', 'engagement', 'call_button', 1,  {
        doctorUserId: this.data?.connectToDrId,
        doctorName: this.doctorName,
        patientOpenMrsId: this.data.patientOpenMrsId,
        hwName : getCacheData(true, visitTypes.PATIENT_VISIT_PROVIDER)?.display?.split(":")?.[0],
        hwId : getCacheData(true, visitTypes.PATIENT_VISIT_PROVIDER) && getCacheData(true, visitTypes.PATIENT_VISIT_PROVIDER)?.provider ? getCacheData(true, visitTypes.PATIENT_VISIT_PROVIDER).provider?.uuid : null,
        visitId: this.data?.visitId,
        location:this.location,
        callType: this.callType,
        callDuration: this.callDuration,
        error: err
      });

        this.toastr.show('Failed to generate a video call token.', null, { timeOut: 1000 });
      });
    }
    console.log("this.webrtcSvc.token",this.webrtcSvc.token);
    if (!this.webrtcSvc.token) return;
    // Attach reconnection handlers BEFORE creating the room to catch early events
    this.attachRoomReconnectionHandlers();
    
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
      handleMediaError: this.handleMediaDeviceError.bind(this),
    });
  }

  /**
  * Show meaningful error when camera/mic isn't available or permission denied
  */
  private handleMediaDeviceError(err: any) {
    const source = err?.source || 'device';
    const rawError = err?.error || err;
    const errorName = rawError?.name || rawError?.code;
    const errorMessage = rawError?.message || rawError?.toString?.();

    const deviceLabel = source === 'camera' ? 'Camera' : source === 'microphone' ? 'Microphone' : 'Media device';

    // Map common getUserMedia errors to actionable, device-specific toasts
    let title = `${deviceLabel} error`;
    let userMsg = `Unable to access ${deviceLabel.toLowerCase()}.`;

    if (errorName === 'NotAllowedError' || errorName === 'SecurityError') {
      title = `${deviceLabel} access blocked`;
      userMsg = `Permission denied for ${deviceLabel.toLowerCase()}. Allow access in your browser site settings and retry.`;
    } else if (errorName === 'NotFoundError' || errorName === 'DevicesNotFoundError' || errorMessage?.includes('Requested device not found')) {
      title = `${deviceLabel} not found`;
      userMsg = `No ${deviceLabel.toLowerCase()} detected. Connect a ${deviceLabel.toLowerCase()} and try again.`;
    } else if (errorName === 'NotReadableError' || errorName === 'TrackStartError') {
      title = `${deviceLabel} in use`;
      userMsg = `Your ${deviceLabel.toLowerCase()} is being used by another application. Close it and try again.`;
    } else if (errorName === 'OverconstrainedError') {
      title = `${deviceLabel} constraints not satisfied`;
      userMsg = `The selected ${deviceLabel.toLowerCase()} doesn't meet the required settings. Choose a different device or reset to defaults.`;
    }

    this.analytics.logEvent('media-device-error', 'engagement', 'call_button', 1, {
      doctorUserId: this.data?.connectToDrId,
      doctorName: this.doctorName,
      patientOpenMrsId: this.data?.patientOpenMrsId,
      hwName: getCacheData(true, visitTypes.PATIENT_VISIT_PROVIDER)?.display?.split(":")?.[0],
      hwId: getCacheData(true, visitTypes.PATIENT_VISIT_PROVIDER)?.provider?.uuid,
      visitId: this.data?.visitId,
      location: this.location,
      callType: this.callType,
      source,
      errorName,
      errorMessage
    });

    this.toastr.error(userMsg, title, { timeOut: 5000 });

    // Set indicator flags for UI badges
    if (source === 'camera') {
      this.cameraIssue = true;
      this._localVideoOff = true;
    } else if (source === 'microphone') {
      this.microphoneIssue = true;
      this._localAudioMute = true;
    }
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
    setTimeout(() => this.connecting = false);
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
  async onCallConnect(event: any) {
    this.socketSvc.incomingCallData = {
      nurseId: this.nurseId,
      doctorName: this.doctorName,
      roomId: this.room,
      visitId: this.data?.visitId,
      doctorId: this.data?.connectToDrId,
      appToken: this.webrtcSvc.appToken,
      socketId: this.socketSvc?.socket?.id,
      initiator: this.initiator,
      callType : this.callType
    };
    this.analytics.logEvent('on-call-connect', 'engagement', 'call_button', 1,  this.buildAnalyticsEventPayload());

    this.socketSvc.emitEvent("call", this.socketSvc.incomingCallData);

    /**
     *  60 seconds ringing timeout after which it will show toastr
     *  and hang up if HW not picked up
    */
    const ringingTimeout = 60 * 1000;
    this.callEndTimeout = setTimeout(() => {
      if (!this.callConnected) {
      this.socketSvc.emitEvent('call_time_up', this.nurseId);
      this.analytics.logEvent('call_time_up', 'engagement', 'call_button', 1,  this.buildAnalyticsEventPayload());
        this.endCallInRoom();

        this.toastr.info("Health worker not available to pick the call, please try again later.", null, { timeOut: 3000 });
      }
    }, ringingTimeout);
  }

  /**
  * Handle participant disconnect callback
  * @return {void}
  */
  async handleParticipantConnect(): Promise<void> {
    this.callConnected = true;
    this.callStartedAt = moment();
    if (this.callType === 'audio') {
      // this._localVideoOff = true;
      this._localVideoOff = this.webrtcSvc.toggleVideo();
      const event = this._localVideoOff ? 'videoOff' : 'videoOn';
      this.socketSvc.emitEvent(event, { fromWebapp: true });
        this.videoBitrateCheckInterval = setInterval(() => {
        this.checkLocalVideoBitrate();
      }, 3000);
    }

    this.socketSvc.emitEvent('call-connected', this.incomingData);
    this.analytics.logEvent('call-connected', 'engagement', 'call_button', 1,  this.buildAnalyticsEventPayload());
    if(this.callType === 'video' && this.isVideoRecordingEnabled) {
      await this.webrtcSvc.startRecording({
        doctorName: this.doctorName,
        roomId: this.room,
        visitId: this.data?.visitId,
        doctorId: this.data?.connectToDrId,
        chwId: this.nurseId,
        patientId: this.data?.patientId,
        nurseName: this.hwName,
        name: this.provider?.uuid,
        location: this.location
      })
      .toPromise()
      .then((res: RecordingResponse) => {
        this.recodingStarted = true
        this.tableId = res.recordingId
        this.analytics.logEvent('call-recoding-started', 'engagement', 'call_button', 1,  this.buildAnalyticsEventPayload());
      })
      .catch(err => {
      this.analytics.logEvent('call-recoding-error', 'engagement', 'call_button', 1, {
        doctorUserId: this.data?.connectToDrId,
        doctorName: this.doctorName,
        patientOpenMrsId: this.data.patientOpenMrsId,
        hwName : getCacheData(true, visitTypes.PATIENT_VISIT_PROVIDER)?.display?.split(":")?.[0],
        hwId : getCacheData(true, visitTypes.PATIENT_VISIT_PROVIDER) && getCacheData(true, visitTypes.PATIENT_VISIT_PROVIDER)?.provider ? getCacheData(true, visitTypes.PATIENT_VISIT_PROVIDER).provider?.uuid : null,
        visitId: this.data?.visitId,
        location:this.location,
        callType: this.callType,
        callDuration: this.callDuration,
        error: err
      });
      console.log("start recoding error", err)
      });
    }
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
   * Map LiveKit ConnectionQuality to a 0-4 level for UI bars
   */
  networkQualityClass(q: ConnectionQuality) {
    switch (q) {
      case ConnectionQuality.Excellent: return 'quality--excellent';
      case ConnectionQuality.Good: return 'quality--good';
      case ConnectionQuality.Poor: return 'quality--poor';
      case ConnectionQuality.Lost: return 'quality--poor';
      default: return '';
    }
  }

  qualityLevel(q: ConnectionQuality): number {
    switch (q) {
      case ConnectionQuality.Excellent: return 4;
      case ConnectionQuality.Good: return 3;
      case ConnectionQuality.Poor: return 1;
      case ConnectionQuality.Lost: return 0;
      default: return 0;
    }
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

  /**
  * Handle track unmuted callback
  * @param {any} event - Track muted Event
  * @return {void}
  */
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
    // Suppress transient disconnect toast during reconnect attempts
    if (!this.webrtcSvc.isCurrentlyReconnecting) {
      this.toastr.info("Call ended from Health Worker's end.", null, { timeOut: 2000 });
    }
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
        this.endCallInRoom();
        this.toastr.info("Call rejected by Health Worker", null, { timeOut: 2000 });
        this.analytics.logEvent('hw_call_reject', 'engagement', 'call_button', 1,  this.buildAnalyticsEventPayload());

      }
    });

    this.socketSvc.onEvent("bye").subscribe((data: any) => {
      if (data === 'app') {
        this.toastr.info("Call ended from Health Worker end.", null, { timeOut: 2000 });

         this.analytics.logEvent('hw_ended_call', 'engagement', 'call_button', 1,  this.buildAnalyticsEventPayload());
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


  async checkLocalVideoBitrate(): Promise<void> {
    const pc: RTCPeerConnection | undefined = (this.webrtcSvc.room as any)?.engine?.pcManager?.publisher?._pc;
    if (!pc) return;

    const stats = await pc.getStats();

    stats.forEach((report) => {
      if (this.lastTimestamp === 0) {
        this.lastTimestamp = report.timestamp;
        this.lastVideoBytesSent = report.bytesSent;
        return;
      }
      
      if (report.type === 'outbound-rtp' && report.kind === 'video' && typeof report.bytesSent === 'number' && typeof report.timestamp === 'number') {
        if (this.lastTimestamp && this.lastVideoBytesSent) {
          const timeDiffSec = (report.timestamp - this.lastTimestamp) / 1000;
          const bytesDiff = report.bytesSent - this.lastVideoBytesSent;
          if (timeDiffSec > 0) {
          const bitrate = (bytesDiff * 8) / timeDiffSec; // bits per second
          console.log('Video bitrate (bps):', bitrate);

          this.videoBitrateTooLow = bitrate < 600_000; // e.g. < 200 kbps
          }
        }
        this.lastTimestamp = report.timestamp;
        this.lastVideoBytesSent = report.bytesSent;
      }

    });
    if (this.videoBitrateTooLow) {
      if (!this.hasShownPoorToast) {
        this.toastr.warning('Low bandwidth detected. Continuing with the audio call');
        this.hasShownPoorToast = true;
      }
    }
  }

  /**
  * Attach LiveKit room reconnection handlers to update UI and logic
  * @return {void}
  */
  private attachRoomReconnectionHandlers(): void {    
    const signalReconnectingSub = this.webrtcSvc.signalReconnecting$.subscribe(() => {
      // Update UI immediately for signal reconnection
      this.ngZone.run(() => {
        this.isReconnecting = true;
      });
    });

    const isReconnectingSub = this.webrtcSvc.isReconnecting$.subscribe((isReconnecting) => {
      console.log('Reconnection state changed:', isReconnecting);
      this.ngZone.run(() => {
        this.isReconnecting = isReconnecting;        
        if (isReconnecting) {
          if (!this.hasShownReconnectToast) {
            this.toastr.warning('Network issue detected. Reconnecting...', 'Connection Lost', { 
              timeOut: 3000
            });
            this.hasShownReconnectToast = true;
          }
        } 
        // else {
        //   // Reset toast flag and show success message
        //   // this.hasShownReconnectToast = false;
        //   // this.toastr.success('Connection restored successfully!', 'Reconnected', { 
        //   //   timeOut: 2000
        //   // });
        // }
      });
    });

    // Store subscriptions for cleanup
    this.reconnectionSubscriptions.push(signalReconnectingSub, isReconnectingSub);
  }

  setFlag() {
    this.endCall = true;
  }

  /**
  * End call and disconnect from the room
  * @return {void}
  */
  endCallInRoom(flag?) {
    setTimeout(async () => {
      this.close();
      this.webrtcSvc.room.disconnect(true);
      if(this.recodingStarted && isFeaturePresent('webrtcRecording')) {
        this.recodingStarted = false;
        await this.webrtcSvc.stopRecording(this.tableId, this.room)
          .toPromise()
          .then(()=>{
            this.analytics.logEvent('call-recoding-stopped', 'engagement', 'call_button', 1,  this.buildAnalyticsEventPayload());
          })
          .catch(err => {
            this.analytics.logEvent('call-recoding-stopped-error', 'engagement', 'call_button', 1, {
            doctorUserId: this.data?.connectToDrId,
            doctorName: this.doctorName,
            patientOpenMrsId: this.data.patientOpenMrsId,
            hwName : getCacheData(true, visitTypes.PATIENT_VISIT_PROVIDER)?.display?.split(":")?.[0],
            hwId : getCacheData(true, visitTypes.PATIENT_VISIT_PROVIDER) && getCacheData(true, visitTypes.PATIENT_VISIT_PROVIDER)?.provider ? getCacheData(true, visitTypes.PATIENT_VISIT_PROVIDER).provider?.uuid : null,
            visitId: this.data?.visitId,
            location:this.location,
            callType: this.callType,
            recordingId: this.tableId,
            callDuration: this.callDuration,
            error: err
          });
            console.log("stop recoding error", err)
          });
      }
    }, 0);
    this.webrtcSvc.token = '';
    this.cleanupVideoElement('localVideo');
    this.cleanupVideoElement('remoteVideo');
    this.webrtcSvc.handleDisconnect();

    if (this.callDuration) {

      this.socketSvc.emitEvent("bye", {
        ...this.incomingData,
        nurseId: this.nurseId,
        webapp: true,
        initiator: this.initiator,
      });
       this.analytics.logEvent('bye_by_dr', 'engagement', 'end_call_button', 1, this.buildAnalyticsEventPayload());
    } else if(this.endCall) {

      this.socketSvc.emitEvent("cancel_dr", {
        ...this.incomingData,
        nurseId: this.nurseId,
        webapp: true,
        initiator: this.initiator,
      });

    this.analytics.logEvent('cancel_by_dr', 'engagement', 'end_call_button', 1,  this.buildAnalyticsEventPayload());
    } else if (this.callDuration === "" && !this.endCall && (flag === 'call_time_up')) {
      this.socketSvc.emitEvent('call_time_up', this.nurseId);
      this.analytics.logEvent('call_time_up', 'engagement', 'call_button', 1,  this.buildAnalyticsEventPayload());

    }
    clearInterval(this.videoBitrateCheckInterval);
    this.lastVideoBytesSent = 0;
    this.lastTimestamp = 0;
    this.lastAudioBytesSent = 0;
    this.lastAudioTimestamp = 0;
    this.close();
  }

  cleanupVideoElement(videoElementId: string) {
    const videoEl = document.getElementById(videoElementId) as HTMLVideoElement;
    if (videoEl && videoEl.srcObject instanceof MediaStream) {
      videoEl.srcObject.getTracks().forEach(track => track.stop());
      videoEl.srcObject = null;
    }
  }

  /**
  * Close modal
  * @return {void}
  */
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

    this.analytics.logEvent('toggle_audio', 'engagement', 'audio_button', 1,  this.buildAnalyticsEventPayload());

    // Clear mic issue indicator when enabling mic succeeds
    if (this.microphoneIssue) {
      this._localAudioMute = true;
      this.handleMediaDeviceError({ source: 'microphone', error: { name: 'NotAllowedError' } });
    }
  }

  /**
  * Toggle video
  * @return {void}
  */
  toggleVideo() {
    this._localVideoOff = this.webrtcSvc.toggleVideo();
    const event = this._localVideoOff ? 'videoOff' : 'videoOn';
    this.socketSvc.emitEvent(event, { fromWebapp: true });

    this.analytics.logEvent('toggle_video', 'engagement', 'video_button', 1,  this.buildAnalyticsEventPayload());

    // Clear camera issue indicator when enabling camera succeeds
    if (this.cameraIssue) {
      this._localVideoOff = true;
      this.handleMediaDeviceError({ source: 'camera', error: { name: 'NotAllowedError' } });
    }
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
    this.analytics.logEvent('toggle_window', 'engagement', 'window_button', 1, this.buildAnalyticsEventPayload());

  }

  /**
  * Getter for call duration
  * @return {string} - Call duration
  */
  get callDuration() {
    return this.callDurationStr;
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
    
    // Clean up reconnection subscriptions
    this.reconnectionSubscriptions.forEach(sub => sub.unsubscribe());
    this.reconnectionSubscriptions = [];
    
    this.webrtcSvc.disconnect();
    this.webrtcSvc.token = '';
  }

  checkPatientRegField(fieldName: string): boolean {
    return this.patientRegFields.indexOf(fieldName) !== -1;
  }

  setDefaultImage(event: Event) {
    const imgElement = event.target as HTMLImageElement;
    imgElement.src = 'assets/svgs/dr-user.svg';
  }

  buildAnalyticsEventPayload() {
    const providerData = getCacheData(true, visitTypes.PATIENT_VISIT_PROVIDER);

    return {
      doctorUserId: this.data?.connectToDrId,
      doctorName: this.doctorName,
      patientOpenMrsId: this.data?.patientOpenMrsId,
      hwName: providerData?.display?.split(":")?.[0] || null,
      hwId: providerData?.provider?.uuid || null,
      visitId: this.data?.visitId,
      location: this.location,
      callType: this.callType,
      recordingId: this.tableId,
      callDuration: this.callDuration
    };
  }
}
