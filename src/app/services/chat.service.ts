import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Subject } from "rxjs";
import { map } from "rxjs/operators";
import { environment } from "src/environments/environment";

@Injectable({
  providedIn: "root",
})
export class ChatService {
  private baseURL = environment.mindmapURL;
  popUpCloseEmitter = new Subject();
  constructor(private http: HttpClient) { }

  sendMessage(toUser, patientId, message, additionalPayload = {}, fromUser = this.user.uuid) {
    const payload = {
      ...additionalPayload,
      fromUser,
      toUser,
      patientId,
      message,
    };
    return this.http.post(`${this.baseURL}/messages/sendMessage?ngsw-bypass=true`, payload);
  }

  getPatientMessages(
    toUser,
    patientId,
    fromUser = this.user.uuid,
    visitId: string = ""
  ) {
    return this.http.get(
      `${this.baseURL}/messages/${fromUser}/${toUser}/${patientId}?visitId=${visitId}&ngsw-bypass=true`
    ).pipe(map(
      (res: any) => {
        res.data = res.data.sort((a: any, b: any) => new Date(b.createdAt) < new Date(a.createdAt) ? -1 : 1);
        return res;
      }
    ))
  }

  getAllMessages(toUser, fromUser = this.user.uuid) {
    return this.http.get(`${this.baseURL}/messages/${fromUser}/${toUser}?ngsw-bypass=true`);
  }

  getPatientList(drUuid) {
    return this.http.get(
      `${this.baseURL}/messages/getPatientMessageList?drUuid=${drUuid}&ngsw-bypass=true`
    );
  }

  getPatientAllVisits(patientId) {
    return this.http.get(`${this.baseURL}/messages/${patientId}?ngsw-bypass=true`);
  }

  readMessageById(messageId) {
    return this.http.put(`${this.baseURL}/messages/read/${messageId}?ngsw-bypass=true`, "");
  }

  public get user() {
    try {
      return JSON.parse(localStorage.user);
    } catch (error) {
      return {};
    }
  }

  uploadAttachment(payload) {
    return this.http.post(`${this.baseURL}/messages/upload?ngsw-bypass=true`, payload);
  }
}
