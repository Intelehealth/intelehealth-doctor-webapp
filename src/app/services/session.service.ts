import { Injectable } from "@angular/core";
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Observable } from "rxjs";
import { environment } from "../../environments/environment";
import { map } from "rxjs/operators";

@Injectable({
  providedIn: "root",
})
export class SessionService {
  private baseURL = environment.baseURL;
  visitStateProviderType = "0406ffeb-a11a-4bb3-8ea6-3ef43b79dc77";
  public visitState = null;

  constructor(private http: HttpClient) {
    this.visitState = "NA";
  }

  /**
   * Fetch current session
   * @returns Observable
   */
  session(): Observable<any> {
    const url = `${this.baseURL}/session`;
    return this.http.get(url);
  }

  /**
   * Delete session by its sessionId
   * @param sessionId String
   * @returns Observable
   */
  deleteSession(id): Observable<any> {
    let headers = new HttpHeaders();
    headers = headers.set("cookie", `JSESSIONID=${id}`);
    const url = `${this.baseURL}/session`;
    return this.http.delete(url);
  }

  /**
   * Return login session
   * @param base64
   * @returns Observable
   */
  loginSession(base64): Observable<any> {
    let headers: HttpHeaders = new HttpHeaders();
    headers = headers.append("Authorization", "Basic " + base64);
    const url = `${this.baseURL}/session`;
    return this.http.get(url, { headers });
  }

  /**
   * Get provider by userId
   * @param userId String
   * @returns Observable
   */
  provider(userId): Observable<any> {
    const url = `${this.baseURL}/provider?user=${userId}&v=custom:(uuid,person:(uuid,display,gender),attributes)`;
    return this.http.get(url).pipe(
      map((res: any) => {
        try {
          const attributes = res.results[0].attributes;
          attributes.forEach((attribute) => {
            if (attribute.attributeType.uuid === this.visitStateProviderType) {
              this.visitState = attribute.value;
            }
          });
        } catch (error) {
          console.error("error: ", error);
        }
        return res;
      })
    );
  }
}
