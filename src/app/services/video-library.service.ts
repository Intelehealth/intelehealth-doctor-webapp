import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { id } from "date-fns/locale";
import { Observable } from "rxjs";
import { environment } from "src/environments/environment";

@Injectable({
  providedIn: "root",
})
export class videoLibrary {
  private baseURL = environment.mindmapURL;

  constructor(private http: HttpClient) {}

  getAllProjects(): Observable<any> {
    const url = `${this.baseURL}/video-library/getAllProjects`;
    return this.http.get(url);
  }

  deleteProject(id: any): Observable<any> {
    const url = `${this.baseURL}/video-library/deleteProject/${id}`;
    return this.http.delete(url);
  }

  creatProject(payload): Observable<any> {
    const url = `${this.baseURL}/video-library/createProject`;
    return this.http.post(url, payload);
  }

  updateProject(payload, id): Observable<any> {
    const url = `${this.baseURL}/video-library/updateProject/${id}`;
    return this.http.patch(url, payload);
  }

  getvideosByProjectId(id): Observable<any> {
    const url = `${this.baseURL}/video-library/getVideosByPackageId/${id}`;
    return this.http.get(url);
  }

  deleteVideo(id: any): Observable<any> {
    const url = `${this.baseURL}/video-library/deleteVideo/${id}`;
    return this.http.delete(url);
  }

  creatVideo(payload): Observable<any> {
    const url = `${this.baseURL}/video-library/createVideo`;
    return this.http.post(url, payload);
  }

  updateVideo(payload, id): Observable<any> {
    const url = `${this.baseURL}/video-library/updateVideo/${id}`;
    return this.http.patch(url, payload);
  }
}
