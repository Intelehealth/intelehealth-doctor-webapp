import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';


@Injectable({
  providedIn: 'root'
})


export class VisitService {
  private baseURL = environment.baseURL;

  constructor(private http: HttpClient) { }

  getVisits(): Observable<any> {
    // tslint:disable-next-line:max-line-length
    const url = `http://${this.baseURL}/openmrs/ws/rest/v1/visit?includeInactive=false&v=custom:(uuid,patient:(uuid,identifiers:(identifier),person:(display,gender,age,birthdate)),location:(display),encounters:(display,encounterDatetime,encounterType:(display)))`;
    return this.http.get(url);
  }

  recentVisits(id): Observable<any> {
    const url = `http://${this.baseURL}/openmrs/ws/rest/v1/visit?patient=${id}&v=custom:(uuid,display,patient:(uuid))`;
    return this.http.get(url);
  }

  fetchVisitDetails(uuid): Observable<any> {
    // tslint:disable-next-line:max-line-length
    const url = `http://${this.baseURL}/openmrs/ws/rest/v1/visit/${uuid}?v=custom:(uuid,display,startDatetime,stopDatetime,encounters:(display,uuid,obs:(display,uuid,value),encounterProviders:(display,provider:(attributes))),patient:(uuid,identifiers:(identifier),person:(display)))`;
    return this.http.get(url);
  }

  getAttribute(visitId): Observable<any> {
    const url = `http://${this.baseURL}/openmrs/ws/rest/v1/visit/${visitId}/attribute`;
    return this.http.get(url);
  }

  postAttriute(visitId, json): Observable<any> {
    const url = `http://${this.baseURL}/openmrs/ws/rest/v1/visit/${visitId}/attribute`;
    return this.http.post(url, json);
  }

  patientInfo(id): Observable<any> {
    // tslint:disable-next-line: max-line-length
    const url = `http://${this.baseURL}/openmrs/ws/rest/v1/patient/${id}?v=custom:(person:(display,gender,birthdate,preferredAddress:(cityVillage),attributes:(value,attributeType:(display))))`;
    return this.http.get(url);
  }
}
