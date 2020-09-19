import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Injectable } from '@angular/core';

@Injectable({
    providedIn: 'root'
})

export class PushNotificationsService {
    private baseURL =  environment.notificationURL;

    constructor(private http: HttpClient) { }

    postSubscription (sub: PushSubscription, speciality, providerName) {
        return this.http.post(`${this.baseURL}/subscribe`, {sub, speciality, providerName});
    }

    postNotification (payload) {
        return this.http.post(`${this.baseURL}/push`, payload);
    }
}
