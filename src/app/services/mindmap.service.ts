import { Observable } from "rxjs";
import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { environment } from "../../environments/environment";

@Injectable({
  providedIn: "root",
})
export class MindmapService {
  private baseURL = environment.mindmapURL;

  constructor(private http: HttpClient) { }

  /**
  * Get mindmap keys
  * @return {Observable<any>}
  */
  getMindmapKey(): Observable<any> {
    const url = `${this.baseURL}/mindmap`;
    return this.http.get(url);
  }

  /**
  * Post mindmap
  * @param {any} value - Payload for post mindmap
  * @return {Observable<any>}
  */
  postMindmap(value): Observable<any> {
    const url = `${this.baseURL}/mindmap/upload`;
    return this.http.post(url, value);
  }

  /**
  * Get mindmap details from key
  * @param {string} key - Mindmap key
  * @return {Observable<any>}
  */
  detailsMindmap(key): Observable<any> {
    const url = `${this.baseURL}/mindmap/details/${key}`;
    return this.http.get(url);
  }

  /**
  * Add/update mindmap license key
  * @param {any} payload - Payload for mindmap key to add/update
  * @return {Observable<any>}
  */
  addUpdateLicenseKey(payload): Observable<any> {
    const url = `${this.baseURL}/mindmap/addUpdatekey`;
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
    const url = `${this.baseURL}/mindmap/${key}/${imageName}`;
    return this.http.put(url, value);
  }

  /**
  * Delete mindmap
  * @param {string} key - Mindmap key
  * @param {any} data - Mindmap data
  * @return {Observable<any>}
  */
  deleteMindmap(key, data): Observable<any> {
    const url = `${this.baseURL}/mindmap/delete/${key}`;
    return this.http.post(url, data);
  }

  /**
  * Toggle mindmap status
  * @param {any} data - Mindmap data
  * @return {Observable<any>}
  */
  toggleMindmapStatus(data: any): Observable<any> {
    const url = `${this.baseURL}/mindmap/toggleStatus`;
    return this.http.post(url, data);
  }

    /**
  * Notify App side
  * @param {any} hwUuid - Healthworker Id
  * @param {any} payload - Notifaication message
  * @return {Observable<any>}
  */
  notifyApp(hwUuid: any, payload: any) : Observable<any>{
    return this.http.post(`${environment.mindmapURL}/mindmap/notify-app/${hwUuid}`, payload)
  }

  /**
  * Notify the patient on WhatsApp (via the Turn microservice) that their
  * prescription is ready. Gated by the environment.isTurnServer flag: only runs
  * when that flag is true, so environments that don't enable it keep their
  * existing behaviour with no change. turn-io resolves the patient's phone from
  * the visit itself, so it only needs the visit_uuid. Fire-and-forget.
  * @param {string} visitUuid - OpenMRS visit uuid of the shared prescription
  * @return {void}
  */
  notifyPrescriptionOnTurn(visitUuid: string): void {
    const isTurnServer = (environment as any).isTurnServer === true;
    const turnUrl = (environment as any).turnNotifyURL;
    if (!isTurnServer || !turnUrl || !visitUuid) {
      return;
    }
    this.http
      .post(`${turnUrl.replace(/\/+$/, '')}/webhooks/turn/prescription/notify`, { visit_uuid: visitUuid })
      .subscribe({
        next: () => console.log('Turn prescription notify sent'),
        error: (err) => console.error('Turn prescription notify failed:', err)
      });
  }


  /**
  * Send notification to health worker for available prescription
  * @returns {void}
  */
  notifyHwForRescheduleAppointment(appointment): void {
    const hwUuid = appointment?.hwUUID;

    if (!hwUuid) {
      console.warn('Cannot send reschedule notification: Health worker UUID is not available');
      return;
    }

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
    console.log("payload for notification:",payload);
    this.notifyApp(hwUuid, payload).subscribe({
      next: () => console.log('Reschedule notification sent successfully'),
      error: (err) => console.error('Failed to send reschedule notification:', err)
    });
  }
  /**
  * Send cancel notification to health worker
  * @returns {void}
  */
  notifyHwForCancelAppointment(appointment): void {
    console.log("inside cancell notification");
    const hwUuid = appointment?.hwUUID;

    if (!hwUuid) {
      console.warn('Cannot send cancel notification: Health worker UUID is not available');
      return;
    }

    const openMRSID = appointment?.openMrsId;
    const payload = {
      title: `Appointment cancelled for ${appointment?.patientName || 'Patient'}`,
      body: "Click notification to see!",
      type: "cancel",
      data: {
        patientFirstName: appointment?.patientName ?? '',
        patientUuid: appointment?.patientId,
        patientOpenMrsId: openMRSID,
        visitUuid: appointment?.visitUuid,
        slotDateTime: appointment?.slotJsDate
      }
    }
    console.log("payload===",payload);
    this.notifyApp(hwUuid, payload).subscribe({
      next: () => console.log('Cancel notification sent successfully'),
      error: (err) => console.error('Failed to send cancel notification:', err)
    });
  }
}
