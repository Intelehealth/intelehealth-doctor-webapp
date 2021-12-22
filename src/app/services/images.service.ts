import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';


@Injectable({
  providedIn: 'root'
})
export class ImagesService {
  private baseURL = environment.azureImage;

  constructor(private http: HttpClient) { }

  fetchProfileImage(uuid): Observable<any> {
    const url = `${this.baseURL}/personimage/${uuid}`;
    return this.http.get(url, { responseType: 'blob' });
  }

  fetchPhyImages(patientId, visitId): Observable<any> {
    const url = `${this.baseURL}/${patientId}/${visitId}`;
    return this.http.get(url);
  }

  saveQuality(id, payload): Observable<any> {
    const url = `${this.baseURL}/${id}`;
    return this.http.put(url, payload);
  }
}
