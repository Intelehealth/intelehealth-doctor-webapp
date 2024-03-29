import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { environment } from "src/environments/environment";

@Injectable({
  providedIn: "root",
})
export class AppointmentService {
  private baseURL = environment.mindmapURL;
  constructor(private http: HttpClient) {}

  updateOrCreateAppointment(payload) {
    return this.http.post(
      `${this.baseURL}/appointment/createOrUpdateSchedule`,
      payload
    );
  }

  updateDaysOff(payload) {
    return this.http.post(
      `${this.baseURL}/appointment/updateDaysOff`,
      payload
    );
  }

  getUserAppoitment(userUuid, year, month) {
    return this.http.get(
      `${this.baseURL}/appointment/getSchedule/${userUuid}?year=${year}&month=${month}`
    );
  }

  getUserSlots(userUuid, fromDate, toDate) {
    return this.http.get(
      `${this.baseURL}/appointment/getUserSlots/${userUuid}?fromDate=${fromDate}&toDate=${toDate}`
    );
  }

  getAppointmentSlots(fromDate, toDate, speciality) {
    return this.http.get(
      `${this.baseURL}/appointment/getAppointmentSlots?fromDate=${fromDate}&toDate=${toDate}&speciality=${speciality}`
    );
  }

  getAppointment(visitId) {
    return this.http.get(
      `${this.baseURL}/appointment/getAppointment/${visitId}`
    );
  }

  getScheduledMonths(userUuid, year) {
    return this.http.get(
      `${this.baseURL}/appointment/getScheduledMonths/${userUuid}?year=${year}`
    );
  }

  getFollowUpVisit(providerId) {
    return this.http.get(
      `${this.baseURL}/openmrs/getFollowUpVisit/${providerId}`
    );
  }

  rescheduleAppointment(payload) {
    return this.http.post(
      `${this.baseURL}/appointment/rescheduleAppointment`,
      payload
    );
  }

  cancelAppointment(payload) {
    return this.http.post(
      `${this.baseURL}/appointment/cancelAppointment`,
      payload
    );
  }

  completeAppointment(payload) {
    return this.http.post(
      `${this.baseURL}/appointment/completeAppointment`,
      payload
    );
  }
}
