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

  getPatientMessages(
    toUser,
    patientId,
    fromUser = this.user.uuid,
    visitId: string = ""
  ) {
    return this.http.get(
      `${this.baseURL}/messages/${fromUser}/${toUser}/${patientId}?visitId=${visitId}`
    );
  }

  getAllMessages(toUser, fromUser = this.user.uuid) {
    return this.http.get(`${this.baseURL}/messages/${fromUser}/${toUser}`);
  }

  getPatientList(drUuid) {
    return this.http.get(
      `${this.baseURL}/messages/getPatientMessageList?drUuid=${drUuid}`
    );
  }

  getPatientAllVisits(patientId) {
    return this.http.get(`${this.baseURL}/messages/${patientId}`);
  }

  readMessageById(messageId) {
    return this.http.put(`${this.baseURL}/messages/read/${messageId}`, "");
  }

  public get user() {
    try {
      return JSON.parse(localStorage.user);
    } catch (error) {
      return {};
    }
  }
}
