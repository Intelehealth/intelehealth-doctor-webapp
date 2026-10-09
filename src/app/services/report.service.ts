import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { environment } from "src/environments/environment";
import { getCacheData, isFeaturePresent } from 'src/app/utils/utility-functions';
import { doctorDetails } from 'src/config/constant';

@Injectable({
  providedIn: "root",
})
export class ReoportService {

  constructor(private http: HttpClient) { }

  getReport(body) {
    if (body.reportId === 1) {
      if (isFeaturePresent('reportEmail')) {
        return this.http.post(
          `${environment.base}/pl`,
          {
            startDate: body.selectedData.value.field1,
            endDate: body.selectedData.value.field2,
            receiver: body.selectedData.value.field3,
            username: this.getSessionUsername()
          },
          { reportProgress: true, observe: "events" });
      }
      return this.http.get(
        `${environment.base}/pl/${body.selectedData.value.field1}/${body.selectedData.value.field2}`, { reportProgress: true, observe: "events" });
    }

    if (body.reportId === 2) {
      if (isFeaturePresent('reportEmail')) {
        return this.http.post(
          `${environment.base}/vl`,
          {
            startDate: body.selectedData.value.field1,
            endDate: body.selectedData.value.field2,
            receiver: body.selectedData.value.field3,
            username: this.getSessionUsername()
          },
          { reportProgress: true, observe: "events" });
      }
      return this.http.get(
        `${environment.base}/vl/${body.selectedData.value.field1}/${body.selectedData.value.field2}`, { reportProgress: true, observe: "events" });
    }
  }

  /**
   * Logged-in username, passed to the report script for the audit log.
   * Saved at login; falls back to the OpenMRS session user for sessions started before it was stored.
   */
  private getSessionUsername(): string {
    const username = getCacheData(false, doctorDetails.USER_NAME);
    return username;
  }

  geWebrtcStatus() {
     return this.http.get(`${environment.mindmapURL}/mindmap/getWebrtcStatuses`);
  }
}
