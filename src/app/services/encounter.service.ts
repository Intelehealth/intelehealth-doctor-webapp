import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
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
  * Non-voided encounters of the given type already on the visit, freshly fetched
  * from OpenMRS (not from any locally cached visit state).
  * @param {string} visitUuid - Visit uuid
  * @param {string} encounterTypeUuid - Encounter type uuid
  * @return {Observable<any[]>}
  */
  getEncountersForVisit(visitUuid: string, encounterTypeUuid: string): Observable<any[]> {
    // tslint:disable-next-line:max-line-length
    const url = `${this.baseURL}/visit/${visitUuid}?v=custom:(encounters:(uuid,display,voided,encounterDatetime,encounterProviders,encounterType:(uuid,display)))`;
    return this.http.get(url).pipe(
      map((res: any) => (res?.encounters || []).filter((e: any) => !e?.voided && e?.encounterType?.uuid === encounterTypeUuid))
    );
  }

  /**
  * Re-checks OpenMRS for an existing (non-voided) encounter of this type on the visit
  * @param {any} json - { patient, encounterType, encounterProviders, visit, encounterDatetime }
  * @return {Observable<any>}
  */
  getOrCreateEncounter(json): Observable<any> {
    return this.getEncountersForVisit(json.visit, json.encounterType).pipe(
      switchMap((existing) => existing.length ? of(existing[0]) : this.postEncounter(json))
    );
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
}
