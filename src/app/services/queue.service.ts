import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { DoctorStatus, DoctorStatusResponse, QueueVisitsResponse } from '../queue/queue.model';

@Injectable({
  providedIn: 'root'
})
export class QueueService {

  private baseURL = environment.queueURL;

  constructor(private http: HttpClient) { }

  getDoctorVisits(doctorUuid: string, speciality: string, limit = 50, offset = 0): Observable<QueueVisitsResponse> {
    const params = new HttpParams()
      .set('speciality', speciality)
      .set('limit', `${limit}`)
      .set('offset', `${offset}`);
    return this.http.get<QueueVisitsResponse>(`${this.baseURL}/queue/doctor/${doctorUuid}/visits`, { params });
  }

  updateDoctorStatus(
    doctorUuid: string,
    status: DoctorStatus,
    speciality: string,
    breakEndsAt: Date | null = null
  ): Observable<DoctorStatusResponse> {
    const body: { status: DoctorStatus; speciality: string; breakEndsAt?: string } = { status, speciality };
    if (breakEndsAt) {
      body.breakEndsAt = breakEndsAt.toISOString();
    }
    return this.http.patch<DoctorStatusResponse>(`${this.baseURL}/doctor/${doctorUuid}/status`, body);
  }
}
