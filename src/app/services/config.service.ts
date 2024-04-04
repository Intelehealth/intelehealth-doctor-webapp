import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from "../../environments/environment";

@Injectable({
  providedIn: 'root'
})
export class ConfigService {
  private baseURL = environment.mindmapURL;

  constructor(private http: HttpClient) { }
  /**
  * Get doctor specialties
  * @return {Observable<any>}
  */
  getDoctorSpecialities(): Observable<any> {
    const url = `${this.baseURL}/mindmap`;
    return this.http.get(url);
  }

  /**
  * Get mobile app languages
  * @return {Observable<any>}
  */
  getMobileAppLanguages(): Observable<any> {
    const url = `${this.baseURL}/mindmap`;
    return this.http.get(url);
  }
}
