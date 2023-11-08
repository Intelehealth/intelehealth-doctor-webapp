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
  mindmapUrl: string = environment.mindmapURL;

  constructor(private http: HttpClient) { }

  /**
  * Get provider attribute types
  * @return {Observable<any>}
  */
  getProviderAttributeTypes(): Observable<any> {
    return this.http.get(`${this.baseUrl}/providerattributetype`);
  }

  /**
  * Update person details
  * @param {string} target_person_uuid - Target person uuid
  * @param {string} gender - Person gender
  * @param {number} age - Person age
  * @param {string} birthdate - Person birthdate
  * @return {Observable<any>}
  */
  updatePerson(target_person_uuid: string, gender: string, age: number, birthdate: string): Observable<any> {
    return this.http.post(`${this.baseUrl}/person/${target_person_uuid}`, { gender, age, birthdate });
  }

  /**
  * Create person name
  * @param {string} target_person_uuid - Target person uuid
  * @param {string} givenName - Person given name
  * @param {string} middleName - Person middle name
  * @param {string} familyName - Person last name
  * @return {Observable<any>}
  */
  createPersonName(target_person_uuid: string, givenName: string, middleName: string, familyName: string): Observable<any> {
    return this.http.post(`${this.baseUrl}/person/${target_person_uuid}/name`, { givenName, middleName, familyName, preferred: true, prefix: null });
  }

  /**
  * Update person name
  * @param {string} target_person_uuid - Target person uuid
  * @param {string} target_name_uuid - Person name uuid
  * @param {string} givenName - Person given name
  * @param {string} middleName - Person middle name
  * @param {string} familyName - Person last name
  * @return {Observable<any>}
  */
  updatePersonName(target_person_uuid: string, target_name_uuid: string, givenName: string, middleName: string, familyName: string): Observable<any> {
    return this.http.post(`${this.baseUrl}/person/${target_person_uuid}/name/${target_name_uuid}`, { givenName, middleName, familyName, preferred: true, prefix: null });
  }

  /**
  * Add/update provider attribute
  * @param {string} target_provider_uuid - Target provider uuid
  * @param {string} target_provider_attribute_uuid - Provider attribute uuid
  * @param {string} attribute_type_uuid - Provider attribute type uuid
  * @param {any} value - Value
  * @return {Observable<any>}
  */
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

  /**
  * Retuens forkjoin
  * @param {Observable<any>[]} requestSources - Array of request observables
  * @return {Observable<any[]>}
  */
  requestDataFromMultipleSources(requestSources: any): Observable<any[]> {
    return forkJoin([...requestSources]);
  }

  /**
  * Create signature
  * @param {string} providerId - Provider uuid
  * @param {string} textOfSign - Signature text
  * @param {string} fontName - Font name to be used
  * @return {Observable<any>}
  */
  creatSignature(providerId: string, textOfSign: string, fontName: string): Observable<any> {
    return this.http.post(`${this.mindmapUrl}/signature/create`, { providerId, fontName, textOfSign });
  }

  /**
  * Upload signature
  * @param {File} file - Signature file
  * @param {string} providerId - Provider uuid
  * @return {Observable<any>}
  */
  uploadSignature(file: string, providerid: string): Observable<any> {
    return this.http.post(`${this.mindmapUrl}/signature/upload`, { file, providerid });
  }
}
