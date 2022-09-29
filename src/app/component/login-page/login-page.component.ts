import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AuthService } from 'src/app/services/auth.service';
import { SessionService } from 'src/app/services/session.service';
declare var saveToStorage: any;

@Component({
  selector: 'app-login-page',
  templateUrl: './login-page.component.html',
  styleUrls: ['./login-page.component.css']
})
export class LoginPageComponent implements OnInit {
  loginForm = new FormGroup({
    username: new FormControl('', [Validators.required]),
    password: new FormControl('', [Validators.required])
  });

  constructor(
    public sessionService: SessionService,
    public router: Router,
    public snackbar: MatSnackBar,
    public authService: AuthService
  ) { }

  ngOnInit() {
    const isLoggedIn: boolean = this.authService.isLoggedIn();
    if (isLoggedIn) {
      this.router.navigateByUrl('/home');
    }
  }

  onSubmit() {
    const value = this.loginForm.value;
    const string = `${value.username}:${value.password}`;
    const base64 = btoa(string);
    this.sessionService.loginSession(base64).subscribe(response => {
      if (response.authenticated === true) {
        this.router.navigate(['/home']);
        this.authService.sendToken(response.sessionId);
        saveToStorage('user', response.user);
        this.snackbar.open(`Welcome ${response.user.person.display}`, null, { duration: 4000 });
      } else {
        this.snackbar.open('Username & Password doesn\'t match', null, { duration: 4000 });
      }
    });
  }
}
