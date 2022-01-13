import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';


@Injectable({
  providedIn: 'root'
})
export class ImagesService {
  private baseURL = environment.azureImage;
  private openmrsURL = environment.baseURL;

  constructor(private http: HttpClient) { }

  fetchProfileImage(uuid): Observable<any> {
    const url = `${this.openmrsURL}/personimage/${uuid}`;
    return this.http.get(url, { responseType: 'blob' });
  }

  fetchPhyImages(patientId, visitId): Observable<any> {
    const url = `${this.baseURL}/image/${patientId}/${visitId}`;
    return this.http.get(url);
  }

  saveQuality(id, payload): Observable<any> {
    const url = `${this.baseURL}/image/${id}`;
    return this.http.put(url, payload);
  }

  saveDiagnosis(payload): Observable<any> {
    const url = `${this.baseURL}/diagnosis`;
    return this.http.post(url, payload);
  }

}
