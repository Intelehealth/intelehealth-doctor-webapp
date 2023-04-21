import { SessionService } from "./session.service";
import { Injectable } from "@angular/core";
import { CookieService } from "ngx-cookie-service";
import { Router } from "@angular/router";
import FingerprintJS from "@fingerprintjs/fingerprintjs";
import { HttpClient } from "@angular/common/http";
import { environment } from "src/environments/environment";
import { map } from "rxjs/operators";
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
  gatewayURL = environment.authGatwayURL;

  /**
   * Set passed JSESSIONID token
   * @param token String
   */
  sendToken(token) {
    this.cookieService.set("JSESSIONID", token);
  }

  /**
   * Returns JSESSIONID token
   * @returns String
   */
  getToken() {
    return this.cookieService.check("JSESSIONID");
  }

  /**
   * Returns true if token exists
   * @returns Boolean
   */
  isLoggedIn() {
    return this.getToken() !== false;
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
        deleteFromStorage("token");
        this.cookieService.deleteAll();
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

  loginAuthGateway(username, password) {
    const url = this.gatewayURL.replace('/v2', '');
    return this.http.post(`${url}auth/login`, { username, password }).pipe(
      map((res: any) => {
        localStorage.setItem('token', res.token);
        return res;
      })
    )
  }

  get authToken() {
    return localStorage.getItem('token') || '';
  }
}
