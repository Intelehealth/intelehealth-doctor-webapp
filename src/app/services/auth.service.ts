import { SessionService } from "./session.service";
import { Injectable } from "@angular/core";
import { Router } from "@angular/router";
import FingerprintJS from "@fingerprintjs/fingerprintjs";
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { environment } from "src/environments/environment";
import { map } from "rxjs/operators";
import { BehaviorSubject, Observable } from "rxjs";
import { CookieService } from "ngx-cookie-service";
import { NgxPermissionsService, NgxRolesService } from "ngx-permissions";
declare var deleteFromStorage: any;

@Injectable({
  providedIn: "root",
})
export class AuthService {

  private baseUrl = environment.baseURL;
  private currentUserSubject: BehaviorSubject<any>;
  public currentUser: Observable<any>;
  private base64Cred: string;

  constructor(
    private myRoute: Router,
    private sessionService: SessionService,
    private cookieService: CookieService,
    private http: HttpClient,
    private router: Router,
    private rolesService: NgxRolesService,
    private permissionsService: NgxPermissionsService
  ) {
    let localStorageUser = JSON.parse(localStorage.getItem('currentUser'));
    this.currentUserSubject = new BehaviorSubject<any>(JSON.parse(localStorage.getItem('currentUser')));
    this.currentUser = this.currentUserSubject.asObservable();
    if (localStorageUser) {
      this.permissionsService.loadPermissions(this.extractPermissions(localStorageUser.user.privileges));
      this.rolesService.addRoles(this.extractRolesAndPermissions(localStorageUser.user.privileges, localStorageUser.user.roles));
    }
    this.base64Cred = localStorage.getItem('xsddsdass');
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
    this.base64Cred = credBase64;
    localStorage.setItem('xsddsdass', credBase64);
    // console.log(this.cookieService.getAll());
    // this.cookieService.delete('JSESSIONID');
    // this.cookieService.delete('JSESSIONID', '/');
    // this.cookieService.delete('JSESSIONID', '/openmrs');
    // this.cookieService.delete('JSESSIONID', '/', this.base);
    // this.cookieService.delete('JSESSIONID', '/openmrs', this.base);
    this.cookieService.deleteAll();
    // this.cookieService.deleteAll('/');
    // this.cookieService.deleteAll('/openmrs');
    // this.cookieService.deleteAll('/', this.base);
    // this.cookieService.deleteAll('/openmrs', this.base);
    // document.cookie = 'JSESSIONID' +'=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;';
    // document.cookie = 'JSESSIONID' +'=; Path=/openmrs; Expires=Thu, 01 Jan 1970 00:00:01 GMT;';

    this.http.delete(`${this.baseUrl}/session`).subscribe((res) => { });
    let headers: HttpHeaders = new HttpHeaders();
    headers = headers.append('Authorization', 'Basic ' + credBase64);
    return this.http.get(`${this.baseUrl}/session`, { headers }).pipe(
      map((user: any) => {
        if (user.authenticated) {
          user.verified = false;
          localStorage.setItem('currentUser', JSON.stringify(user));
          localStorage.setItem('user', JSON.stringify(user.user));
          this.permissionsService.loadPermissions(this.extractPermissions(user.user.privileges));
          this.rolesService.addRoles(this.extractRolesAndPermissions(user.user.privileges, user.user.roles));
          this.currentUserSubject.next(user);
          if (user.sessionId) {
            this.cookieService.set('JSESSIONID', user.sessionId);
          }
        }
        return user;
      }));
  }

  getProvider(userId: string): Observable<any> {
    return this.http.get(`${this.baseUrl}/provider?user=${userId}&v=custom:(uuid,person:(uuid,display,gender,age,birthdate,preferredName),attributes)`);
  }

  logOut() {
    // remove user from local storage to log user out
    let headers: HttpHeaders = new HttpHeaders();
    // headers = headers.set('cookie', `JSESSIONID=${id}`);
    headers = headers.set('Authorization', `Basic ${this.base64Cred}`);
    this.http.delete(`${this.baseUrl}/session`, { headers }).subscribe((res: any) => {
      localStorage.removeItem('currentUser');
      localStorage.removeItem('user');
      localStorage.removeItem('provider');
      localStorage.removeItem('doctorName');
      localStorage.removeItem('xsddsdass');
      // console.log(this.cookieService.getAll());
      // this.cookieService.delete('JSESSIONID');
      // this.cookieService.delete('JSESSIONID', '/');
      // this.cookieService.delete('JSESSIONID', '/openmrs');
      // this.cookieService.delete('JSESSIONID', '/', this.base);
      // this.cookieService.delete('JSESSIONID', '/openmrs', this.base);
      this.cookieService.deleteAll();
      // this.cookieService.deleteAll('/');
      // this.cookieService.deleteAll('/openmrs');
      // this.cookieService.deleteAll('/', this.base);
      // this.cookieService.deleteAll('/openmrs', this.base);
      // document.cookie = 'JSESSIONID' +'=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;';
      // document.cookie = 'JSESSIONID' +'=; Path=/openmrs; Expires=Thu, 01 Jan 1970 00:00:01 GMT;';
      this.currentUserSubject.next(null);
      this.permissionsService.flushPermissions();
      this.rolesService.flushRoles();
      this.router.navigate(['/session/login']);
    });
  }

  extractPermissions(perm: any[]) {
    let extractedPermissions = perm.map((val) => {
      return val.name;
    });
    return extractedPermissions;
  }

  extractRolesAndPermissions(perm: any[], roles: any[]) {
    let extractedPermissions = perm.map((val) => {
      return val.name;
    });
    let extractedRoles = roles.map((val) => {
      return val.name.toUpperCase();
    });
    let rolesObj = {};
    extractedRoles.forEach(r => {
      rolesObj[r] = extractedPermissions;
    });
    return rolesObj;
  }

  updateVerificationStatus() {
    this.currentUserSubject.next({ ...this.currentUserValue, verified: true });
    localStorage.setItem('currentUser', JSON.stringify({ ...this.currentUserValue, verified: true }));
  }

  checkIfUsernameExists(username: string): Observable<any> {
    return this.http.get(`${this.baseUrl}/user?q=${username}&v=custom:(uuid,display,username,person:(uuid,display))`);
  }

  changePassword(oldPassword: string, newPassword: string): Observable<any> {
    return this.http.post(`${this.baseUrl}/password`, { oldPassword, newPassword });
  }
}
