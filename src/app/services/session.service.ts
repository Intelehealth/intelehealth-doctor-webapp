import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class SessionService {
  private baseURL = environment.baseURL;

  constructor(private http: HttpClient) { }

  session(): Observable<any> {
    const url = `${this.baseURL}/session`;
    return this.http.get(url);
  }

  deleteSession(id): Observable<any> {
    let headers = new HttpHeaders();
    headers = headers.set('cookie', `JSESSIONID=${id}`);
    const url = `${this.baseURL}/session`;
    return this.http.delete(url);
  }

  loginSession(base64): Observable<any> {
    let headers: HttpHeaders = new HttpHeaders();
    headers = headers.append('Authorization', 'Basic ' + base64);
    const url = `${this.baseURL}/session`;
    return this.http.get(url, { headers });
  }

  provider(userId): Observable<any> {
    const url = `${this.baseURL}/provider?user=${userId}&v=custom:(uuid,person:(uuid,display,gender),attributes)`;
    return this.http.get(url);
  }
}
