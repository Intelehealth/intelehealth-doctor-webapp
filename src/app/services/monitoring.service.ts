import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { environment } from "src/environments/environment";
import { HelperService } from "./helper.service";
declare const window: any, document: any;

@Injectable({
  providedIn: "root",
})
export class MonitoringService {
  private url = environment.mindmapURL;

  constructor(private http: HttpClient, private helper: HelperService) {}

  createUpdateStatus(payload: any) {
    const _payload = {
      lastLogin: new Date(),
      device: this.getBrowser(),
      version: "2.0",
      userType: "Doctor",
      ...payload,
    };
    const query = this.helper.toParamString(_payload);
    localStorage.socketQuery = query;
    return this.http.post(`${this.url}/user/createUpdateStatus`, _payload);
  }

  getUserStatuses(userUuid) {
    return this.http.get(`${this.url}/user/getStatuses/${userUuid}`);
  }

  getAllStatuses() {
    return this.http.get(`${this.url}/user/getAllStatuses`);
  }

  public getBrowser() {
    const { userAgent } = navigator;
    let match =
      userAgent.match(
        /(opera|chrome|safari|firefox|msie|trident(?=\/))\/?\s*(\d+)/i
      ) || [];
    let temp;

    if (/trident/i.test(match[1])) {
      temp = /\brv[ :]+(\d+)/g.exec(userAgent) || [];

      return `IE ${temp[1] || ""}`;
    }

    if (match[1] === "Chrome") {
      temp = userAgent.match(/\b(OPR|Edge)\/(\d+)/);

      if (temp !== null) {
        return temp.slice(1).join(" ").replace("OPR", "Opera");
      }

      temp = userAgent.match(/\b(Edg)\/(\d+)/);

      if (temp !== null) {
        return temp.slice(1).join(" ").replace("Edg", "Edge (Chromium)");
      }
    }

    match = match[2]
      ? [match[1], match[2]]
      : [navigator.appName, navigator.appVersion, "-?"];
    temp = userAgent.match(/version\/(\d+)/i);

    if (temp !== null) {
      match.splice(1, 1, temp[1]);
    }

    return match.join(" ");
  }
}
