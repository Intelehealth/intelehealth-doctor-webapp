import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ImagesService {
  private baseURL = window.location.host;
  // private baseURL = '13.233.50.223:8080';

  constructor(private http: HttpClient) { }

  fetchProfileImage(uuid): Observable<any> {
    const url = `http://${this.baseURL}/openmrs/ws/rest/v1/personimage/${uuid}`;
    return this.http.get(url, { responseType: 'blob' });
  }
}
