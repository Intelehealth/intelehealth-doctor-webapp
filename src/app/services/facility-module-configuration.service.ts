import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { switchMap } from 'rxjs/operators';
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
    return this.http.get<any>(`${this.baseURL}/locationtag?q=Facility`).pipe(
      switchMap(response => {
        const facilityTag = response?.results?.find((tag: any) => tag?.display === 'Facility') || response?.results?.[0];

        if (!facilityTag?.uuid) {
          return of({ results: [] });
        }

        return this.http.get(`${this.baseURL}/location?tag=${facilityTag.uuid}&v=full`);
      })
    );
  }
}
