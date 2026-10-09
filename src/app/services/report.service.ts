import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { environment } from "src/environments/environment";
import { getCacheData, isFeaturePresent } from 'src/app/utils/utility-functions';
import { doctorDetails } from 'src/config/constant';

/**
 * Report email (address field + POST /pl, /vl with a receiver) is on for Turn servers,
 * or anywhere the reportEmail feature is listed.
 */
export const isReportEmailEnabled = (): boolean =>
  environment.isTurnServer === true || isFeaturePresent('reportEmail');

@Injectable({
  providedIn: "root",
})
export class ReoportService {

  constructor(private http: HttpClient) { }

  getReport(body) {
    if (body.reportId === 1) {
      if (isReportEmailEnabled()) {
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
      if (isReportEmailEnabled()) {
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
   * Logged-in username, passed to the report script for the audit log. Saved at login.
   */
  private getSessionUsername(): string {
    return getCacheData(false, doctorDetails.USER_NAME);
  }

  geWebrtcStatus() {
     return this.http.get(`${environment.mindmapURL}/mindmap/getWebrtcStatuses`);
  }
}
