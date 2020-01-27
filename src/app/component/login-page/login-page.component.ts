import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { EncounterService } from 'src/app/services/encounter.service';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material';
import { AuthService } from 'src/app/services/auth.service';

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
    private service: EncounterService,
    private router: Router,
    private snackbar: MatSnackBar,
    private authService: AuthService
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
    this.service.loginSession(base64).subscribe(response => {
      if (response.authenticated === true) {
        this.router.navigate(['/home']);
        this.authService.sendToken(response.sessionId);
        this.snackbar.open(`Welcome ${response.user.person.display}`, null, {
          duration: 4000
        });
      } else {
        this.snackbar.open('Username & Password doesn\'t match', null, {
          duration: 4000
        });
      }
    });
  }
}
