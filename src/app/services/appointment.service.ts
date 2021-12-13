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

  getUserAppoitment(userUuid) {
    return this.http.get(`${this.baseURL}/appointment/getSchedule/${userUuid}`);
  }

  getUserSlots(userUuid, fromDate, toDate) {
    return this.http.get(
      `${this.baseURL}/appointment/getUserSlots/${userUuid}?fromDate=${fromDate}&toDate=${toDate}`
    );
  }
}
