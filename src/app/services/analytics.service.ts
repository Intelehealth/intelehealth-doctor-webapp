import { Injectable } from '@angular/core';
import { environment } from "src/environments/environment";

declare let gtag: Function; // declare GA global function

@Injectable({
  providedIn: 'root'
})
export class AnalyticsService {
  private measurementId = environment.gaMeasurementId;
  constructor() {}

  /**
   * Track page views
   * @param url string - current route path
   */
  logPageView(url: string) {
    gtag('config', this.measurementId, {   // Replace with your Measurement ID
      page_path: url,
      debug_mode: true 
    });
  }

  /**
   * Track custom events
   * @param action string - event name
   * @param category string - event category
   * @param label string - event label
   * @param value number - optional value
   */
  logEvent(action: string, category: string, label: string = '', value?: number,  params?: { [key: string]: any }) {
    if (!this.measurementId) return;
    gtag('event', action, {
      event_category: category,
      event_label: label,
      value: value,
       ...params,  
      debug_mode: true 
    });
  }
}


