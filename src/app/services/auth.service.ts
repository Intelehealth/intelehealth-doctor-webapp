import { SessionService } from './session.service';
import { Injectable } from '@angular/core';
import { CookieService } from 'ngx-cookie-service';
import { Router } from '@angular/router';

declare var deleteFromStorage: any;

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  constructor(private myRoute: Router,
              private sessionService: SessionService,
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
    this.sessionService.session()
    .subscribe(res => {
      this.sessionService.deleteSession(res.sessionId)
      .subscribe(response => {
        deleteFromStorage('user');
        deleteFromStorage('provider');
        deleteFromStorage('visitNoteProvider');
        deleteFromStorage('session');
        this.cookieService.deleteAll();
        this.myRoute.navigate(['/']);
    });
    });
  }
}
