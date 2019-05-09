import { Injectable } from '@angular/core';
import { CookieService } from 'ngx-cookie-service';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  constructor(private myRoute: Router,
              private cookieService: CookieService) { }

  sendToken(token) {
    this.cookieService.set('JSESSIONID', token);
  }

  getToken() {
    return this.cookieService.check('JSESSIONID');
  }

  isLoggedIn() {
    return this.getToken() !== false;
  }

  logout() {
    this.cookieService.deleteAll();
    this.myRoute.navigate(['/']);
  }
}
