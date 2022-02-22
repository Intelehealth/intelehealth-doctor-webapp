import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { environment } from "src/environments/environment";
declare var getFromStorage: any;

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

 getSpecialty() {
   let specialization = [];
    const userDetails = getFromStorage('provider');
    userDetails.attributes.forEach(element => {
      if (element.attributeType.uuid ===
        "ed1715f5-93e2-404e-b3c9-2a2d9600f062") {
        if (!element.voided)
          specialization.push({ value: element.value, uuid: element.uuid });
      }
    });
    return specialization;
  }
}