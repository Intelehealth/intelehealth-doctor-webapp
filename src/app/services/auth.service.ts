import { SessionService } from "./session.service";
import { Injectable } from "@angular/core";
import { Router } from "@angular/router";
import FingerprintJS from "@fingerprintjs/fingerprintjs";
import { CookieService } from 'ngx-cookie';
import { getCacheData, setCacheData } from "../utils/utility-functions";
import { HttpClient } from "@angular/common/http";
import { environment } from "src/environments/environment";
declare var deleteFromStorage: any;

@Injectable({
  providedIn: "root",
})
export class AuthService {
  constructor(
    private myRoute: Router,
    private sessionService: SessionService,
    private cookieService: CookieService,
    private http: HttpClient
  ) { }
  public fingerPrint;


  getAuthToken(username, password, rememberme = false /** remember me support for PWA to get longer expiry token by default is false */) {
    return this.http.post(`${environment.authSvcUrl}auth/login`, {
      username,
      password,
      rememberme
    });
  }

  /**
   * Set passed JSESSIONID token
   * @param token String
   */
  sendToken(token) {
    this.cookieService.put("JSESSIONID", token);
  }

  /**
   * Getter for auth JWT token from localstorage
   * @return {string} - JWT auth token
   */
  get authToken() {
    return getCacheData('token') || '';
  }

  /**
   * Returns JSESSIONID token from cookie if not found, fallback to localStorage and set to cookie
   * @returns String
   */
  getToken() {
    let sessionId = this.cookieService.get("JSESSIONID");
    if (!sessionId) {
      sessionId = getCacheData('JSESSIONID')
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
    setCacheData('JSESSIONID', token);
    this.sendToken(token);
  }

  /**
   * Removes session
   */
  logout() {
    this.sessionService.session().subscribe((res) => {
      this.sessionService.deleteSession(res.sessionId).subscribe((response) => {
        deleteFromStorage("user");
        deleteFromStorage("endVisitCount");
        deleteFromStorage("provider");
        deleteFromStorage("visitNoteProvider");
        deleteFromStorage("session");
        deleteFromStorage("nurseName");
        deleteFromStorage("doctorName");
        deleteFromStorage("providerType");
        deleteFromStorage("JSESSIONID");
        this.cookieService.removeAll();
        this.myRoute.navigate(["/login"]);
      });
    });
  }

  /**
   * Returns browser's unique fingerprint
   */
  getFingerPrint() {
    (async () => {
      const fp = await FingerprintJS.load();
      const result = await fp.get();
      this.fingerPrint = result.visitorId;
    })();
  }
}
