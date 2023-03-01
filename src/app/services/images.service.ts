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
    const url = `${this.baseURL}/personimage/${uuid}`;
    return this.http.get(url, { responseType: 'blob' });
  }

  getAdditionalImage(uuid) : Observable<any> {
    const url = `${environment.base}/personimages/${uuid}`;
    return this.http.get(url);
  }
}
