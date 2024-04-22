import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from "../../environments/environment";
import { LanguageModel, PatientRegistrationFieldsConfigModel, SpecializationModel } from '../model/model';

@Injectable({
  providedIn: 'root'
})
export class AppConfigService {

  private baseURL = environment.configURL;
  public version: string;
  public apiEndpoint: string;
  public specialization: SpecializationModel[];
  public language: LanguageModel[];
  public patient_registration: PatientRegistrationFieldsConfigModel;

  constructor(private http: HttpClient) { }

  load(): Promise<any> {
    const promise = this.http.get(`${this.baseURL}/config/getPublishedConfig`)
      .toPromise()
      .then(data => {
        Object.assign(this, data);
        return data;
      });
    return promise;
  }
}
