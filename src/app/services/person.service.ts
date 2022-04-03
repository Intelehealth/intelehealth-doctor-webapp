import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class PersonService {

  private baseURL =  environment.baseURL;

  constructor(private http: HttpClient) { }

  saveContact(personId, contactId, value): Observable<any> {
    const url = `${this.baseURL}/person/${personId}/attribute/${contactId}`;
    return this.http.post(url, value);
  }
}
