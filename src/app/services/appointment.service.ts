import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { environment } from "src/environments/environment";

@Injectable({
  providedIn: "root",
})
export class AppointmentService {
  private baseURL = environment.mindmapURL;
  constructor(private http: HttpClient) {}

  /**
  * Create or update appointment
  * @param {any} payload - Payload for create or update appointment
  * @return {Observable<any>}
  */
  updateOrCreateAppointment(payload): Observable<any> {
    return this.http.post(
      `${this.baseURL}/appointment/createOrUpdateSchedule`,
      payload
    );
  }

  /**
  * Update daysOffs
  * @param {any} payload - Payload for update daysOff's
  * @return {Observable<any>}
  */
  updateDaysOff(payload) {
    return this.http.post(
      `${this.baseURL}/appointment/updateDaysOff`,
      payload
    );
  }

  /**
  * Get user appointments
  * @param {string} userUuid - User uuid
  * @param {string} year - Year
  * @param {string} month - Month
  * @return {Observable<any>}
  */
  getUserAppoitment(userUuid, year, month) {
    return this.http.get(
      `${this.baseURL}/appointment/getSchedule/${userUuid}?year=${year}&month=${month}`
    );
  }

  /**
  * Get user slots
  * @param {string} userUuid - User uuid
  * @param {string} fromDate - From date
  * @param {string} toDate - To date
  * @return {Observable<any>}
  */
  getUserSlots(userUuid, fromDate, toDate) {
    return this.http.get(
      `${this.baseURL}/appointment/getUserSlots/${userUuid}?fromDate=${fromDate}&toDate=${toDate}`
    );
  }

  /**
  * Get user appointment slots
  * @param {string} fromDate - From date
  * @param {string} toDate - To date
  * @param {string} speciality - Speciality
  * @return {Observable<any>}
  */
  getAppointmentSlots(fromDate, toDate, speciality) {
    return this.http.get(
      `${this.baseURL}/appointment/getAppointmentSlots?fromDate=${fromDate}&toDate=${toDate}&speciality=${speciality}`
    );
  }

  /**
  * Get appointment for a visit
  * @param {string} visitId - Visit uuid
  * @return {Observable<any>}
  */
  getAppointment(visitId) {
    return this.http.get(
      `${this.baseURL}/appointment/getAppointment/${visitId}`
    );
  }

  /**
  * Get scheduled months
  * @param {string} userUuid - User uuid
  * @param {string} year - Year
  * @return {Observable<any>}
  */
  getScheduledMonths(userUuid, year) {
    return this.http.get(
      `${this.baseURL}/appointment/getScheduledMonths/${userUuid}?year=${year}`
    );
  }

  /**
  * Get followup visits
  * @param {string} providerId - Provider uuid
  * @return {Observable<any>}
  */
  getFollowUpVisit(providerId) {
    return this.http.get(
      `${this.baseURL}/openmrs/getFollowUpVisit/${providerId}`
    );
  }

  /**
  * Reschedule appointment
  * @param {string} payload - Payload to reschedule appointment
  * @return {Observable<any>}
  */
  rescheduleAppointment(payload) {
    return this.http.post(
      `${this.baseURL}/appointment/rescheduleAppointment`,
      payload
    );
  }

  /**
  * Cancel appointment
  * @param {string} payload - Payload to cancel appointment
  * @return {Observable<any>}
  */
  cancelAppointment(payload) {
    return this.http.post(
      `${this.baseURL}/appointment/cancelAppointment`,
      payload
    );
  }

  /**
  * Complete appointment
  * @param {string} payload - Payload to complete appointment
  * @return {Observable<any>}
  */
  completeAppointment(payload) {
    return this.http.post(
      `${this.baseURL}/appointment/completeAppointment`,
      payload
    );
  }

  /**
  * Check appointment present or not
  * @param {string} userUuid - User uuid
  * @param {string} fromDate - From date
  * @param {string} toDate - To date
  * @param {string} speciality - Speciality
  * @return {Observable<any>}
  */
  checkAppointmentPresent(userUuid, fromDate, toDate, speciality) {
    return this.http.get(
      `${this.baseURL}/appointment/checkAppointment/${userUuid}?fromDate=${fromDate}&toDate=${toDate}&speciality=${speciality}`
    );
  }

  /**
  * Update speciality for the calendar slots
  * @param {string} userUuid - User uuid
  * @param {string} speciality - Speciality
  * @return {Observable<any>}
  */
  updateSlotSpeciality(userUuid, speciality) {
    return this.http.put(
      `${this.baseURL}/appointment/updateSlotSpeciality/${userUuid}?speciality=${speciality}`,
      null
    );
  }
}
