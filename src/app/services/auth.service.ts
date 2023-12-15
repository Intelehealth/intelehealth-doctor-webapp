import { SessionService } from "./session.service";
import { Injectable } from "@angular/core";
import { CookieService } from "ngx-cookie-service";
import { Router } from "@angular/router";
import FingerprintJS from "@fingerprintjs/fingerprintjs";
declare var getFromStorage: any, saveToStorage: any, deleteFromStorage: any;

@Injectable({
  providedIn: "root",
})
export class AuthService {
  constructor(
    private myRoute: Router,
    private sessionService: SessionService,
    private cookieService: CookieService
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
        this.cookieService.deleteAll();
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
}
