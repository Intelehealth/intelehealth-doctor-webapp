import { Injectable } from '@angular/core';

@Injectable({
    providedIn: 'root'
})

export class PushNotificationsService {
    constructor() {}

    generateNotification(message, body, data): void {
        const options = {
            body,
            // actions: [
            //   { action: 'refresh', title: 'Yes' },
            //   { action: 'cancel', title: 'No' }
            // ],
            data
        };
        try {
            navigator.serviceWorker.getRegistration()
              .then((reg) => reg.showNotification(message, options));
        } catch (err) {}
    }
}
