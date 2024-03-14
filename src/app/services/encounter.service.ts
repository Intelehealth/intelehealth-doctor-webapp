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

  /**
  * Post encounter
  * @param {any} json - Payload for post encounter
  * @return {Observable<any>}
  */
  postEncounter(json): Observable<any> {
    const url = `${this.baseURL}/encounter`;
    return this.http.post(url, json);
  }

  /**
  * Post observation
  * @param {any} json - Payload for post observattion
  * @return {Observable<any>}
  */
  postObs(json): Observable<any> {
    const url = `${this.baseURL}/obs`;
    return this.http.post(url, json);
  }
}
