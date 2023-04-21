import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { environment } from "src/environments/environment";

@Injectable({
  providedIn: "root",
})
export class AppointmentService {
  private baseURL = environment.authGatwayURL;
  constructor(private http: HttpClient) { }

  updateOrCreateAppointment(payload) {
    return this.http.post(
      `${this.baseURL}node/api/appointment/createOrUpdateSchedule`,
      payload
    );
  }

  getUserAppoitment(userUuid, year, month) {
    return this.http.get(
      `${this.baseURL}node/api/appointment/getSchedule/${userUuid}?year=${year}&month=${month}`
    );
  }

  getUserSlots(userUuid, fromDate, toDate) {
    return this.http.get(
      `${this.baseURL}node/api/appointment/getUserSlots/${userUuid}?fromDate=${fromDate}&toDate=${toDate}`
    );
  }

  getAppointmentSlots(fromDate, toDate, speciality) {
    return this.http.get(
      `${this.baseURL}node/api/appointment/getAppointmentSlots?fromDate=${fromDate}&toDate=${toDate}&speciality=${speciality}`
    );
  }

  rescheduleAppointment(payload) {
    return this.http.post(
      `${this.baseURL}node/api/appointment/rescheduleAppointment`,
      payload
    );
  }

  cancelAppointment(payload) {
    return this.http.post(
      `${this.baseURL}node/api/appointment/cancelAppointment`,
      payload
    );
  }
}
