import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { environment } from "src/environments/environment";
import { isFeaturePresent } from 'src/app/utils/utility-functions';

@Injectable({
  providedIn: "root",
})
export class ReoportService {

  constructor(private http: HttpClient) { }

  getReport(body) {
    if (body.reportId === 1) {
      if (isFeaturePresent('reportEmail')) {
        return this.http.get(
          `${environment.base}/pl/${body.selectedData.value.field1}/${body.selectedData.value.field2}`, { reportProgress: true, observe: "events" });
        }
        return this.http.post(
          `${environment.base}/pl`,
          {
            startDate: body.selectedData.value.field1,
            endDate: body.selectedData.value.field2,
            receiver: body.selectedData.value.field3
          },
          { reportProgress: true, observe: "events" });
    }

    if (body.reportId === 2) {
      if (isFeaturePresent('reportEmail')) {
        return this.http.get(
          `${environment.base}/vl/${body.selectedData.value.field1}/${body.selectedData.value.field2}`, { reportProgress: true, observe: "events" });
        }
        return this.http.post(
          `${environment.base}/vl`,
          {
            startDate: body.selectedData.value.field1,
            endDate: body.selectedData.value.field2,
            receiver: body.selectedData.value.field3
          },
          { reportProgress: true, observe: "events" });
    }
  }

  geWebrtcStatus() {
     return this.http.get(`${environment.mindmapURL}/mindmap/getWebrtcStatuses`);
  }
}
