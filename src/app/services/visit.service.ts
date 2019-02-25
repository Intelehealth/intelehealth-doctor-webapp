import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class VisitService {
  visits: any;
  visit: any = [];
  visitAll: any = [];
  resul: any = [];

  constructor(private http: HttpClient) { }

getVisits(): Observable<any> {
    const base_url = window.location.origin;
    const url = 'http://demo.intelehealth.io/openmrs/ws/rest/v1/visit?includeInactive=false';
    this.http.get(url)
    .subscribe(response => {
      this.visits = response;
      const result = this.visits.results;
      result.forEach(element => {
        const uuid = element.uuid;
        // tslint:disable-next-line:max-line-length
        const url1 = 'http://demo.intelehealth.io/openmrs/ws/rest/v1/visit/' + uuid + '?v=custom:(location:(display),encounters,patient:(uuid,identifiers:(identifier),person:(display,gender,age)))';
        this.http.get(url1)
        .subscribe(response1 => {
          this.visit = response1;
          this.visit.uuid = this.visit.patient.uuid;
          this.visit.identifier = this.visit.patient.identifiers[0].identifier;
          if (this.visit.patient.person.display) {
          this.visit.name = this.visit.patient.person.display;
        }
          this.visit.gender = this.visit.patient.person.gender;
          this.visit.age = this.visit.patient.person.age;
          if (this.visit.location.display) {
          this.visit.location = this.visit.location.display;
        }
          if (this.visit.encounters[0].display) {
          this.visit.lastSeen = this.visit.encounters[0].display;
        }
          this.visitAll.push(this.visit);
      });
    });
   });
   return this.visitAll;
}

recentVisits(id): Observable<any> {
    const url = 'http://demo.intelehealth.io/openmrs/ws/rest/v1/visit?patient=' + id + '&v=custom:(uuid,display,patient:(uuid))';
    return this.http.get(url);
}

fetchVisitDetails(uuid): Observable<any> {
    // tslint:disable-next-line:max-line-length
    const url = 'http://demo.intelehealth.io/openmrs/ws/rest/v1/visit/' + uuid + '?v=custom:(uuid,display,startDatetime,stopDatetime,encounters:(display,uuid,obs:(display,uuid,value)),patient:(uuid))';
    return this.http.get(url);
}
}
