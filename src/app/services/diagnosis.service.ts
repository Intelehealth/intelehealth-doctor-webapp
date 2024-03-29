import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { MatSnackBar } from "@angular/material/snack-bar";
import { getCacheData, getEncounterProviderUUID } from '../utils/utility-functions';
import { doctorDetails } from 'src/config/constant';

@Injectable({
  providedIn: 'root'
})
export class DiagnosisService {
  diagnosisArray = [];
  public isVisitSummaryChanged = false
  private baseURL = environment.baseURL;

  constructor(private http: HttpClient,  private snackbar: MatSnackBar) { }

  concept(uuid): Observable<any> {
    const url = `${this.baseURL}/concept/${uuid}`;
    return this.http.get(url);
  }

  deleteObs(uuid): Observable<any> {
    const url = `${this.baseURL}/obs/${uuid}`;
    return this.http.delete(url);
  }

  getObs(patientId, conceptId): Observable<any> {
    // tslint:disable-next-line: max-line-length
    const url = `${this.baseURL}/obs?patient=${patientId}&v=custom:(uuid,value,encounter:(visit:(uuid)))&concept=${conceptId}`;
    return this.http.get(url);
  }

  getDiagnosisList(term: any) {
    const url = `${environment.baseURLCoreApp}/search.action?&term=${term}`;
    return this.http.get(url)
    .pipe(
      map((response: []) => {
        this.diagnosisArray = [];
        response.forEach((element: any) => {
          element.concept.conceptMappings.forEach(name => {
            if (name.conceptReferenceTerm.conceptSource.name === 'ICD-10-WHO') {
              this.diagnosisArray.push(element.concept.preferredName);
            }
          });
        });
        return this.diagnosisArray;
      })
    );
  }

  isSameDoctor() {
    const providerDetails = getCacheData(true, doctorDetails.PROVIDER);
    const providerUuid = providerDetails.uuid;
    if (providerDetails && providerUuid === getEncounterProviderUUID()) {
      return true;
    } else {
      this.snackbar.open("Another doctor is viewing this case", null, {
        duration: 4000,
      });
    }
  }
}
