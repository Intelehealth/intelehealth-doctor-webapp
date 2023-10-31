import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { ToastrService } from "ngx-toastr";
import { Observable, of, Subject } from "rxjs";
import { map } from "rxjs/operators";
import { environment } from "src/environments/environment";
import { getCacheData } from "../utils/utility-functions";
import { doctorDetails } from "src/config/constant";
import { ApiResponseModel, MessageModel, UserModel } from "../model/model";

@Injectable({
  providedIn: "root",
})
export class ChatService {
  private baseURL = environment.mindmapURL;
  popUpCloseEmitter = new Subject();
  constructor(
    private http: HttpClient,
    private toastr: ToastrService
  ) { }

  /**
  * Send message
  * @param {string} to - To user uuid
  * @param {string} patientId - Patient uuid
  * @param {string} message - Message
  * @param {any} additionalPayload - Additional payload for send message if any
  * @param {string} fromUser - From user uuid
  * @return {Observable<any>}
  */
  sendMessage(toUser, patientId, message, additionalPayload = {}, fromUser = this.user.uuid): Observable<any> {
    const payload = {
      ...additionalPayload,
      fromUser,
      toUser,
      patientId,
      message,
    };
    return this.http.post(`${this.baseURL}/messages/sendMessage?ngsw-bypass=true`, payload);
  }

  /**
  * Get patient messages
  * @param {string} toUser - To user uuid
  * @param {string} patientId - Patient uuid
  * @param {string} fromUser - From user uuid
  * @param {string} visitId - Visit uuid
  * @return {Observable<any>}
  */
  getPatientMessages(
    toUser,
    patientId,
    fromUser = this.user.uuid,
    visitId: string = ""
  ): Observable<any> {
    return this.http.get(
      `${this.baseURL}/messages/${fromUser}/${toUser}/${patientId}?visitId=${visitId}&ngsw-bypass=true`
    ).pipe(map(
      (res: ApiResponseModel) => {
        res.data = res.data.sort((a: MessageModel, b: MessageModel) => new Date(b.createdAt) < new Date(a.createdAt) ? -1 : 1);
        return res;
      }
    ))
  }

  /**
  * Get all message for from user and to user
  * @param {string} toUser - To user uuid
  * @param {string} fromUser - From user uuid
  * @return {Observable<any>}
  */
  getAllMessages(toUser, fromUser = this.user.uuid) {
    return this.http.get(`${this.baseURL}/messages/${fromUser}/${toUser}?ngsw-bypass=true`);
  }

  /**
  * Get patients list
  * @param {string} drUuid - Doctor user uuid
  * @return {Observable<any>}
  */
  getPatientList(drUuid): Observable<any> {
    return this.http.get(
      `${this.baseURL}/messages/getPatientMessageList?drUuid=${drUuid}&ngsw-bypass=true`
    );
  }

  /**
  * Get patients all visits
  * @param {string} patientId - Patient uuid
  * @return {Observable<any>}
  */
  getPatientAllVisits(patientId: string): Observable<any> {
    return this.http.get(`${this.baseURL}/messages/${patientId}?ngsw-bypass=true`);
  }

  /**
  * Read message by message id
  * @param {number} messageId - Message Id
  * @return {Observable<any>}
  */
  readMessageById(messageId: number): Observable<any> {
    return this.http.put(`${this.baseURL}/messages/read/${messageId}?ngsw-bypass=true`, "");
  }

  /**
  * Get user from localstorage
  * @return {any} - User
  */
  public get user() {
    try {
      return getCacheData(true, doctorDetails.USER);
    } catch (error) {
      return {};
    }
  }

  /**
  * Check if url is for pdf or not
  * @param {string} url - Url
  * @return {boolean} - True if pdf else false
  */
  isPdf(url) {
    return url.includes('.pdf');
  }

  /**
  * Upload attachments
  * @param {File[]} files - Array of files
  * @param {MessageModel[]} messages - Messages
  * @return {Observable<any>|any}
  */
  uploadAttachment(files, messages = []) {
    if (files.length) {
      const file = files[0];

      if (messages.length) {
        if (this.isPdf(file.name)) {
          const pdfCount = messages.reduce((total: number, item: any) => total + ((item.type === 'attachment' && this.isPdf(item.message)) ? 1 : 0), 0)

          if (pdfCount >= 2) {
            this.toastr.warning('PDF upload capacity exceeded, only 2 per chat allowed.');
            return of(true);
          }
        } else {
          const imageCount = messages.reduce((total: number, item: any) => total + ((item.type === 'attachment' && !this.isPdf(item.message)) ? 1 : 0), 0)


          if (imageCount >= 5) {
            this.toastr.warning('Image upload capacity exceeded, only 5 per chat allowed.');
            return of(true);
          }
        }
      }

      if (!['image/png', 'image/jpg', 'image/jpeg', 'application/pdf'].includes(file.type)) {
        this.toastr.warning(`${file.type} is not allowed to upload.`);
        return of(true);
      }

      switch (true) {
        case (['image/png', 'image/jpg', 'image/jpeg'].includes(file.type) && (file.size / 1000) > 500): {
          this.toastr.warning('File should be less than 500KB.');
          return of(true);
        }

        case (['application/pdf'].includes(file.type) && (file.size / 1000) > 1000): {
          this.toastr.warning('File should be less than 500KB.');
          return of(true);
        }
      }

      const formData = new FormData();

      const type = file.type || 'file';

      formData.append(type, file);
      return this.http.post(`${this.baseURL}/messages/upload?ngsw-bypass=true`, formData);
    }
  }
}
