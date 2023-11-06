import { SessionService } from "./session.service";
import { Injectable } from "@angular/core";
import { Router } from "@angular/router";
import FingerprintJS from "@fingerprintjs/fingerprintjs";
import { CookieService } from 'ngx-cookie';
import { getCacheData, setCacheData } from "../utils/utility-functions";
declare var deleteFromStorage: any;

@Injectable({
  providedIn: "root",
})
export class AuthService {
  constructor(
    private myRoute: Router,
    private sessionService: SessionService,
    private cookieService: CookieService
  ) { }
  public fingerPrint;

  /**
   * Set passed JSESSIONID token
   * @param token String
   */
  sendToken(token) {
    this.cookieService.put("JSESSIONID", token);
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
