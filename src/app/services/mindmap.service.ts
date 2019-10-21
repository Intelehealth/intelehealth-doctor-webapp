import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class MindmapService {
  private baseURL =  environment.mindmapURL;

  constructor(private http: HttpClient) { }

  getMindmapKey(): Observable<any> {
    const url = `${this.baseURL}/mindmap`;
    return this.http.get(url);
  }

  postMindmap(value): Observable<any> {
    const url = `${this.baseURL}/mindmap/upload`;
    return this.http.post(url, value);
  }
}
