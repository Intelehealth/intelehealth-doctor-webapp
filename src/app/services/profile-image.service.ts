import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ProfileImageService {

  constructor(private http: HttpClient) { }

  fetchProfileImage(uuid): Observable<any> {
    const url = 'http://13.232.112.226:1337/parse/classes/Profile?where={\'PatientID\':\'' + uuid + '\'}';
    console.log(url);
    const headers = new HttpHeaders({
      'X-Parse-Application-Id': 'app2',
      'X-Parse-REST-API-Key': 'undefined'
      });
  return this.http.get(url, {headers: headers});
  }
}
