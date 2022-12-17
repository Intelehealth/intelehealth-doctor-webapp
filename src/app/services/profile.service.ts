import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { environment } from 'src/environments/environment';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ProfileService {
  baseURL = environment.baseURL;
  constructor(private http: HttpClient) { }

  getProfileImage(uuid): Observable<any> {
    const url = `${this.baseURL}/personimage/${uuid}`;
    return this.http.get(url, { responseType: 'blob' });
  }

  updateName(uuid: string, firstName: string, middleName: string, familyName: string, nameUuid: string): Observable<any> {
    const URL = `${this.baseURL}/person/${uuid}/name/${nameUuid}`;
    const json = {
      givenName: firstName,
      middleName: middleName,
      familyName: familyName,
    };
    return this.http.post(URL, json);
  }

  updateGenderAndBirthDate(uuid: string, gender: string, birthDate: string): Observable<any> {
    const URL = `${this.baseURL}/person/${uuid}`;
    const json = {
      gender: gender,
      birthdate: birthDate
    };
    return this.http.post(URL, json);
  }

  updateProviderAttribute(uuid: string, attributeTypeUuid: string, attributeValue: string, isExistingPresent: boolean, existingUuid: string): Observable<any> {
    const URL = isExistingPresent ? `${this.baseURL}/provider/${uuid}/attribute/${existingUuid}`
      : `${this.baseURL}/provider/${uuid}/attribute`;
    const json = {
      attributeType: attributeTypeUuid,
      value: attributeValue,
      voided: false
    };
    return this.http.post(URL, json);
  }

  updateProfileImage(json: object): Observable<any> {
    const URL = `${this.baseURL}/personimage`;
    var header = {
      headers: new HttpHeaders({
        "Content-Type": "application/json",
        Authorization: "Basic " + btoa("nurse:Nurse123"),
      }),
    };
    return this.http.post(URL, json, header);
  }

  deleteProviderAttribute(uuid: string, existingUuid: string): Observable<any> {
    const URL = `${this.baseURL}/provider/${uuid}/attribute/${existingUuid}`
    return this.http.delete(URL);
  }
}
