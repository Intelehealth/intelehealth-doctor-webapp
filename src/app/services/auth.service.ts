import { SessionService } from "./session.service";
import { Injectable } from "@angular/core";
import { CookieService } from "ngx-cookie-service";
import { Router } from "@angular/router";
import FingerprintJS from "@fingerprintjs/fingerprintjs";
import { HttpClient } from "@angular/common/http";
import { environment } from "src/environments/environment";
import { map } from "rxjs/operators";
import { Observable } from "rxjs";
declare var getFromStorage: any, saveToStorage: any, deleteFromStorage: any;

@Injectable({
  providedIn: "root",
})
export class AuthService {
  constructor(
    private myRoute: Router,
    private sessionService: SessionService,
    private cookieService: CookieService,
    private http: HttpClient
  ) {}
  public fingerPrint;

  /**
   * Set passed JSESSIONID token
   * @param token String
   */
  sendToken(token) {
    this.cookieService.set("JSESSIONID", token);
  }

  /**
   * Returns JSESSIONID token from cookie if not found, fallback to localStorage and set to cookie
   * @returns String
   */
  getToken() {
    let sessionId = this.cookieService.get("JSESSIONID");
    if (!sessionId) {
      sessionId = localStorage.JSESSIONID
      if (sessionId) this.sendToken(sessionId);
    }
    return sessionId || '';
  }

  /**
   * Returns true if token exists
   * @returns Boolean
   */
  isLoggedIn() {
    return !!this.getToken();
  }

  /**
   * Set passed token to localStorage
   */
  setToken(token) {
    localStorage.JSESSIONID = token;
    this.sendToken(token);
  }

  logout() {
    this.sessionService.session().subscribe((res) => {
      this.sessionService.deleteSession(res.sessionId).subscribe((response) => {
        deleteFromStorage("user");
        deleteFromStorage("provider");
        deleteFromStorage("visitNoteProvider");
        deleteFromStorage("session");
        deleteFromStorage("JSESSIONID");
        deleteFromStorage("token");
        this.cookieService.deleteAll();
        this.cookieService.deleteAll('/');
        this.cookieService.deleteAll('/openmrs');
        this.myRoute.navigate(["/login"]);
      });
    });
  }

  getFingerPrint() {
    (async () => {
      const fp = await FingerprintJS.load();
      const result = await fp.get();
      this.fingerPrint = result.visitorId;
    })();
  }

    /**
     * Getter for auth JWT token from localstorage
     * @return {string} - JWT auth token
     */
    get authToken() {
      return getFromStorage('token', false) || '';
    }

      /**
        * Get auth token from auth gateway
        * @param {string} username - Username
        * @param {string} password - Password
        * @return {Observable<any>}
        */
  getAuthToken(username: string, password: string): Observable<any> {
    const url = environment.gatewayURL;
    return this.http.post(`${url}auth/login`, { username, password }).pipe(
      map((res: any) => {
        saveToStorage('token', res.token, false);
        return res;
      })
    );
  }
}
