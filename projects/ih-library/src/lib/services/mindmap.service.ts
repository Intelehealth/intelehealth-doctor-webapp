import { Observable } from "rxjs";
import { HttpClient } from "@angular/common/http";
import { Inject, Injectable } from "@angular/core";

@Injectable({
  providedIn: "root",
})
export class MindmapService {
  private mindmapURL;
 
  constructor(
    private http: HttpClient,
    @Inject('environment') environment
  ) {
    this.mindmapURL = environment.mindmapURL;
  }

  /**
  * Get mindmap keys
  * @return {Observable<any>}
  */
  getMindmapKey(): Observable<any> {
    const url = `${this.mindmapURL}/mindmap`;
    return this.http.get(url);
  }

  /**
  * Post mindmap
  * @param {any} value - Payload for post mindmap
  * @return {Observable<any>}
  */
  postMindmap(value): Observable<any> {
    const url = `${this.mindmapURL}/mindmap/upload`;
    return this.http.post(url, value);
  }

  /**
  * Get mindmap details from key
  * @param {string} key - Mindmap key
  * @return {Observable<any>}
  */
  detailsMindmap(key): Observable<any> {
    const url = `${this.mindmapURL}/mindmap/details/${key}`;
    return this.http.get(url);
  }

  /**
  * Add/update mindmap license key
  * @param {any} payload - Payload for mindmap key to add/update
  * @return {Observable<any>}
  */
  addUpdateLicenseKey(payload): Observable<any> {
    const url = `${this.mindmapURL}/mindmap/addUpdatekey`;
    return this.http.post(url, payload);
  }

  /**
  * Update mindmap key image
  * @param {string} key - Mindmap key
  * @param {string} imageName - Image name
  * @param {string} value - Image base64
  * @return {Observable<any>}
  */
  updateImage(key, imageName, value): Observable<any> {
    const url = `${this.mindmapURL}/mindmap/${key}/${imageName}`;
    return this.http.put(url, value);
  }

  /**
  * Delete mindmap
  * @param {string} key - Mindmap key
  * @param {any} data - Mindmap data
  * @return {Observable<any>}
  */
  deleteMindmap(key, data): Observable<any> {
    const url = `${this.mindmapURL}/mindmap/delete/${key}`;
    return this.http.post(url, data);
  }

  /**
  * Toggle mindmap status
  * @param {any} data - Mindmap data
  * @return {Observable<any>}
  */
  toggleMindmapStatus(data: any): Observable<any> {
    const url = `${this.mindmapURL}/mindmap/toggleStatus`;
    return this.http.post(url, data);
  }

    /**
  * Notify App side
  * @param {any} hwUuid - Healthworker Id
  * @param {any} payload - Notifaication message
  * @return {Observable<any>}
  */
  notifyApp(hwUuid: any, payload: any) : Observable<any>{
    return this.http.post(`${this.mindmapURL}/mindmap/notify-app/${hwUuid}`, payload)
  }


  /**
  * Send notification to health worker for available prescription
  * @returns {void}
  */
  notifyHwForRescheduleAppointment(appointment): void {
    const hwUuid = appointment?.hwUUID;
    const openMRSID = appointment?.openMrsId;
    const payload = {
      title: `Appointment rescheduled for ${appointment?.patientName || 'Patient'}`,
      body: "Click notification to see!",
      type: "appointment",
      data: {
        patientFirstName: appointment?.patientName ?? '',
        patientUuid: appointment?.patientId,
        patientOpenMrsId: openMRSID,
        visitUuid: appointment?.visitUuid,
        slotDateTime: appointment?.slotJsDate
      }
    }
    this.notifyApp(hwUuid, payload).subscribe();
  }
}
