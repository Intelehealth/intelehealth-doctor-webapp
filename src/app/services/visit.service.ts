import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import { environment } from "../../environments/environment";
import { HelperService } from "./helper.service";
import { VisitData } from "../component/homepage/homepage.component";
import * as moment from "moment";

@Injectable({
  providedIn: "root",
})
export class VisitService {
  private baseURL = environment.baseURL;
  public flagVisit: VisitData[] = [];
  public waitingVisit: VisitData[] = [];
  public progressVisit: VisitData[] = [];
  public completedVisit: VisitData[] = [];

  constructor(private http: HttpClient, private helper: HelperService) {}

  getVisits(): Observable<any> {
    // tslint:disable-next-line:max-line-length
    const url = `${this.baseURL}/visit?includeInactive=false&v=custom:(uuid,patient:(uuid,identifiers:(identifier),person:(display,gender,age,birthdate)),location:(display),encounters:(display,encounterDatetime,voided,encounterType:(display),encounterProviders),stopDatetime,attributes)`;
    return this.http.get(url);
  }

  getVisit(uuid): Observable<any> {
    // tslint:disable-next-line:max-line-length
    const url = `${this.baseURL}/visit/${uuid}?includeInactive=false&v=custom:(uuid,patient:(uuid,identifiers:(identifier),person:(display,gender,age,birthdate,attributes:(value,attributeType:(display)))),location:(display),encounters:(uuid,display,obs:(display,uuid,value,comment),encounterDatetime,voided,encounterType:(display),encounterProviders:(display)),attributes)`;
    return this.http.get(url);
  }

  clearVisits() {
    this.flagVisit = new Array();
    this.waitingVisit = new Array();
    this.progressVisit = new Array();
    this.completedVisit = new Array();
  }

  recentVisits(id): Observable<any> {
    const url = `${this.baseURL}/visit?patient=${id}&v=custom:(uuid,display,patient:(uuid))`;
    return this.http.get(url);
  }

  fetchVisitDetails(uuid): Observable<any> {
    // tslint:disable-next-line:max-line-length
    const url = `${this.baseURL}/visit/${uuid}?v=custom:(uuid,display,startDatetime,stopDatetime,encounters:(display,uuid,obs:(display,uuid,value),encounterProviders:(display,provider:(uuid,attributes))),patient:(uuid,identifiers:(identifier),person:(display)))`;
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
    const url = `${this.baseURL}/patient/${id}?v=custom:(identifiers,person:(display,gender,birthdate,age,preferredAddress:(cityVillage),attributes:(value,attributeType:(display))))`;
    return this.http.get(url);
  }

  getVisitCounts(speciality) {
    return this.http.get(
      `${environment.mindmapURL}/openmrs/getVisitCounts?speciality=${speciality}`
    );
  }

  getAge(dateString) {
    //------sol 1 ---------------
    var mydate = dateString?.replace(
      /^(\d{2})\/(\d{2})\/(\d{4})$/,
      "$3, $2, $1"
    );
    var a = moment();
    var b = moment(mydate);
    var diffDuration = moment.duration(a.diff(b));
    var ageString =
      diffDuration.years() + " " 
      // this.translate.instant("years") +" - " +
      diffDuration.months() + " "
      // this.translate.instant("months") + " - " +
      diffDuration.days() + " "
      // this.translate.instant("days");
    return ageString;
 }
}
