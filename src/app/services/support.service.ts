import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { ApiResponseModel, MessageModel } from '../model/model';

@Injectable({
  providedIn: 'root'
})
export class SupportService {
  baseURL: string = environment.mindmapURL;

  constructor(private http: HttpClient) { }

  sendMessage(payload: any): Observable<any> {
    return this.http.post(`${this.baseURL}/support/sendMessage?ngsw-bypass=true`, payload);
  }

  readMessageById(userId: string, messageId: number) {
    return this.http.put(`${this.baseURL}/support/read/${userId}/${messageId}?ngsw-bypass=true`, "");
  }

  getSupportMessages(from: string, to: string) {
    return this.http.get(`${this.baseURL}/support/getMessages/${from}/${to}?ngsw-bypass=true`).pipe(map(
      (res: ApiResponseModel) => {
        res.data = res.data.sort((a: MessageModel, b: MessageModel) => new Date(b.createdAt) < new Date(a.createdAt) ? -1 : 1);
        return res;
      }
    ));
  }

  getDoctorsList(userUuid: string) {
    return this.http.get(`${this.baseURL}/support/getDoctorsList/${userUuid}?ngsw-bypass=true`);
  }

  raiseTicket(data: { title: string, description: string, priority: string }): Observable<any> {
    return this.http.post(`https://demo.intelehealth.org/createticket`, data);
  }

  storeTicket(userUuid: string, data: { ticketnumber: string }): Observable<any> {
    return this.http.post(`${this.baseURL}/support/createTicket/${userUuid}`, data);
  }
}
