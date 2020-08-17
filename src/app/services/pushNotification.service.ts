import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

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
    requestPermission(): void {
        if ('Notification' in window) {
            Notification.requestPermission((status) => {
                console.log(this.permission)
                return this.permission = status;
            });
        }
    }
    create(title: string, options ?: PushNotification): any {
        return new Observable((obs) => {
            console.log(this.permission)
            if (!('Notification' in window)) {
                console.log('Notifications are not available in this environment');
                obs.complete();
            }
            if (this.permission !== 'granted') {
                console.log('The user hasn\'t granted you permission to send push notifications');
                obs.complete();
            }
            try {
                navigator.serviceWorker.getRegistration()
                  .then((reg) => reg.showNotification('Hi there - persistent!'))
                  .catch((err) => alert('Service Worker registration error: ' + err));
              } catch (err) {
                alert('Notification API error: ' + err);
              }
            const _notify = new Notification(title, options);
            _notify.onshow = function(e) {
                return obs.next({
                    notification: _notify,
                    event: e
                });
            };
            _notify.onclick = function(e) {
                return obs.next({
                    notification: _notify,
                    event: e
                });
            };
            _notify.onerror = function(e) {
                return obs.error({
                    notification: _notify,
                    event: e
                });
            };
            _notify.onclose = function() {
                return obs.complete();
            };
        });
    }
    generateNotification(source): void {
        // source.forEach((item) => {
            const options = {
                body: source.alertContent,
                // icon: '../resource/images/bell-icon.png'
            };
            this.create(source.title, options).subscribe();
        // });
    }
}
export declare type Permission = 'denied' | 'granted' | 'default';
export interface PushNotification {
    body ?: string;
    icon ?: string;
    tag ?: string;
    data ?: any;
    renotify ?: boolean;
    silent ?: boolean;
    sound ?: string;
    noscreen ?: boolean;
    sticky ?: boolean;
    dir ?: 'auto' | 'ltr' | 'rtl';
    lang ?: string;
    vibrate ?: number[];
}
