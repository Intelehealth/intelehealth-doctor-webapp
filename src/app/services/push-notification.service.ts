import { HttpClient } from "@angular/common/http";
import { environment } from "../../environments/environment";
import { Injectable } from "@angular/core";
import { map } from "rxjs/operators";
import { SwPush, SwUpdate } from "@angular/service-worker";

@Injectable({
  providedIn: "root",
})
export class PushNotificationsService {
  private baseURL = environment.notificationURL;
  public snoozeTimeout = null;

  constructor(
    private http: HttpClient,
    public swUpdate: SwUpdate,
    public swPush: SwPush
  ) {}

  postSubscription(sub: PushSubscription, speciality, providerName) {
    return this.http.post(`${this.baseURL}/subscribe`, {
      sub,
      speciality,
      providerName,
    });
  }

  postNotification(payload) {
    return this.http.post(`${this.baseURL}/push`, payload).pipe(
      map((res) => {
        this.notificationHandler();
        return res;
      })
    );
  }

  setSnoozeFor(snooze_for) {
    return this.http.put(
      `${environment.mindmapURL}/mindmap/snooze_notification`,
      {
        user_uuid: JSON.parse(localStorage.user).uuid,
        snooze_for,
      }
    );
  }

  getUserSettings(_uuid?) {
    const uuid = _uuid ? _uuid : JSON.parse(localStorage.user).uuid;
    return this.http.get(
      `${environment.mindmapURL}/mindmap/user_settings/${uuid}`
    );
  }

  notificationHandler() {
    navigator.serviceWorker.addEventListener("message", (event) => {
      switch (event.data.type) {
        case "PUSH":
          if (!this.snoozeTimeout) {
            const ctrl = navigator.serviceWorker.controller;
            ctrl.postMessage({
              type: "IntelehealthNotification",
              data: event.data,
            });
          }
          break;
        default:
          // console.log(event.data);
      }
    });
  }
}
