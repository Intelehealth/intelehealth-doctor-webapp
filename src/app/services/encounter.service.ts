import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class EncounterService {
  private baseURL = environment.baseURL;

  constructor(private http: HttpClient) { }

  recentVitals(id): Observable<any> {
    const url = `${this.baseURL}/encounter?patient=${id}`;
    return this.http.get(url);
  }

  vitals(uuid): Observable<any> {
    const url = `${this.baseURL}/encounter/${uuid}?v=custom:(display,uuid,obs:(display,value))`;
    return this.http.get(url);
  }

  adultInitial(uuid): Observable<any> {
    const url = `${this.baseURL}/encounter?patient=${uuid}&encounterType=8d5b27bc-c2cc-11de-8d13-0010c6dffd0f`;
    return this.http.get(url);
  }

  visitNote(uuid): Observable<any> {
    const url = `${this.baseURL}/encounter?patient=${uuid}&encounterType=d7151f82-c1f3-4152-a605-2f9ea7414a79`;
    return this.http.get(url);
  }

  visitComplete(uuid): Observable<any> {
    const url = `${this.baseURL}/encounter?patient=${uuid}&encounterType=bd1fbfaa-f5fb-4ebd-b75c-564506fc309e`;
    return this.http.get(url);
  }

  postEncounter(json): Observable<any> {
    const url = `${this.baseURL}/encounter`;
    return this.http.post(url, json);
  }

  postObs(json): Observable<any> {
    const url = `${this.baseURL}/obs`;
    return this.http.post(url, json);
  }

  signRequest(uuid): Observable<any> {
    const url = `${this.baseURL}/provider/${uuid}/attribute`;
    return this.http.get(url);
  }
}
