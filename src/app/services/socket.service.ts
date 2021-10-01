import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { environment } from "../../environments/environment";
import { io } from "socket.io-client";

@Injectable()
export class SocketService {
  public socket: any;
  public activeUsers = [];

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

  async showNotification({ title, body, timestamp = Date.now() }) {
    if ("Notification" in window === true) {
      if ("granted" === (await Notification.requestPermission())) {
        return new Notification(title, {
          body,
          icon: "assets/images/intelehealth-logo-reverse.png",
          vibrate: [200, 100, 200],
          timestamp: Math.floor(timestamp),
        });
      }
    }
  }
}
