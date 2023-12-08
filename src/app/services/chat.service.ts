import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable, Subject, of } from "rxjs";
import { map } from "rxjs/operators";
import { environment } from "src/environments/environment";
import { ToastService } from "./toast.service";

@Injectable({
  providedIn: "root",
})
export class ChatService {
  private baseURL = environment.mindmapURL;
  popUpCloseEmitter = new Subject();
  constructor(private http: HttpClient, private toastr: ToastService) {}

  sendMessage(toUser, patientId, message, additionalPayload = {}) {
    const payload = {
      ...additionalPayload,
      fromUser: this.user.uuid,
      toUser,
      patientId,
      message,
    };
    return this.http.post(`${this.baseURL}/messages/sendMessage?ngsw-bypass=true`, payload);
  }

  getPatientMessages(toUser, patientId, fromUser = this.user.uuid, visitId: string = "") {
    let chatUrl = `${this.baseURL}/messages/${fromUser}/${toUser}/${patientId}?ngsw-bypass=true`
  
    if(visitId) {
      chatUrl += `&visitId=${visitId}`
    }
    return this.http.get(chatUrl).pipe(map(
      (res: any) => {
        res.data = res.data.sort((a: any, b: any) => new Date(b.createdAt) < new Date(a.createdAt) ? -1 : 1);
        return res;
      }
    ));
  }

  get user() {
    try {
      return JSON.parse(localStorage.user);
    } catch (error) {
      return {};
    }
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
            this.toastr.toast('PDF upload capacity exceeded, only 2 per chat allowed.');
            return of(true);
          }
        } else {
          const imageCount = messages.reduce((total: number, item: any) => total + ((item.type === 'attachment' && !this.isPdf(item.message)) ? 1 : 0), 0)


          if (imageCount >= 5) {
            this.toastr.toast('Image upload capacity exceeded, only 5 per chat allowed.');
            return of(true);
          }
        }
      }

      if (!['image/png', 'image/jpg', 'image/jpeg', 'application/pdf'].includes(file.type)) {
        this.toastr.toast(`${file.type} is not allowed to upload.`);
        return of(true);
      }

      switch (true) {
        case (['image/png', 'image/jpg', 'image/jpeg'].includes(file.type) && (file.size / 1000) > 500): {
          this.toastr.toast('File should be less than 500KB.');
          return of(true);
        }

        case (['application/pdf'].includes(file.type) && (file.size / 1000) > 1000): {
          this.toastr.toast('File should be less than 500KB.');
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
