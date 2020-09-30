import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Injectable } from '@angular/core';

@Injectable({
    providedIn: 'root'
})

export class PushNotificationsService {
    private baseURL =  environment.notificationURL;
    public snoozeTimeout =  null;

    constructor(private http: HttpClient) { }

    postSubscription (sub: PushSubscription, speciality, providerName) {
        return this.http.post(`${this.baseURL}/subscribe`, {sub, speciality, providerName});
    }

    postNotification (payload) {
        return this.http.post(`${this.baseURL}/push`, payload);
    }
    
    setSnoozeFor(snooze_for) {
        return this.http.put(`${environment.mindmapURL}/mindmap/snooze_notification`, {
          user_uuid:JSON.parse(localStorage.user).uuid,
          snooze_for,
        });
    }

    getUserSettings(_uuid?) {
        const uuid = _uuid ? _uuid : JSON.parse(localStorage.user).uuid;
        return this.http.get(
          `${environment.mindmapURL}/mindmap/user_settings/${uuid}`
        );
    }
}
