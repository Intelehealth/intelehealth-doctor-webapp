import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { getCacheData } from '../utils/utility-functions';
import { doctorDetails } from 'src/config/constant';

@Injectable({
  providedIn: 'root'
})
export class InsightService {
  private base = environment.mindmapURL;

  constructor(private http: HttpClient) { }

  record(event: any): void {
    if (!(environment as any).insightsEnabled) return;
    try {
      const user = getCacheData(true, doctorDetails.USER);
      const payload = {
        source: 'webapp',
        actor_type: 'doctor',
        actor_id: user?.uuid,
        occurred_at: new Date().toISOString(),
        ...event
      };
      this.http.post(`${this.base}/insights`, payload).subscribe({ next: () => { }, error: () => { } });
    } catch (e) { }
  }

  summary(criteria: { [key: string]: any } = {}): Observable<any> {
    let params = new HttpParams();
    Object.keys(criteria).forEach((k) => {
      if (criteria[k] !== null && criteria[k] !== undefined) params = params.set(k, criteria[k]);
    });
    return this.http.get(`${this.base}/insights/summary`, { params });
  }
}
