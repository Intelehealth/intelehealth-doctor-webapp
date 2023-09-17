import { Injectable } from "@angular/core";
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Observable, Subject } from "rxjs";
import { environment } from "../../environments/environment";
import { HelperService } from "./helper.service";

@Injectable({
  providedIn: "root",
})
export class VisitService {
  private baseURL = environment.baseURL;
  private baseURLMindmap = environment.mindmapURL;
  private recordsPerPage = environment.recordsPerPage;

  public isVisitSummaryShow: boolean = false;

  public isHelpButtonShow: boolean = false;

  public triggerAction: any = new Subject();

  public chatVisitId: any;

  constructor(private http: HttpClient, private helper: HelperService) {}

  getVisits(params): Observable<any> {
    const query = {
      ...{
        includeInactive: false,
        v: "custom:(uuid,startDatetime,stopDatetime,patient:(uuid,identifiers:(identifier),person:(display,gender,age,birthdate),attributes),location:(display),encounters:(display,obs:(display,uuid,value,comment,concept:(uuid,display)),encounterDatetime,voided,encounterType:(display),encounterProviders:(display,provider:(uuid,attributes,name))),attributes)",
      },
      ...params,
    };
    const url = `${this.baseURL}/visit${this.helper.toParamString(query)}`;
    return this.http.get(url);
  }

  getVisit(uuid): Observable<any> {
    // tslint:disable-next-line:max-line-length
    const url = `${this.baseURL}/visit/${uuid}?includeInactive=false&v=custom:(uuid,patient:(uuid,identifiers:(identifier),person:(display,gender,age,birthdate)),location:(display),encounters:(display,encounterDatetime,voided,encounterType:(display),encounterProviders),attributes)`;
    return this.http.get(url);
  }

  clearVisits() {
    // this.flagVisit = new Array();
    // this.waitingVisit = new Array();
    // this.progressVisit = new Array();
    // this.completedVisit = new Array();
  }

  recentVisits(id): Observable<any> {
    const url = `${this.baseURL}/visit?patient=${id}&v=full`;
    return this.http.get(url);
  }

  fetchVisitDetails(
    uuid,
    v = "custom:(location:(display),uuid,display,startDatetime,stopDatetime,encounters:(display,uuid,encounterDatetime,encounterType:(display),obs:(display,uuid,value,comment,concept:(uuid,display)),encounterProviders:(display,provider:(uuid,attributes,person:(uuid,display,gender,age)))),patient:(uuid,identifiers:(identifier),attributes,person:(display,gender,age,birthdate)),attributes)"
  ): Observable<any> {
    // tslint:disable-next-line:max-line-length
    const url = `${this.baseURL}/visit/${uuid}?v=${v}`;
    return this.http.get(url);
  }

  fetchVisitDetails2(
    uuid,
    v = "custom:(location:(display),uuid,display,startDatetime,stopDatetime,encounters:(display,uuid,encounterDatetime,encounterType:(display),obs:(display,uuid,value,comment,concept:(uuid,display)),encounterProviders:(display,provider:(uuid,attributes,person:(uuid,display,gender,age)))),patient:(uuid,identifiers:(identifier),attributes,person:(display,gender,age,birthdate)),attributes)"
  ): Observable<any> {
    // tslint:disable-next-line:max-line-length
    let headers: HttpHeaders = new HttpHeaders();
    headers = headers.append('Authorization', 'Basic ' + environment.externalPrescriptionCred);
    const url = `${this.baseURL}/visit/${uuid}?v=${v}`;
    return this.http.get(url, { headers });
  }

  fetchVisitPatient(uuid,v = "custom:(uuid,patient:(attributes,identifiers:(identifier)))"): Observable<any> {
    let headers: HttpHeaders = new HttpHeaders();
    headers = headers.append('Authorization', 'Basic ' + environment.externalPrescriptionCred);
    const url = `${this.baseURL}/visit/${uuid}?v=${v}`;
    return this.http.get(url, { headers });
  }

  getVisitDetails(
    uuid,
    v = "custom:(location:(display),uuid,display,startDatetime,stopDatetime,encounters:(display,uuid,encounterDatetime,encounterType:(display),obs:(display,uuid,value),encounterProviders:(display,provider:(uuid,person:(uuid,display,gender,age),attributes))),patient:(uuid,identifiers:(identifier),person:(display,gender,age)))"
  ): Observable<any> {
    // tslint:disable-next-line:max-line-length
    const url = `${this.baseURL}/visit/${uuid}?v=${v}`;
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

  updateAttribute(visitId, attributeUuid, json) {
    const url = `${this.baseURL}/visit/${visitId}/attribute/${attributeUuid}`;
    return this.http.post(url, json);
  }

  deleteAttribute(visitId, uuid) {
    const url = `${this.baseURL}/visit/${visitId}/attribute/${uuid}`;
    return this.http.delete(url);
  }

  patientInfo(id, v = 'custom:(identifiers,person:(uuid,display,gender,birthdate,age,preferredAddress:(cityVillage),attributes:(value,attributeType:(display))))'): Observable<any> {
    // tslint:disable-next-line: max-line-length
    const url = `${this.baseURL}/patient/${id}?v=${v}`;
    return this.http.get(url);
  }

  getVisitCounts(speciality) {
    return this.http.get(
      `${environment.mindmapURL}/openmrs/getVisitCounts?speciality=${speciality}`
    );
  }

  getWhatsappLink(whatsapp: any, msg: string) {
    let text = encodeURI(msg);
    let whatsappLink = `https://wa.me/${whatsapp}?text=${text}`;
    return whatsappLink;
  }

  getPriorityVisits(page: number = 1): Observable<any> {
    return this.http.get(`${this.baseURLMindmap}/openmrs/getPriorityVisits?limit=${this.recordsPerPage}&page=${page}`);
  }

  getInProgressVisits(page: number = 1): Observable<any> {
    return this.http.get(`${this.baseURLMindmap}/openmrs/getInProgressVisits?limit=${this.recordsPerPage}&page=${page}`);
  }

  getCompletedVisits(page: number = 1): Observable<any> {
    return this.http.get(`${this.baseURLMindmap}/openmrs/getCompletedVisits?limit=${this.recordsPerPage}&page=${page}`);
  }
}
