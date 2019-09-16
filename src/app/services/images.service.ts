import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';


@Injectable({
  providedIn: 'root'
})
export class ImagesService {
  private baseURL = environment.baseURL;

  constructor(private http: HttpClient) { }

  fetchProfileImage(uuid): Observable<any> {
    const url = `http://${this.baseURL}/openmrs/ws/rest/v1/personimage/${uuid}`;
    return this.http.get(url, { responseType: 'blob' });
  }
}
