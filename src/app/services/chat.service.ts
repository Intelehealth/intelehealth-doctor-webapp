import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { ToastrService } from "ngx-toastr";
import { of, Subject } from "rxjs";
import { map } from "rxjs/operators";
import { environment } from "src/environments/environment";
import { getCacheData } from "../utils/utility-functions";
import { doctorDetails } from "src/config/constant";
import { ApiResponseModel, MessageModel } from "../model/model";

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
      (res: ApiResponseModel) => {
        res.data = res.data.sort((a: MessageModel, b: MessageModel) => new Date(b.createdAt) < new Date(a.createdAt) ? -1 : 1);
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
      return getCacheData(true, doctorDetails.USER);
    } catch (error) {
      return {};
    }
  }

  isPdf(url) {
    return url.includes('.pdf');
  }

  uploadAttachment(files, messages = []) {
    if (files.length) {
      const file = files[0];

      if (messages.length) {
        if (this.isPdf(file.name)) {
          const pdfCount = messages.reduce((total: number, item: any) => total + ((item.type === 'attachment' && this.isPdf(item.message)) ? 1 : 0), 0)

          if (pdfCount >= 2) {
            this.toastr.warning('PDF upload capacity exceeded, only 2 per chat allowed.');
            return of(true);
            return;
          }
        } else {
          const imageCount = messages.reduce((total: number, item: any) => total + ((item.type === 'attachment' && !this.isPdf(item.message)) ? 1 : 0), 0)

          if (imageCount >= 5) {
            this.toastr.warning('Image upload capacity exceeded, only 5 per chat allowed.');
            return of(true);
            return;
          }
        }
      }

      if (!['image/png', 'image/jpg', 'image/jpeg', 'application/pdf'].includes(file.type)) {
        this.toastr.warning(`${file.type} is not allowed to upload.`);
        return of(true);
        return;
      }

      switch (true) {
        case (['image/png', 'image/jpg', 'image/jpeg'].includes(file.type) && (file.size / 1000) > 500): {
          this.toastr.warning('File should be less than 500KB.');
          return of(true);
          return;
        }

        case (['application/pdf'].includes(file.type) && (file.size / 1000) > 1000): {
          this.toastr.warning('File should be less than 500KB.');
          return of(true);
          return;
        }
      }

      const formData = new FormData();

      const type = file.type || 'file';

      formData.append(type, file);
      return this.http.post(`${this.baseURL}/messages/upload?ngsw-bypass=true`, formData);
    }
  }
}
