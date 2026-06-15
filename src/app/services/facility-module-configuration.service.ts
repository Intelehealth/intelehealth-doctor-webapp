import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class FacilityModuleConfigurationService {
  private baseURL = environment.baseURL;

  constructor(private http: HttpClient) { }

  getFacilityConfigurationList(): Observable<any> {
    return this.http.get(`${this.baseURL}/config-facility/getAll`);
  }

  saveFacilityConfiguration(data: any): Observable<any> {
    return this.http.post(`${this.baseURL}/config-facility/save`, data);
  }

  getReferralFacilityLocation(): Observable<any> {
    return this.http.get(`${this.baseURL}/location`);
  }
}
