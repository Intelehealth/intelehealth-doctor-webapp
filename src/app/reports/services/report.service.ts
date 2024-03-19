import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { environment } from "src/environments/environment";

@Injectable({
  providedIn: "root",
})
export class ReoportService {

  constructor(private http: HttpClient) { }

  getReport(body) {
    return this.http.get(
      `${environment.reportURL}/${body.value.field1}/${body.value.field2}`,{ reportProgress: true, observe: "events" });
  }
}
