import { Inject, Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class IhChatService {

  constructor(@Inject('ChatConfig') private config: any) {
    console.log('Chat Service Initialized with config:', config);
  }

  trackEvent(event: string) {
    console.log(`Tracking Event: ${event}, ID: ${this.config.trackingId}, Env: ${this.config.env}`);
  }
}
