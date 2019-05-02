import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class DiagnosisService {
  med: any =  [];
  private baseURL = 'demo.intelehealth.io';
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
