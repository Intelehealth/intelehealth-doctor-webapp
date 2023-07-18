import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import {
  DialogPosition,
  MatDialog,
  MatDialogConfig,
} from "@angular/material/dialog";
import { BehaviorSubject, Observable } from "rxjs";
import * as io from "socket.io-client";
import { environment } from "../../environments/environment";
import { VisitService } from "./visit.service";
import { WebrtcService } from "./webrtc.service";
import { CoreService } from "./core/core.service";
import { ToastrService } from "ngx-toastr";

@Injectable({
  providedIn: "root"
})
export class SocketService {
  public socket: any;
  public incoming;
  public incomingCallData = {};
  public activeUsers = [];
  appIcon = "assets/images/intelehealth-logo-reverse.png";
  public callRing = new Audio("assets/phone.mp3");

  private baseURL = environment.socketURL;
  private adminUnreadSubject: BehaviorSubject<any>;
  public adminUnread: Observable<any>;

  constructor(
    private http: HttpClient,
    private dialog: MatDialog,
    private visitSvc: VisitService,
    private webrtcSvc: WebrtcService,
    private cs: CoreService,
    private toastr: ToastrService
  ) {
    this.adminUnreadSubject = new BehaviorSubject<any>(0);
    this.adminUnread = this.adminUnreadSubject.asObservable();
  }

  addCount(count: number) {
    this.adminUnreadSubject.next(count);
  }

  message(roomId, clientId, message): Observable<any> {
    const url = `${this.baseURL}/message/${roomId}/${clientId}`;
    return this.http.post(url, message);
  }

  public initSocket(forceInit = false) {
    console.log("initSocket:called");
    if (forceInit && this.socket?.id && this.socket?.disconnect) {
      this.socket.disconnect();
    }
    if (!this.socket || forceInit) {
      if (!sessionStorage.webrtcDebug) {
        localStorage.socketQuery = `userId=${this.userUuid}&name=${this.userName}`;
      }
      this.socket = io(environment.socketURL, {
        query: localStorage.socketQuery,
      });
      this.onEvent("log").subscribe((array) => {
        if (localStorage.log === "1") console.log.apply(console, array);
      });
      this.initEvents();
    }
  }

  initEvents() {
    this.onEvent("allUsers").subscribe((data) => {
      this.activeUsers = data;
    });

    this.onEvent("cancel_hw").subscribe((data) => {
      this.toastr.error(`Call Cancelled.`, "Health Worker cancelled the call.");
      this.closeVcOverlay();
    });

    this.onEvent("incoming_call").subscribe((data = {}) => {
      if (!location.hash.includes("test/chat")) {
        localStorage.patientId = data.patientId;
        if (localStorage.patientId) {
          this.openVcOverlay(data);
        }
      }
    });
  }

  public emitEvent(action, data) {
    this.socket.emit(action, data);
  }

  public onEvent(action) {
    return new Observable<any>((observer) => {
      this.socket.on(action, (data) => observer.next(data));
    });
  }

  async showNotification({ title, body, timestamp = Date.now() }) {
    if ("Notification" in window === true) {
      if ("granted" === (await Notification.requestPermission())) {
        const icon = this.appIcon;
        return new Notification(title, {
          body,
          icon,
          vibrate: [200, 100, 200],
          timestamp: Math.floor(timestamp),
        });
      }
    }
  }

  public openVcOverlay(data: any) {
    this.cs.openVideoCallOverlayModal(data);
    this.callRing.play();
    setTimeout(() => {
      if (!this.webrtcSvc.callConnected) {
        this.closeVcOverlay();
      }
    }, 59000);
  }

  public closeVcOverlay() {
    const dailog = this.dialog.getDialogById("vcOverlayModal");
    if (dailog) {
      dailog.close();
    }
    this.callRing.pause();
  }

  public openNewVCModal(
    initiator = "dr",
    visitId = this.visitSvc.chatVisitId || ""
  ) {
    this.visitSvc.isVisitSummaryShow = true;
    const bodyElement = document.body;
    bodyElement.classList.add("body-hide-overflow");
    window.scroll(0, 0);
    const position: DialogPosition = {
      top: "90px",
      right: "0px",
    };
    const config: MatDialogConfig = {
      width: "calc(100% - 300px)",
      height: "82vh",
      maxHeight: "90vh",
      autoFocus: false,
      hasBackdrop: false,
      position,
      data: {
        patientUuid: localStorage.patientUuid,
        connectToDrId: localStorage.connectToDrId,
        visitId,
        initiator,
      },
    };
    // this.dialog.open(CallStateComponent, config);
    // this.dialog.open(CallStateComponent, {
    //   disableClose: true,
    //   data: {
    //     patientUuid: localStorage.patientUuid,
    //     initiator,
    //     connectToDrId: localStorage.connectToDrId,
    //   },
    // });
  }

  get user() {
    try {
      return JSON.parse(localStorage.user);
    } catch (error) {
      return {};
    }
  }

  get userUuid() {
    return this.user.uuid;
  }

  get userName() {
    return this.user.display;
  }

  close() {
    this.socket.close();
  }

  public initSocketSupport(forceInit = false) {
    if (forceInit && this.socket?.id && this.socket?.disconnect) {
      this.socket.disconnect();
    }
    if (!this.socket || forceInit) {
      this.socket = io(environment.socketURL, {
        query: `userId=${this.userUuid}&name=${this.userName}`
      });
    }
    this.initEvents();
  }
}
