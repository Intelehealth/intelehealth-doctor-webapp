import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Subject } from "rxjs";
import { environment } from "src/environments/environment";

@Injectable({
  providedIn: "root",
})
export class ChatService {
  private baseURL = environment.mindmapURL;
  popUpCloseEmitter = new Subject();
  constructor(private http: HttpClient) {}

  sendMessage(toUser, patientId, message, additionalPayload = {}) {
    const payload = {
      ...additionalPayload,
      fromUser: this.user.uuid,
      toUser,
      patientId,
      message,
    };
    return this.http.post(`${this.baseURL}/messages/sendMessage`, payload);
  }

  getPatientMessages(toUser, patientId, fromUser = this.user.uuid) {
    return this.http.get(
      `${this.baseURL}/messages/${fromUser}/${toUser}/${patientId}`
    );
  }

  get user() {
    try {
      return JSON.parse(localStorage.user);
    } catch (error) {
      return {};
    }
  }
}
