import { Injectable } from "@angular/core";
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Observable } from "rxjs";
import { environment } from "../../environments/environment";

@Injectable({
  providedIn: "root",
})
export class VisitService {
  private baseURL = environment.baseURL;

  constructor(private http: HttpClient) {}

  getVisits(): Observable<any> {
    // tslint:disable-next-line:max-line-length
    const url = `${this.baseURL}/visit?includeInactive=true&v=custom:(uuid,patient:(uuid,identifiers:(identifier),person:(display,gender,age,birthdate),attributes),location:(display),encounters:(display,encounterDatetime,voided,encounterType:(display),encounterProviders),stopDatetime,attributes)`;
    return this.http.get(url);
  }

  getVisit(uuid): Observable<any> {
    // tslint:disable-next-line:max-line-length
    const url = `${this.baseURL}/visit/${uuid}?includeInactive=false&v=custom:(uuid,patient:(uuid,identifiers:(identifier),person:(display,gender,age,birthdate)),location:(display),encounters:(display,encounterDatetime,voided,encounterType:(display),encounterProviders),attributes)`;
    return this.http.get(url);
  }

  recentVisits(id): Observable<any> {
    const url = `${this.baseURL}/visit?patient=${id}&v=custom:(uuid,display,patient:(uuid))`;
    return this.http.get(url);
  }

  // updateVisit(id): Observable<any> {
  //   const url = `${this.baseURL}/visit?patient=${id}&v=custom:(uuid,display,patient:(uuid))`;
  //   return this.http.post(url);
  // }

  fetchVisitDetails(uuid): Observable<any> {
    // tslint:disable-next-line:max-line-length
    const url = `${this.baseURL}/visit/${uuid}?v=custom:(uuid,display,startDatetime,stopDatetime,encounters:(display,uuid,obs:(display,uuid,value),encounterProviders:(display,provider:(uuid,attributes))),patient:(uuid,identifiers:(identifier),person:(display)),attributes)`;
    return this.http.get(url);
  }

  getAttribute(visitId): Observable<any> {
    const url = `${this.baseURL}/visit/${visitId}/attribute`;
    return this.http.get(url);
  }

  postAttribute(visitId, json): Observable<any> {
    const url = `${this.baseURL}/visit/${visitId}/attribute`;
    return this.http.post(url, json);
  }

  deleteAttribute(visitId, uuid) {
    const url = `${this.baseURL}/visit/${visitId}/attribute/${uuid}`;
    return this.http.delete(url);
  }

  patientInfo(id): Observable<any> {
    var header = {
      headers: new HttpHeaders({
        'Content-Type':  'application/json',
        'Authorization': 'Basic ' + btoa('intelehealthUser:IHUser#1')
      })
    }
    // tslint:disable-next-line: max-line-length
    const url = `${this.baseURL}/patient/${id}?v=custom:(identifiers,person:(display,gender,birthdate,age,preferredAddress:(stateProvince,cityVillage),attributes:(value,attributeType:(display))))`;
    return this.http.get(url);
  }

  sendSMS(patientNo, smsBody): Observable<any> {
    let url = `${environment.mindmapURL}/mindmap/sendSMS`;
    let body = {
      patientNo: patientNo,
      smsBody: smsBody
    }
    return this.http.post(url, body);
  }

  shortUrl(link) {
    return this.http.post(`${environment.mindmapURL}/mindmap/shortLink`, {
      link,
    });
  }

  startCall(patientMobileNo, doctorsMobileNo) {
    let url = `${environment.mindmapURL}/mindmap/startCall`;
    let body = {
      patientMobileNo: patientMobileNo,
      doctorsMobileNo: doctorsMobileNo,
    };
    return this.http.post(url, body);
  }

  getVisitData(payload) {
    return this.http.post(
      `${this.baseURL.replace(
        "/openmrs/ws/rest/v1",
        ""
      )}/prescription/prescription/visitData`,
      payload
    );
  }

}
