import { SessionService } from "./session.service";
import { Injectable } from "@angular/core";
import { Router } from "@angular/router";
import FingerprintJS from "@fingerprintjs/fingerprintjs";
import { CookieService } from 'ngx-cookie';
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
   * Returns JSESSIONID token
   * @returns String
   */
  getToken() {
    return this.cookieService.get("JSESSIONID");
  }

  /**
   * Returns true if token exists
   * @returns Boolean
   */
  isLoggedIn() {
    return !!this.getToken();
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
