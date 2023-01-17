import { SessionService } from "./session.service";
import { Injectable } from "@angular/core";
import { Router } from "@angular/router";
import FingerprintJS from "@fingerprintjs/fingerprintjs";
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { environment } from "src/environments/environment";
import { map } from "rxjs/operators";
import { BehaviorSubject, Observable } from "rxjs";
import { CookieService } from "ngx-cookie-service";
declare var getFromStorage: any, saveToStorage: any, deleteFromStorage: any;

@Injectable({
  providedIn: "root",
})
export class AuthService {

  private baseUrl = environment.baseURL;
  private currentUserSubject: BehaviorSubject<any>;
  public currentUser: Observable<any>;

  constructor(
    private myRoute: Router,
    private sessionService: SessionService,
    private cookieService: CookieService,
    private http: HttpClient,
    private router: Router
  ) {
    this.currentUserSubject = new BehaviorSubject<any>(JSON.parse(localStorage.getItem('currentUser')));
    this.currentUser = this.currentUserSubject.asObservable();
  }
  public fingerPrint;

  sendToken(token) {
    this.cookieService.set("JSESSIONID", token);
  }

  getToken() {
    return this.cookieService.check("JSESSIONID");
  }

  isLoggedIn() {
    return this.getToken() !== false;
  }

  logout() {
    this.sessionService.session().subscribe((res) => {
      this.sessionService.deleteSession(res.sessionId).subscribe((response) => {
        deleteFromStorage("user");
        deleteFromStorage("provider");
        deleteFromStorage("visitNoteProvider");
        deleteFromStorage("session");
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



  public get currentUserValue(): any {
    return this.currentUserSubject.value;
  }

  login(credBase64: string) {
    let headers: HttpHeaders = new HttpHeaders();
    headers = headers.append('Authorization', 'Basic ' + credBase64);
    return this.http.get(`${this.baseUrl}/session`, { headers }).pipe(
      map(async (user: any) => {
        if (user.authenticated) {
          user.verified = false;
          let provider: any = await this.getProvider(user.user.uuid);
          if (provider?.results.length) {
            user.isProvider = true;
            localStorage.setItem('provider', JSON.stringify(provider.results[0]));
            localStorage.setItem('user', JSON.stringify(user.user));
            this.currentUserSubject.next(user);
            this.cookieService.set('JSESSIONID', user.sessionId);
          }
        }
        return user;
      }));
  }

  getProvider(userId: string) {
    return this.http.get(`${this.baseUrl}/provider?user=${userId}&v=custom:(uuid,person:(uuid,display,gender,age,birthdate),attributes)`).toPromise();
  }

  logOut() {
    // remove user from local storage to log user out
    localStorage.removeItem('user');
    localStorage.removeItem('provider');
    this.cookieService.delete('JSESSIONID');
    this.currentUserSubject.next(null);
    this.router.navigate(['/session/login']);
  }
}
