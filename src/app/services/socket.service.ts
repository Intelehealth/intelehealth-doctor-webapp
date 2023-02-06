import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import {
  DialogPosition,
  MatDialog,
  MatDialogConfig,
} from "@angular/material/dialog";
import { Observable } from "rxjs";
import * as io from "socket.io-client";
import { environment } from "../../environments/environment";
import { CallStateComponent } from "../component/call-state/call-state.component";
import { VcComponent } from "../component/vc/vc.component";
import { VcallOverlayComponent } from "../component/vc/vcall-overlay/vcall-overlay.component";
import { VisitService } from "./visit.service";

@Injectable()
export class SocketService {
  public socket: any;
  public incoming;
  public activeUsers = [];
  appIcon =
    false && environment.production
      ? "/intelehealth/assets/images/intelehealth-logo-reverse.png"
      : "/assets/images/intelehealth-logo-reverse.png";

  private baseURL = environment.socketURL;

  constructor(
    private http: HttpClient,
    private dialog: MatDialog,
    private visitSvc: VisitService
  ) {}

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
      localStorage.socketQuery = `userId=${this.userUuid}&name=${this.userName}`;
      this.socket = io(environment.socketURL, {
        query: localStorage.socketQuery,
      });
      this.onEvent("allUsers").subscribe((data) => {
        this.activeUsers = data;
      });
      this.onEvent("incoming_call").subscribe((data = {}) => {
        if (!location.hash.includes("test/chat")) {
          localStorage.patientUuid = data.patientUuid;
          console.log("patientUuid: ", localStorage.patientUuid);
          if (localStorage.patientUuid) {
            this.openVcOverlay();
          }
        }
      });
      this.onEvent("log").subscribe((array) => {
        if (localStorage.log === "1") console.log.apply(console, array);
      });
    }
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

  callRing = new Audio("assets/phone.mp3");
  public openVcOverlay() {
    this.dialog.open(VcallOverlayComponent, {
      disableClose: false,
      hasBackdrop: true,
      id: "vcOverlay",
    });
    this.callRing.play();
    setTimeout(() => {
      this.closeVcOverlay();
    }, 10000);
  }

  public closeVcOverlay() {
    const dailog = this.dialog.getDialogById("vcOverlay");
    if (dailog) {
      dailog.close();
    }
    this.callRing.pause();
  }

  public openVcModal(initiator = "dr") {
    this.dialog.open(VcComponent, {
      disableClose: true,
      data: {
        patientUuid: localStorage.patientUuid,
        initiator,
        connectToDrId: localStorage.connectToDrId,
      },
    });
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
    this.dialog.open(CallStateComponent, config);
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
}
