import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ImagesService {

  constructor(private http: HttpClient) { }

  private base_url = '13.233.154.20';

  fetchAdditionalDocumentImage(patientUuid, visitUuid): Observable<any> {
    // tslint:disable-next-line:max-line-length
    const url = 'http://' + this.base_url + ':1337/parse/classes/AdditionalDocuments?where={\"PatientID\":\"' + patientUuid + '\",\"VisitID\":\"' + visitUuid + '\"}';
    const headers = new HttpHeaders({
      'X-Parse-Application-Id': 'app2',
      'X-Parse-REST-API-Key': 'undefined'
      });
  return this.http.get(url, {headers: headers});
  }

  fetchphysicalExamImage(patientUuid, visitUuid): Observable<any> {
    // tslint:disable-next-line:max-line-length
    const url = 'http://' + this.base_url + ':1337/parse/classes/PhysicalExam?where={\"PatientID\":\"' + patientUuid + '\",\"VisitID\":\"' + visitUuid + '\"}';
    const headers = new HttpHeaders({
      'X-Parse-Application-Id': 'app2',
      'X-Parse-REST-API-Key': 'undefined'
      });
  return this.http.get(url, {headers: headers});
  }

  fetchProfileImage(uuid): Observable<any> {
    const url = 'http://' + this.base_url + ':1337/parse/classes/Profile?where={\"PatientID\":\"' + uuid + '\"}';
    const headers = new HttpHeaders({
      'X-Parse-Application-Id': 'app2',
      'X-Parse-REST-API-Key': 'undefined'
      });
  return this.http.get(url, {headers: headers});
  }
}
