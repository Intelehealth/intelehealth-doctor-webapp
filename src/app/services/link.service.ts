import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { environment } from "src/environments/environment";

@Injectable({
  providedIn: "root",
})
export class LinkService {
  private baseURL = environment.mindmapURL;
  constructor(private http: HttpClient) {}

  getLink(hash) {
    return this.http.get(`${this.baseURL}/mindmap/getLink?hash=${hash}`);
  }
}
