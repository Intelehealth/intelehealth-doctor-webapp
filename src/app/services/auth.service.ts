import { EncounterService } from 'src/app/services/encounter.service';
import { Injectable } from '@angular/core';
import { CookieService } from 'ngx-cookie-service';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  constructor(private myRoute: Router,
              private service: EncounterService,
              private cookieService: CookieService) { }

  sendToken(token) {
    this.cookieService.set('JSESSIONID', token, 0.016);
  }

  getToken() {
    return this.cookieService.check('JSESSIONID');
  }

  isLoggedIn() {
    return this.getToken() !== false;
  }

  logout() {
    this.service.session()
    .subscribe(res => {
      this.service.deleteSession(res.sessionId)
      .subscribe(response => {
        this.cookieService.deleteAll();
        this.myRoute.navigate(['/']);
    });
    });
  }
}
