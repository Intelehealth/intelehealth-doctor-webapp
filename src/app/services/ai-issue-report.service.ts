import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
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
    const target = payload.ai_surface?.startsWith('ttx') ? 'ttx' : 'ddx';
    return this.http.post(`${this.base}/${target}/error`, payload);
  }
}
