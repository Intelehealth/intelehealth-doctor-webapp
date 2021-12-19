import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { map } from 'rxjs/operators';

interface ReferralHomepage {
  awaitingCall: Array<{}>;
  awaitingHospital: Array<{}>;
}
@Injectable({
  providedIn: 'root'
})

export class VisitService {
  private baseURL = environment.baseURL;
  referralVisit: ReferralHomepage = { awaitingCall : [], awaitingHospital: []};

  constructor(private http: HttpClient) { }

  getVisits(): Observable<any> {
    // tslint:disable-next-line:max-line-length
    const url = `${this.baseURL}/visit?includeInactive=false&v=custom:(uuid,patient:(uuid,identifiers:(identifier),person:(display,gender,age,birthdate)),location:(display),encounters:(display,encounterDatetime,voided,encounterType:(display),encounterProviders),attributes)`;
    return this.http.get(url);
  }

  getReferralVisits(): Observable<any> {
    const url = `${this.baseURL}/visit?includeInactive=false&v=custom:(uuid,patient:(uuid,identifiers:(identifier),person:(display,gender)),encounters:(display,encounterType:(display),obs:(uuid,display,obsDatetime,voided,value))`;
    return this.http.get(url).pipe(
      map((visits: any) => {
        visits.results.forEach(visit => {
          if (visit.encounters.length > 1) {
            const visitNote = visit.encounters.filter(enc => enc.display.match('Visit Note'));
            if (visitNote.length) {
              visitNote.forEach((encounter, index) => {
                const referral = encounter.obs.filter(ob => ob.display.match('Referral'));
                if (referral.length) {
                  const data = visit;
                  data.referralDate = referral[0].obsDatetime;
                  const coOrdinatorStatus = visitNote[index].obs.filter(ob => ob.display.match('co-ordinator status'));
                  if (visitNote[index].obs.some(ob => ob.display.match('Urgent Referral'))) {
                    data.urgent = true;
                  }
                  if (coOrdinatorStatus.length) {
                    data.status = coOrdinatorStatus[0].value;
                    data.referralDate = coOrdinatorStatus[0].obsDatetime;
                    this.referralVisit.awaitingHospital.push(data);
                  } else {
                    this.referralVisit.awaitingCall.push(visit);
                  }
                }
              });
            }
          }
        });
        return this.referralVisit;
      })
    );
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
    const url = `${this.baseURL}/patient/${id}?v=custom:(identifiers,person:(display,gender,birthdate,preferredAddress:(cityVillage),attributes:(value,attributeType:(display))))`;
    return this.http.get(url);
  }
}
