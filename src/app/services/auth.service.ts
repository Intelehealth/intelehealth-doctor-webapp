import { SessionService } from "./session.service";
import { Injectable } from "@angular/core";
import { Router } from "@angular/router";
import FingerprintJS from "@fingerprintjs/fingerprintjs";
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { environment } from "src/environments/environment";
import { catchError, map, mergeMap } from "rxjs/operators";
import { BehaviorSubject, Observable, throwError } from "rxjs";
import { CookieService } from "ngx-cookie-service";
import { NgxPermissionsService, NgxRolesService } from "ngx-permissions";
import examples from 'libphonenumber-js/examples.mobile.json';
import { CountryCode, AsYouType, getExampleNumber } from "libphonenumber-js";
import { deleteCacheData, getCacheData, setCacheData } from "../utils/utility-functions";
import { doctorDetails, visitTypes } from "src/config/constant";

@Injectable({
  providedIn: "root",
})
export class AuthService {

  private gatewayURL = environment.authGatwayURL;
  private baseUrl = environment.baseURL;
  private currentUserSubject: BehaviorSubject<any>;
  public currentUser: Observable<any>;
  private base64Cred: string;
  private mindmapUrl: string = environment.mindmapURL;
  private notificationUrl: string = environment.notificationURL;
  public rememberMe: boolean = false;

  constructor(
    private myRoute: Router,
    private sessionService: SessionService,
    private cookieService: CookieService,
    private http: HttpClient,
    private router: Router,
    private rolesService: NgxRolesService,
    private permissionsService: NgxPermissionsService
  ) {
    let locStorageUser = getCacheData(true,'currentUser');
    this.currentUserSubject = new BehaviorSubject<any>(getCacheData(true,'currentUser'));
    this.currentUser = this.currentUserSubject.asObservable();
    if (locStorageUser) {
      this.permissionsService.loadPermissions(this.extractPermissions(locStorageUser.user.privileges));
      this.rolesService.addRoles(this.extractRolesAndPermissions(locStorageUser.user.privileges, locStorageUser.user.roles));
    }
    this.base64Cred = getCacheData(false,'xsddsdass');
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
        deleteCacheData(doctorDetails.USER);
        deleteCacheData(doctorDetails.PROVIDER);
        deleteCacheData(visitTypes.VISIT_NOTE_PROVIDER);
        deleteCacheData('session');
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
    setCacheData('xsddsdass', credBase64);
    this.cookieService.deleteAll();
    return this.http.delete(`${this.baseUrl}/session`).pipe(
      catchError((err) => throwError(err)),
      map(res => res),
      mergeMap((item) => {
        let headers: HttpHeaders = new HttpHeaders();
        headers = headers.append('Authorization', 'Basic ' + credBase64);
        return this.http.get(`${this.baseUrl}/session`, { headers }).pipe(
          map((user: any) => {
            if (user.authenticated) {
              user.verified = false;
              setCacheData('currentUser', JSON.stringify(user));
              setCacheData(doctorDetails.USER, JSON.stringify(user.user));
              this.permissionsService.loadPermissions(this.extractPermissions(user.user.privileges));
              this.rolesService.addRoles(this.extractRolesAndPermissions(user.user.privileges, user.user.roles));
              this.currentUserSubject.next(user);
              if (user.sessionId) {
                this.cookieService.set('JSESSIONID', user.sessionId);
              }
            }
            return user;
          }));
      })
    );
  }

  getAuthToken(username: string, password: string) {
    const url = this.gatewayURL.replace('/v2', '');
    return this.http.post(`${url}auth/login`, { username, password }).pipe(
      map((res: any) => {
        setCacheData('token', res.token);
        return res;
      })
    );
  }

  get authToken() {
    return getCacheData(false,'token') || '';
  }

  getProvider(userId: string): Observable<any> {
    return this.http.get(`${this.baseUrl}/provider?user=${userId}&v=custom:(uuid,person:(uuid,display,gender,age,birthdate,preferredName),attributes)`);
  }

