import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
// import { environment } from "../../environments/environment";
import { LanguageModel, PatientRegistrationFieldsConfigModel, VitalModel, SpecializationModel, WebRTCConfigModel, PatientVisitSummaryConfigModel, PatientVisitSection, DropdownValuesModel } from './../model/model';
import { EnvConfigService } from './env.service'; 

@Injectable({
  providedIn: 'root'
})
export class AppConfigService {

  // private baseURL ="https://dev.intelehealth.org:4004/api"
  private baseURL :string;
  public version: string;
  public apiEndpoint: string;
  public specialization: SpecializationModel[];
  public language: LanguageModel[];
  public patient_registration: PatientRegistrationFieldsConfigModel;
  public theme_config: any[];
  public patient_vitals: VitalModel[];
  public patient_diagnostics:any[];
  public digital_stethoscope:any[];
  public digital_stethoscope_section: boolean;
  public webrtc_section: boolean;
  public webrtc: WebRTCConfigModel;
  public patient_visit_summary: PatientVisitSummaryConfigModel;
  public patient_vitals_section: boolean;
  public patient_reg_other: boolean;
  public patient_reg_address: boolean;
  public abha_section: boolean;
  public sidebar_menus: { [key: string]: boolean };
  public patient_visit_sections: PatientVisitSection[]
  public dropdown_values: DropdownValuesModel[]
  public patient_diagnostics_section: boolean;
  public ai_llm_section: boolean;
  public ai_llm_recording_section:  boolean;
  public prescription_notes_section: boolean;
  public prescription_notes: { specialty: string; notes: string[]; is_enabled: boolean }[];

  constructor(private http: HttpClient,private envService: EnvConfigService) {
    this.baseURL = this.envService.getConfig('configURL'); 
   }

  load(): Promise<any> {
    const promise = this.http.get(`${this.baseURL}/config/getPublishedConfig?ngsw-bypass=true`)
      .toPromise()
      .then((data) => {
        this.setPatientVisitSections(data)
        Object.assign(this, data);
        return data;
      });
    return promise;
  }

  setPatientVisitSections(data: any) {
    data.patient_visit_sections = (data?.patient_visit_sections ?? [])
    .map((pvs: PatientVisitSection) => {
      return {
        ...pvs,
        lang: pvs.lang ? (typeof pvs.lang === 'object' ? pvs.lang : JSON.parse(pvs.lang)) : null,
      }
    })
  }

  public get tourConfig(){
    try {
      return JSON.parse(this.theme_config.find((config: any) => config.key === 'help_tour_config').value);
    } catch (error) {
      return null;
    }
  }

  public get patientRegFields() {
    const fields = [];
    Object.keys(this.patient_registration).forEach(obj=>{
      fields.push(...this.patient_registration[obj]
        .filter((e: { is_enabled: any; })=>e.is_enabled)
        .map((e: { name: any; })=>e.name));
    });

    return fields;
  }

  public checkPatientRegField(fieldName: any, fields: string | any[]): boolean{
    return fields.indexOf(fieldName) !== -1;
  }

  fetchAllLanguage(): Observable<any> {
    return this.http.get<any>(`${this.baseURL}/language/getallEnabledLanguages`);
  } 
}
    