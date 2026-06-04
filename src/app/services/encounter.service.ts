import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
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
  postObs(json, ref:boolean=false): Observable<any> {
    const url = `${this.baseURL}/obs${ref ? '?v=ref':''}`;
    return this.http.post(url, json);
  }

  /**
  * Update observation
  * @param {string} obsUuid - Payload for post observattion
  * @param {any} json - Payload for post observattion
  * @return {Observable<any>}
  */
  updateObs(obsUuid,json): Observable<any> {
    const url = `${this.baseURL}/obs/${obsUuid}`;
    return this.http.post(url, json);
  }

  searchMedicine(limit: number = 20, query: string = ''): Observable<any> {
    const url = `${this.baseURL}/drug`;
    let params = new HttpParams()
      .set('limit', String(limit))
      .set('v', 'custom:(uuid,display,name,strength,dosageForm:(display,uuid),concept:(display,uuid))');

    if (query?.trim()) {
      params = params.set('q', query.trim());
    }

    return this.http.get(url, { params });
  }

  getDrugType(): Observable<any> {
    const url = `${this.baseURL}/orderentryconfig`;
    return this.http.get(url);
  }

  getTestList(): Observable<any> {
    const url = `${this.baseURL}/concept?q=test&v=custom:(uuid,display)`;
    return this.http.get(url);
  }
}
