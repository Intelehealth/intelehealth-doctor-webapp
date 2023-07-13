import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { MatSnackBar } from "@angular/material/snack-bar";
import { TranslateService } from '@ngx-translate/core';
import { TranslationService } from './translation.service';
declare var getEncounterProviderUUID: any,  getFromStorage: any, getVisitNoteEncounter: any;


@Injectable({
  providedIn: 'root'
})
export class DiagnosisService {
  diagnosisArray = [];
  public isVisitSummaryChanged = false
  private baseURL = environment.baseURL;
  public values;

  constructor(private http: HttpClient, private snackbar: MatSnackBar,
    private translateService: TranslateService,
    private translationService: TranslationService) {
     }

  concept(uuid): Observable<any> {
    const url = `${this.baseURL}/concept/${uuid}`;
    return this.http.get(url);
  }

  deleteObs(uuid): Observable<any> {
    const url = `${this.baseURL}/obs/${uuid}`;
    return this.http.delete(url);
  }

  updateObs(uuid, data): Observable<any> {
    const url = `${this.baseURL}/obs/${uuid}`;
    return this.http.post(url, data);
  }

  getObs(patientId, conceptId): Observable<any> {
    // tslint:disable-next-line: max-line-length
    const url = `${this.baseURL}/obs?patient=${patientId}&v=custom:(uuid,value,comment,dateCreated,creator:(uuid),encounter:(visit:(uuid)))&concept=${conceptId}`;
    return this.http.get(url);
  }

  getUserByUuid(uuid: string): Observable<any> {
    const url = `${this.baseURL}/user/${uuid}?v=custom:(person:(uuid,display))`;
    return this.http.get(url);
  }

  getDiagnosisList(term) {
    const url = `${environment.baseURLCoreApp}/search.action?&term=${term}`;
    return this.http.get(url)
      .pipe(
        map((response: []) => {
          this.diagnosisArray = [];
          response.forEach((element: any) => {
            element.concept.conceptMappings.forEach(name => {
              if (name.conceptReferenceTerm.conceptSource.name === 'ICD-10-WHO') {
                const diagnosis = {
                  name: element.concept.preferredName,
                  code: name.conceptReferenceTerm.code
                };
                this.diagnosisArray.push(diagnosis);
              }
            });
          });
          return this.diagnosisArray;
        })
      );
  }

  isSameDoctor() {
    const providerDetails = getFromStorage("provider");
    const providerUuid = providerDetails.uuid;
    if (providerDetails && providerUuid === getEncounterProviderUUID()) {
      return true;
    } else {
      this.translationService.getTranslation("Another doctor is viewing this case");
    }
  }

  isEncounterProvider() {
    let flag = false;
    const providerDetails = getFromStorage("provider");
    const providerUuid = providerDetails.uuid;
    const vnEnc = getVisitNoteEncounter();
    for (let i = 0; i < vnEnc.encounterProviders.length; i++) {
      if (providerDetails && providerUuid === vnEnc.encounterProviders[i].provider.uuid) {
        flag = true;
        break;
      }
    }
    if (!flag) {
      this.translationService.getTranslation("Another doctor is viewing this case");
    }
    return flag;
  }


  getData(data: any) {
    if (data?.value.toString().startsWith("{")) {
      let value = JSON.parse(data.value.toString());
      data.value = localStorage.getItem('selectedLanguage') === 'en' ? value["en"] : value['ar'];
    }
    return data;
  }

   getBody(element: string, elementName: string) {
    this.getTranslationData();
      let value, ar1, en1;
      if (this.translateService.instant(`${element}.${elementName}`).includes(element)) {
        localStorage.getItem('selectedLanguage') === 'ar' ? (ar1 = elementName,
          en1 = elementName) : (en1 = elementName, ar1 = elementName)
          value = {
            "ar": ar1,
            "en": en1
          }
          return value;
      } else {
        if (localStorage.getItem('selectedLanguage') === 'ar') {
          ar1 = elementName;
          en1 = this.translateService.instant(`${element}.${elementName}`);
        } else {
          en1 = this.translateService.instant(`${element}.${elementName}`);
          ar1 = this.values[`${element}`][`${elementName}`];
        }
        value = {
          "ar": ar1,
          "en": en1
        }
        return value;
      }
  }

  getTranslationData() {
    let lang;
    if (localStorage.getItem('selectedLanguage') === 'en')
      lang = 'ar';
    else
      lang = "en";
    this.translateService.getTranslation(lang).subscribe(values => {
      this.values = values;
    });
  }

  getTranslationValue(key: string, value: string) {
    return this.values[key][value] ? this.values[key][value] : value;
  }
}
