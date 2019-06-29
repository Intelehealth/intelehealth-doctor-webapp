import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class EncounterService {
  // private baseURL = window.location.host;
  private baseURL = 'demo.intelehealth.io';
  constructor(private http: HttpClient) { }

  recentVitals(id): Observable<any> {
    const url = `http://${this.baseURL}/openmrs/ws/rest/v1/encounter?patient=${id}`;
    return this.http.get(url);
  }

  vitals(uuid): Observable<any> {
    const url = `http://${this.baseURL}/openmrs/ws/rest/v1/encounter/${uuid}`;
    return this.http.get(url);
  }

  adultInitial(uuid): Observable<any> {
    const url = `http://${this.baseURL}/openmrs/ws/rest/v1/encounter?patient=${uuid}&encounterType=8d5b27bc-c2cc-11de-8d13-0010c6dffd0f`;
    return this.http.get(url);
  }

  visitNote(uuid): Observable<any> {
    const url = `http://${this.baseURL}/openmrs/ws/rest/v1/encounter?patient=${uuid}&encounterType=d7151f82-c1f3-4152-a605-2f9ea7414a79`;
    return this.http.get(url);
  }

  visitComplete(uuid): Observable<any> {
    const url = `http://${this.baseURL}/openmrs/ws/rest/v1/encounter?patient=${uuid}&encounterType=bd1fbfaa-f5fb-4ebd-b75c-564506fc309e`;
    return this.http.get(url);
  }

  session(): Observable<any> {
    const url = `http://${this.baseURL}/openmrs/ws/rest/v1/session`;
    return this.http.get(url);
  }

  deleteSession(id): Observable<any> {
    let headers = new HttpHeaders();
    headers = headers.set('cookie', `JSESSIONID=${id}`);
    const url = `http://${this.baseURL}/openmrs/ws/rest/v1/session`;
    return this.http.delete(url);
  }

  loginSession(base64): Observable<any> {
    let headers: HttpHeaders = new HttpHeaders();
    headers = headers.append('Authorization', 'Basic ' + base64);
    const url = `http://${this.baseURL}/openmrs/ws/rest/v1/session`;
    return this.http.get(url, { headers });
  }

  provider(userId): Observable<any> {
    const url = `http://${this.baseURL}/openmrs/ws/rest/v1/provider?user=${userId}&v=custom:(uuid,person:(uuid,display,gender),attributes)`;
    return this.http.get(url);
  }

  postEncounter(json): Observable<any> {
    const url = `http://${this.baseURL}/openmrs/ws/rest/v1/encounter`;
    return this.http.post(url, json);
  }

  postObs(json): Observable<any> {
    const url = `http://${this.baseURL}/openmrs/ws/rest/v1/obs`;
    return this.http.post(url, json);
  }

  signRequest(uuid): Observable<any> {
    const url = `http://${this.baseURL}/openmrs/ws/rest/v1/provider/${uuid}/attribute`;
    return this.http.get(url);
  }
}
