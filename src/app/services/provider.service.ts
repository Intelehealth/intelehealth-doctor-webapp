import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { forkJoin, Observable, of } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ProviderService {

  domainUrl: string = environment.base;
  baseUrl: string = environment.baseURL;

  constructor(private http: HttpClient) { }

  getProviderAttributeTypes(): Observable<any> {
    return this.http.get(`${this.baseUrl}/providerattributetype`);
  }

  updatePerson(target_person_uuid: string, gender: string, age: number, birthdate: string): Observable<any> {
    return this.http.post(`${this.baseUrl}/person/${target_person_uuid}`, { gender, age, birthdate });
  }

  createPersonName(target_person_uuid: string, givenName: string, middleName: string, familyName: string): Observable<any> {
    return this.http.post(`${this.baseUrl}/person/${target_person_uuid}/name`, { givenName, middleName, familyName, preferred: true, prefix: null });
  }

  updatePersonName(target_person_uuid: string, target_name_uuid: string, givenName: string, middleName: string, familyName: string): Observable<any> {
    return this.http.post(`${this.baseUrl}/person/${target_person_uuid}/name/${target_name_uuid}`, { givenName, middleName, familyName, preferred: true, prefix: null });
  }

  addOrUpdateProviderAttribute(target_provider_uuid: string, target_provider_attribute_uuid: string, attribute_type_uuid: string, value: any): Observable<any> {
    if (value) {
      if (target_provider_attribute_uuid) {
        return this.http.post(`${this.baseUrl}/provider/${target_provider_uuid}/attribute/${target_provider_attribute_uuid}`, { value });
      } else {
        return this.http.post(`${this.baseUrl}/provider/${target_provider_uuid}/attribute`, { attributeType: attribute_type_uuid, value });
      }
    } else {
      return of(null);
    }

  }

  requestDataFromMultipleSources(requestSources: any): Observable<any[]> {
    return forkJoin([...requestSources]);
  }

  getSignture(providerid: string) {
    return this.http.get(`${this.domainUrl}/ds/${providerid}_sign.png`, { responseType: 'blob' });
  }

  creatSignature(providerId:string, textOfSign:string, fontName:string) : Observable<any> {
    return this.http.post(`${this.domainUrl}/createsign`, { providerId, fontName, textOfSign });
  }

  uploadSignature(file: string, providerid:string) : Observable<any> {
    return this.http.post(`${this.domainUrl}/uploadsign`, { file, providerid });
  }
}
