import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import { environment } from "../../environments/environment";
import { HelperService } from "./helper.service";
import { VisitData } from "../component/homepage/homepage.component";


@Injectable({
  providedIn: "root",
})
export class VisitService {
  private baseURL = environment.baseURL;
  public flagVisit: VisitData[] = [];
  public waitingVisit: VisitData[] = [];
  public progressVisit: VisitData[] = [];
  public completedVisit: VisitData[] = [];

  constructor(private http: HttpClient, private helper: HelperService) { }
  checkVisit(encounters, visitType) {
    return encounters.find(({ display = "" }) => display.includes(visitType));
  }

  getVisits(params): Observable<any> {
    const query = {
      ...{
        includeInactive: false,
        v: "custom:(uuid,patient:(uuid,identifiers:(identifier),person:(display,gender,age,birthdate)),location:(display),encounters:(display,obs:(display,uuid,value),encounterDatetime,voided,encounterType:(display),encounterProviders),attributes)",
      },
      ...params,
    };
    const url = `${this.baseURL}/visit${this.helper.toParamString(query)}`;
    return this.http.get(url);
  }

  getVisitForSms(): Observable<any> {
    // tslint:disable-next-line:max-line-length
    const url = `${this.baseURL}/visit?includeInactive=false&v=custom:(uuid,patient:(uuid,identifiers:(identifier),person:(display,gender,age,birthdate)),location:(display),encounters:(display,obs:(display,uuid,value),encounterDatetime,voided,encounterType:(display),encounterProviders),attributes)`;
    return this.http.get(url);
  }

  getEndedVisits(): Observable<any> {
    // tslint:disable-next-line:max-line-length
    const url = `${this.baseURL}/visit?includeInactive=true&v=custom:(uuid,patient:(uuid,identifiers:(identifier),person:(display,gender,age,birthdate)),location:(display),encounters:(display,obs:(display,uuid,value),encounterDatetime,voided,encounterType:(display),encounterProviders),stopDatetime,attributes)`;
    return this.http.get(url);
  }

  getVisit(uuid): Observable<any> {
    // tslint:disable-next-line:max-line-length
    const url = `${this.baseURL}/visit/${uuid}?includeInactive=false&v=custom:(uuid,patient:(uuid,attributes,identifiers:(identifier),person:(display,gender,age,birthdate,attributes)),location:(display),encounters:(display,obs:(display,uuid,value),encounterDatetime,voided,encounterType:(display),encounterProviders),attributes)`;
    return this.http.get(url);
  }

  recentVisits(id): Observable<any> {
    const url = `${this.baseURL}/visit?patient=${id}&v=custom:(uuid,display,patient:(uuid))`;
    return this.http.get(url);
  }

  fetchVisitDetails(uuid): Observable<any> {
    // tslint:disable-next-line:max-line-length
    const url = `${this.baseURL}/visit/${uuid}?v=custom:(uuid,display,startDatetime,stopDatetime,attributes,encounters:(display,encounterDatetime,uuid,obs:(display,uuid,value),encounterProviders:(display,provider:(uuid,attributes))),patient:(uuid,identifiers:(identifier),person:(display)))`;
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
    // tslint:disable-next-line: max-line-length
    const url = `${this.baseURL}/patient/${id}?v=custom:(identifiers,person:(display,gender,birthdate,age,preferredAddress:(cityVillage,stateProvince),attributes:(value,attributeType:(display))))`;
    return this.http.get(url);
  }

  getLocations() {
    return this.http.get(`${environment.mindmapURL}/openmrs/getLocations`);
  }

  getBaselineSurveyPatients(location_id) {
    return this.http.get(`${environment.mindmapURL}/openmrs/getBaselineSurveyPatients/${location_id}`);
  }

  getVisitCounts(speciality) {
    return this.http.get(
      `${environment.mindmapURL}/openmrs/getVisitCounts?speciality=${speciality}`
    );
  }

  getDoctorsVisit() {
    return this.http.get(
      `${environment.mindmapURL}/openmrs/getDoctorVisits`
    );
  }

  getAwaitingVisits(visitState, speciality, page = 1) {
    return this.http.get(
      `${environment.mindmapURL}/openmrs/getAwaitingVisits?state=${visitState}&speciality=${speciality}&page=${page}`
    );
  }

  getPriorityVisits(visitState, speciality, page = 1) {
    return this.http.get(
      `${environment.mindmapURL}/openmrs/getPriorityVisits?state=${visitState}&speciality=${speciality}&page=${page}`
    );
  }

  getInProgressVisits(visitState, speciality, page = 1) {
    return this.http.get(
      `${environment.mindmapURL}/openmrs/getInProgressVisits?state=${visitState}&speciality=${speciality}&page=${page}`
    );
  }

  getCompletedVisits(visitState, speciality, page = 1) {
    return this.http.get(
      `${environment.mindmapURL}/openmrs/getCompletedVisits?state=${visitState}&speciality=${speciality}&page=${page}`
    );
  }

  clearVisits() {
    this.flagVisit = new Array();
    this.waitingVisit = new Array();
    this.progressVisit = new Array();
    this.completedVisit = new Array();
  }

}
