import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import * as io from "socket.io-client";
import { environment } from "../../environments/environment";

@Injectable()
export class SocketService {
  public socket: any;
  public activeUsers = [];
  appIcon = "assets/images/intelehealth-logo-reverse.png";
  private baseURL = environment.socketURL;

  constructor(private http: HttpClient) {}

  message(roomId, clientId, message): Observable<any> {
    const url = `${this.baseURL}/message/${roomId}/${clientId}`;
    return this.http.post(url, message);
  }

  public initSocket(forceInit = false) {
    if (forceInit && this.socket?.id && this.socket?.disconnect) {
      this.socket.disconnect();
    }
    if (!this.socket || forceInit) {
      this.socket = io(environment.socketURL, {
        query: localStorage.socketQuery,
      });
      this.onEvent("allUsers").subscribe((data) => {
        this.activeUsers = data;
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
}