import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class DiagnosisService {
  diagnosisArray = [];
  private baseURL = window.location.host;
  // private baseURL = '13.233.50.223:8080';
  // private baseURL = 'demo.intelehealth.io';

  constructor(private http: HttpClient) { }

  concept(uuid): Observable<any> {
    const url = `http://${this.baseURL}/openmrs/ws/rest/v1/concept/${uuid}`;
    return this.http.get(url);
  }

  deleteObs(uuid): Observable<any> {
    const url = `http://${this.baseURL}/openmrs/ws/rest/v1/obs/${uuid}?purge=true`;
    return this.http.delete(url);
  }

  getObs(patientId, conceptId): Observable<any> {
    // tslint:disable-next-line: max-line-length
    const url = `http://${this.baseURL}/openmrs/ws/rest/v1/obs?patient=${patientId}&v=custom:(uuid,value,encounter:(visit:(uuid)))&concept=${conceptId}`;
    return this.http.get(url);
  }

  getDiagnosisList(term) {
    const url = `http://${this.baseURL}/openmrs/coreapps/diagnoses/search.action?&term=${term}`;
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
              }
              this.diagnosisArray.push(diagnosis);
            }
          });
        });
        return this.diagnosisArray;
      })
    );
  }
}
