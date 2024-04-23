import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from "../../environments/environment";
import { LanguageModel, SpecializationModel } from '../model/model';
import CssFilterConverter from 'css-filter-converter';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AppConfigService {

  private baseURL = environment.configURL;
  public version: string;
  public apiEndpoint: string;
  public specialization: SpecializationModel[];
  public language: LanguageModel[];
  private configUrl = 'assets/config.json';

  constructor(private http: HttpClient) { }

  load(): Promise<any> {
    const promise = this.http.get(`${this.baseURL}/config/getPublishedConfig`)
      .toPromise()
      .then(data => {
        data = {
            ...data,
            theme: {
              primaryColor:'',
              secondaryColor:'',
              filterColor:'',
            }
          }
        Object.assign(this, data);
        return data;
      });
    return promise;
  }

  getConvertedFilterColor(): Promise<string> {
    return this.load().then(data => {
      const result = CssFilterConverter.hexToFilter(data.theme.filterColor, { sheen: false });
      return result.color;
    });
  }

  getPrimaryColor(): Promise<string> {
    return this.load().then(data => {
      const result = data.theme
      return result;
    });
  }

  getConfig(): Observable<any> {
    return this.http.get<any>(this.configUrl);
  }
}
