import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { environment } from 'src/environments/environment';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ProfileService {
  base = environment.base;
  baseURL = environment.baseURL;
  mimeTypes = {
    JVBERi0: "application/pdf",
    R0lGODdh: "image/gif",
    R0lGODlh: "image/gif",
    iVBORw0KGgo: "image/png",
    "/9j/": "image/jpg"
  };

  constructor(private http: HttpClient) { }

  getProfileImage(uuid: string): Observable<any> {
    const url = `${this.baseURL}/personimage/${uuid}`;
    return this.http.get(url, { responseType: 'blob' });
  }

  getPersonName(uuid: string): Observable<any> {
    const url = `${this.baseURL}/person/${uuid}/name`;
    return this.http.get(url);
  }

  getSignture(uuid: string) {
    const url = `${this.base}/ds/${uuid}_sign.png`;
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
        "Content-Type": "application/json"
      }),
    };
    return this.http.post(URL, json, header);
  }

  creatSignature(providerId: string, textOfSign: string, fontName: string): Observable<any> {
    const URL = `${this.base}/createsign`;
    const json = {
      textOfSign: textOfSign,
      fontName: fontName,
      providerId: providerId
    };
    return this.http.post(URL, json);
  }

  updateSignature(file, providerId: string): Observable<any> {
    const URL = `${this.base}/uploadsign`;
    const json = {
      file: file,
      providerid: providerId
    };
    return this.http.post(URL, json);
  }

  deleteProviderAttribute(uuid: string, existingUuid: string): Observable<any> {
    const URL = `${this.baseURL}/provider/${uuid}/attribute/${existingUuid}`
    return this.http.delete(URL);
  }

  detectMimeType(b64: string) {
    for (var s in this.mimeTypes) {
      if (b64.indexOf(s) === 0) {
        return this.mimeTypes[s];
      }
    }
  }
}
