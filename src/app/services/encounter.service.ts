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

  addEncounter(json): Observable<any> {
    return this.postEncounter(json);
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

  deleteOrder(orderUuid: string): Observable<any> {
    const url = `${this.baseURL}/order/${orderUuid}`;
    return this.http.delete(url);
  }

  getDrugOrder(orderUuid: string): Observable<any> {
    const url = `${this.baseURL}/order/${orderUuid}`;
    const params = new HttpParams()
      .set('v', 'custom:(uuid,display,orderType:(uuid,display,name),action,voided,dateStopped,instructions,dosingInstructions,doseUnits:(uuid,display),quantityUnits:(uuid,display),duration,durationUnits:(uuid,display),frequency:(uuid,display),drug:(uuid,display,strength,dosageForm:(uuid,display),concept:(uuid,display)),concept:(uuid,display))');
    return this.http.get(url, { params });
  }

  searchMedicine(term?: string): Observable<any>;
  searchMedicine(limit?: number, query?: string): Observable<any>;
  searchMedicine(limitOrTerm: number | string = 20, query: string = ''): Observable<any> {
    const url = `${this.baseURL}/drug`;
    const limit = typeof limitOrTerm === 'number' ? limitOrTerm : 20;
    const term = typeof limitOrTerm === 'string' ? limitOrTerm : query;
    let params = new HttpParams()
      .set('limit', String(limit))
      .set('v', 'custom:(uuid,display,name,strength,dosageForm:(display,uuid),concept:(display,uuid))');

    if (term?.trim()) {
      params = params.set('q', term.trim());
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
