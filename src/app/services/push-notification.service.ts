import { Injectable } from '@angular/core';

@Injectable({
    providedIn: 'root'
})

export class PushNotificationsService {
    public permission: Permission;

    constructor() {
        this.permission = this.isSupported() ? 'default' : 'denied';
    }

    public isSupported(): boolean {
        return 'Notification' in window;
    }

    requestPermission() {
        const self = this;
        if ('Notification' in window) {
            Notification.requestPermission(function(status) {
                return self.permission = status;
            });
        }
    }

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

export declare type Permission = 'denied' | 'granted' | 'default';
