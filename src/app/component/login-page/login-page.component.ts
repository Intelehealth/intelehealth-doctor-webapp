import { Component, OnInit } from "@angular/core";
import { FormGroup, FormControl, Validators } from "@angular/forms";
import { Router } from "@angular/router";
import { MatSnackBar } from "@angular/material/snack-bar";
import { AuthService } from "src/app/services/auth.service";
import { SessionService } from "src/app/services/session.service";
import { VisitService } from "src/app/services/visit.service";
import { environment } from "src/environments/environment";
declare var saveToStorage: any,  getFromStorage: any;
@Component({
  selector: "app-login-page",
  templateUrl: "./login-page.component.html",
  styleUrls: ["./login-page.component.css"],
})
export class LoginPageComponent implements OnInit {
  submitted = false;
  loginForm = new FormGroup({
    username: new FormControl("", [
      Validators.required,
      Validators.maxLength(12),
    ]),
    password: new FormControl("", [
      Validators.required,
      Validators.minLength(8),
      Validators.maxLength(12),
    ]),
  });

  fieldTextType: boolean;
  version = environment.version + "(" + environment.versionCode+")";
  constructor(
    private sessionService: SessionService,
    private router: Router,
    private snackbar: MatSnackBar,
    private authService: AuthService,
    private service: VisitService
  ) {}

  ngOnInit() {
    this.service.clearVisits();
    const isLoggedIn: boolean = this.authService.isLoggedIn();
    if (isLoggedIn) {
      this.router.navigateByUrl("/home");
    }
  }

  toggleFieldTextType() {
    this.fieldTextType = !this.fieldTextType;
  }

  /**
   * Login form control
   */
  get controls() {
    return this.loginForm.controls;
  }

  /**
   * Take username and password from the login form
   * and create session and save base65 session to localStorage
   */
  onSubmit() {
    this.submitted = true;
    if (!this.loginForm.invalid) {
      const value = this.loginForm.value;
      const string = `${value.username}:${value.password}`;
      const base64 = btoa(string);
      saveToStorage("session", base64);
      this.sessionService.loginSession(base64).subscribe((response) => {
        if (response.authenticated === true) {
          this.sessionService.provider(response.user.uuid).subscribe(
            (provider) => {
              saveToStorage("provider", provider.results[0]);
              this.authService.sendToken(response.sessionId);
              saveToStorage("user", response.user);
              let isNurse = response.user.roles.find((r: any) => r.name == 'Organizational: Nurse');
              let isDoctor = response.user.roles.find((r: any) => r.name == 'Organizational: Doctor');
              if (isNurse) {
                if (isDoctor) {
                  if (provider.results[0].attributes.length === 0) {
                    this.router.navigate(["/myAccount"]);
                  } else {
                    this.router.navigate(["/home"]);
                  }
                  saveToStorage("providerType", 'Both');
                  saveToStorage("doctorName", provider.results[0].person.display);
                } else {
                  this.router.navigate(["/myAccount"]);
                  saveToStorage("providerType", 'Nurse');
                  saveToStorage("nurseName", provider.results[0].person.display);
                }
              } else {
                if (provider.results[0].attributes.length === 0) {
                  this.router.navigate(["/myAccount"]);
                } else {
                  this.router.navigate(["/home"]);
                }
                saveToStorage("providerType", 'Doctor');
                saveToStorage("doctorName", provider.results[0].person.display);
              }
              this.snackbar.open(`Welcome ${provider.results[0].person.display}`, null, {
                duration: 4000,
              });
            },
            (error) => {
              this.router.navigate(["home"]);
            }
          );

        } else {
          this.snackbar.open("Username & Password doesn't match", null, {
            duration: 4000,
          });
        }
      });
    }
  }
}
