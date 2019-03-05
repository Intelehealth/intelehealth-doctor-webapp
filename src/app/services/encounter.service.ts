import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class EncounterService {

  constructor(private http: HttpClient) { }

  recentVitals(id): Observable<any> {
    const url = 'http://demo.intelehealth.io/openmrs/ws/rest/v1/encounter?patient=' + id;
    return this.http.get(url);
  }

  vitals(uuid): Observable<any> {
    const url = 'http://demo.intelehealth.io/openmrs/ws/rest/v1/encounter/' + uuid;
    return this.http.get(url);
  }

  adultInitial(uuid): Observable<any> {
  let url =  'http://demo.intelehealth.io/openmrs/ws/rest/v1/encounter';
        url += '?patient=' + uuid;
        url += '&encounterType=' + '8d5b27bc-c2cc-11de-8d13-0010c6dffd0f';
        return this.http.get(url);
  }

  session(): Observable<any> {
    const url = 'http://demo.intelehealth.io/openmrs/ws/rest/v1/session';
    return this.http.get(url);
  }
}
