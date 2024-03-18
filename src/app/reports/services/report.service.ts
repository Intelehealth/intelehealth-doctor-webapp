import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { environment } from "src/environments/environment";

@Injectable({
  providedIn: "root",
})
export class ReoportService {
  private baseURL = environment.baseURL;

  constructor(private http: HttpClient) { }

  getCompletedVisits() {
    return this.http.get(
      `${environment.mindmapURL}/openmrs/getCompletedVisits?ngsw-bypass=true&state=All&speciality=General Physician&page=1`, { reportProgress: true, observe: "events" });
  }
}
