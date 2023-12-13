import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { BehaviorSubject, Observable } from "rxjs";
import * as io from "socket.io-client";
import { environment } from "../../environments/environment";
import { doctorDetails } from "src/config/constant";
declare var getFromStorage: any;

@Injectable()
export class SocketService {
  public socket: any;
  public activeUsers = [];
  public incoming;
  public incomingCallData = {};
  public updateMessage: boolean = false;
  appIcon = "assets/images/intelehealth-logo-reverse.png";
  private baseURL = environment.socketURL;
  private adminUnreadSubject: BehaviorSubject<any>;
  public adminUnread: Observable<any>;

  constructor(private http: HttpClient) {
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
      this.activeUsers = data || [];
    });

    this.onEvent("updateMessage").subscribe((data) => {
      this.emitEvent('ack_msg_received', { messageId: data.id });
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

  public close() {
    this.socket.close();
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

  get user() {
    try {
      return getFromStorage(doctorDetails.USER);
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
}