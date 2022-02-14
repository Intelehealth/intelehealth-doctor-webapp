import { Observable } from "rxjs";
import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { environment } from "../../environments/environment";

@Injectable({
  providedIn: "root",
})
export class MindmapService {
  private baseURL = environment.mindmapURL;

  constructor(private http: HttpClient) {}

  getMindmapKey(): Observable<any> {
    const url = `${this.baseURL}/mindmap`;
    return this.http.get(url);
  }

  postMindmap(value): Observable<any> {
    const url = `${this.baseURL}/mindmap/upload`;
    return this.http.post(url, value);
  }

  detailsMindmap(key): Observable<any> {
    const url = `${this.baseURL}/mindmap/details/${key}`;
    return this.http.get(url);
  }

  addUpdateLicenseKey(payload): Observable<any> {
    const url = `${this.baseURL}/mindmap/addUpdatekey`;
    return this.http.post(url, payload);
  }

  updateImage(key, imageName, value): Observable<any> {
    const url = `${this.baseURL}/mindmap/${key}/${imageName}`;
    return this.http.put(url, value);
  }

  deleteMindmap(key, data): Observable<any> {
    const url = `${this.baseURL}/mindmap/delete/${key}`;
    return this.http.post(url, data);
  }
}
