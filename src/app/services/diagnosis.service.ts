import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class DiagnosisService {
  private baseURL = '13.127.240.201:8080';
  constructor(private http: HttpClient) { }

  concept(uuid): Observable<any> {
    const url = `http://${this.baseURL}/openmrs/ws/rest/v1/concept/${uuid}`;
    return this.http.get(url);
  }

  deleteObs(uuid): Observable<any> {
    const url = `http://${this.baseURL}/openmrs/ws/rest/v1/obs/${uuid}?purge=true`;
    return this.http.delete(url);
  }
}
