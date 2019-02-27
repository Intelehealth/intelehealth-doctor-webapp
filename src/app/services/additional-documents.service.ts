import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient, HttpHeaders } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class AdditionalDocumentsService {

  constructor(private http: HttpClient) { }

  fetchAdditionalDocumentImage(patientUuid, visitUuid): Observable<any> {
    // tslint:disable-next-line:max-line-length
    const url = 'http://13.232.112.226:1337/parse/classes/AdditionalDocuments?where={\"PatientID\":\"' + patientUuid + '\",\"VisitID\":\"' + visitUuid + '\"}';
    const headers = new HttpHeaders({
      'X-Parse-Application-Id': 'app2',
      'X-Parse-REST-API-Key': 'undefined'
      });
  return this.http.get(url, {headers: headers});
  }
}
