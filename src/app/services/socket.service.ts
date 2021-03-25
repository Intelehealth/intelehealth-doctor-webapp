import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import * as io from "socket.io-client";
import { environment } from "../../environments/environment";

export interface Notification {
  from: string;
  peerid: string;
}

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

  public initSocket() {
    this.socket = io(environment.socketURL, {
      query: localStorage.socketQuery,
    });

    this.onEvent("allUsers").subscribe((data) => {
      const users = Object.keys(data);
      this.activeUsers = users;
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
}
