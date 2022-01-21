import { HttpClient } from "@angular/common/http";
import { environment } from "../../environments/environment";
import { Injectable } from "@angular/core";

@Injectable({
  providedIn: "root",
})
export class PushNotificationsService {
  private baseURL = environment.notificationURL;
  public snoozeTimeout = null;

  constructor(private http: HttpClient) {}

  postSubscription(
    sub: PushSubscription,
    speciality,
    providerName,
    user_uuid,
    finger_print
  ) {
    return this.http.post(`${this.baseURL}/subscribe`, {
      sub,
      speciality,
      providerName,
      user_uuid,
      finger_print,
    });
  }

  postNotification(payload) {
    return this.http.post(`${this.baseURL}/push`, payload);
  }

  unsubscribeNotification(payload) {
    return this.http.post(`${this.baseURL}/unsubscribe`, payload);
  }

  //Snooze notification functionality
  setSnoozeFor(snooze_for, custom = false) {
    return this.http.put(
      `${environment.mindmapURL}/mindmap/snooze_notification`,
      {
        user_uuid: JSON.parse(localStorage.user).uuid,
        snooze_for,
        custom,
      }
    );
  }

  getUserSettings(_uuid?) {
    const uuid = _uuid ? _uuid : JSON.parse(localStorage.user).uuid;
    return this.http.get(
      `${environment.mindmapURL}/mindmap/user_settings/${uuid}`
    );
  }

  changePassword(json) {
    return this.http.post(`${this.baseURL}/changePassword`, json);
  }
}
