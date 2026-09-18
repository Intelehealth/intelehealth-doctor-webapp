import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

export type DdxTtxOverrideSurface = 'diagnosis' | 'medication' | 'advice' | 'investigation' | 'referral' | 'follow_up';
export type DdxTtxTreatmentSurface = Exclude<DdxTtxOverrideSurface, 'diagnosis'>;

export interface DdxTtxOverrideDiagnosis {
  name: string;
  ai_assisted: 'Y' | 'N';
  reason?: string;
}

export interface DdxTtxOverrideTreatment {
  surface: DdxTtxTreatmentSurface;
  selected_value: string;
  ai_assisted: 'N';
  reason: string;
}

export interface DdxTtxOverridePayload {
  visit_id: number;
  doctor_id: number;
  patient_id: number;
  diagnoses?: DdxTtxOverrideDiagnosis[];
  treatments?: DdxTtxOverrideTreatment[];
}

@Injectable({
  providedIn: 'root'
})
export class DdxTtxOverrideService {
  private base = environment.mindmapURL;

  constructor(private http: HttpClient) { }

  save(payload: DdxTtxOverridePayload): Observable<any> {
    return this.http.post(`${this.base}/ddx-ttx-overrides`, payload);
  }
}
