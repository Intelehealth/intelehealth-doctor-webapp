import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

export interface AiIssueReportPayload {
  visit_uuid: string;
  doctor_uuid: string;
  patient_uuid: string;
  ai_surface: string;
  reason: string;
  details?: string;
  suggestion_ref?: string;
  raw_suggestion?: any;
  doctor_name?: string;
  patient_openmrs_id?: string;
}

@Injectable({
  providedIn: 'root'
})
export class AiIssueReportService {
  private base = environment.mindmapURL;

  constructor(private http: HttpClient) { }

  create(payload: AiIssueReportPayload): Observable<any> {
    return this.http.post(`${this.base}/ai-issue-reports`, payload);
  }

  list(criteria: { status?: string; ai_surface?: string; page?: number; pageSize?: number } = {}): Observable<any> {
    let params = new HttpParams();
    Object.keys(criteria).forEach((k) => {
      const v = (criteria as any)[k];
      if (v !== null && v !== undefined && v !== '') params = params.set(k, v);
    });
    return this.http.get(`${this.base}/ai-issue-reports`, { params });
  }
}
