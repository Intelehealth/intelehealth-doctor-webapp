import { SessionService } from "./session.service";
import { Injectable } from "@angular/core";
import { CookieService } from "ngx-cookie-service";
import { Router } from "@angular/router";
import FingerprintJS from "@fingerprintjs/fingerprintjs";
import { environment } from "src/environments/environment";
import { HttpClient } from "@angular/common/http";
import { getCacheData, setCacheData } from "../utils/utility-functions";
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
  ) {}
  public fingerPrint;

  getAuthToken(username, password, rememberme = false /** remember me support for PWA to get longer expiry token by default is false */) {
    return this.http.post(`${environment.authSvcUrl}auth/login`, {
      username,
      password,
      rememberme
    });
  }

  /**
   * Getter for auth JWT token from localstorage
   * @return {string} - JWT auth token
  */
  get authToken() {
    return getCacheData('token') || '';
  }

    
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

  logout() {
    this.sessionService.session().subscribe((res) => {
      this.sessionService.deleteSession(res.sessionId).subscribe((response) => {
        deleteFromStorage("user");
        deleteFromStorage("provider");
        deleteFromStorage("visitNoteProvider");
        deleteFromStorage("registrationNumber");
        deleteFromStorage("session");
        deleteFromStorage("JSESSIONID");
        this.cookieService.deleteAll();
        this.myRoute.navigate(["/login"]);
        localStorage.clear();
        setTimeout(() => {
          window.location.reload();
        }, 500);
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

}