  logOut() {
    // remove user from local storage to log user out
    let headers: HttpHeaders = new HttpHeaders();
    headers = headers.set('Authorization', `Basic ${this.base64Cred}`);
    this.http.delete(`${this.baseUrl}/session`, { headers }).subscribe((res: any) => {
      deleteCacheData('currentUser');
      deleteCacheData(doctorDetails.USER);
      deleteCacheData(doctorDetails.PROVIDER);
      deleteCacheData(doctorDetails.DOCTOR_NAME);
      deleteCacheData('xsddsdass');
      deleteCacheData('token');
      deleteCacheData('socketQuery');
      this.cookieService.deleteAll();
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
    setCacheData('currentUser', JSON.stringify({ ...this.currentUserValue, verified: true }));
  }

  checkIfUsernameExists(username: string): Observable<any> {
    return this.http.get(`${this.baseUrl}/user?q=${username}&v=custom:(uuid,display,username,person:(uuid,display))`);
  }

  changePassword(oldPassword: string, newPassword: string): Observable<any> {
    return this.http.post(`${this.baseUrl}/password`, { oldPassword, newPassword });
  }

  getInternationalMaskByCountryCode(countryCode: CountryCode, withPrefix: boolean = true) {
    const number = getExampleNumber(countryCode, examples);
    const asYouType = new AsYouType(countryCode);
    asYouType.input(number.formatInternational());
    const template = asYouType.getTemplate();
    const templateWithoutPlus = template.substr(1);
    const mask = [];
    let prefix = number.countryCallingCode.split("").reverse();
    for (const char of templateWithoutPlus) {
      if (char == 'x') {
        if (withPrefix) {
          if (prefix.length) {
            mask.push(prefix.pop());
          } else {
            mask.push(/\d/);
          }
        } else {
          if (prefix.length) {
            prefix.pop();
          } else {
            mask.push(/\d/);
          }
        }
      } else {
        if (withPrefix) {
          mask.push(char);
        } else {
          if (mask.length) {
            mask.push(char);
          }
        }
      }
    }
    return withPrefix ? ["+", ...mask] : mask;
  }

  requestOtp(payload: any): Observable<any> {
    return this.http.post(`${this.mindmapUrl}/auth/requestOtp`, payload);
  }

  verifyOtp(payload: any): Observable<any> {
    return this.http.post(`${this.mindmapUrl}/auth/verifyOtp`, payload);
  }

  resetPassword(userUuid: string, newPassword: string) {
    return this.http.post(`${this.mindmapUrl}/auth/resetPassword/${userUuid}`, { newPassword });
  }

  replaceWithStar(str: string, type) {
    let n = str?.length;
    return str.replace(str.substring(5, (type == 'phone') ? n - 2 : n - 4), "*****");
  }

  checkSession() {
    return this.http.get(`${this.mindmapUrl}/auth/check?ngsw-bypass=true`)
  }

  setRememberMe(userUuid = this.userId) {
    return this.http.post(`${this.mindmapUrl}/auth/rememberme?ngsw-bypass=true`, { userUuid })
  }

  resetSession(userUuid = this.userId) {
    return this.http.post(`${this.mindmapUrl}/auth/reset?ngsw-bypass=true`, { userUuid })
  }

  get userId() {
    try {
      return getCacheData(true, doctorDetails.USER).uuid;
    } catch (error) {
      return null;
    }
  }

  validateProviderAttribute(attributeType: string, attributeValue: any, providerUuid: string): Observable<any> {
    return this.http.post(`${this.mindmapUrl}/auth/validateProviderAttribute`, { attributeType, attributeValue, providerUuid });
  }

  subscribePushNotification(sub: PushSubscription, user_uuid: string, finger_print: string, providerName: string, speciality: string) {
    return this.http.post(`${this.notificationUrl}/subscribe`, { sub, user_uuid, finger_print, speciality, providerName  });
  }

  getNotificationStatus(user_uuid: string) {
    return this.http.get(`${environment.mindmapURL}/mindmap/getNotificationStatus/${user_uuid}`);
  }

  toggleNotificationStatus(user_uuid: string) {
    return this.http.put(`${environment.mindmapURL}/mindmap/toggleNotificationStatus/${user_uuid}`, null);
  }
}
