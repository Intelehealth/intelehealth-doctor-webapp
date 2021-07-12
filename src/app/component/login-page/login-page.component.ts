import { Component, OnInit } from "@angular/core";
import { FormGroup, FormControl, Validators } from "@angular/forms";
import { Router } from "@angular/router";
import { MatSnackBar } from "@angular/material/snack-bar";
import { AuthService } from "src/app/services/auth.service";
import { SessionService } from "src/app/services/session.service";
import { PushNotificationsService } from "src/app/services/push-notification.service";
import { MatDialog } from "@angular/material/dialog";
import { ChangePasswordComponent } from "../change-password/change-password.component";
import { TranslateService } from "@ngx-translate/core";
declare var saveToStorage: any;
@Component({
  selector: "app-login-page",
  templateUrl: "./login-page.component.html",
  styleUrls: ["./login-page.component.css"],
})
export class LoginPageComponent implements OnInit {
  loginForm = new FormGroup({
    username: new FormControl("", [Validators.required]),
    password: new FormControl("", [Validators.required]),
  });

  submitted = false;
  fieldTextType: boolean;
  constructor(
    private sessionService: SessionService,
    private router: Router,
    private snackbar: MatSnackBar,
    private authService: AuthService,
    private pushNotificationsService: PushNotificationsService,
    private dialog: MatDialog,
    private translate: TranslateService
  ) {}

  ngOnInit() {
    if(localStorage.getItem('selectedLanguage')) {
      this.translate.setDefaultLang(localStorage.getItem('selectedLanguage'));
    } else {
      let browserlang = this.translate.getBrowserLang();
      this.translate.setDefaultLang(browserlang);
      localStorage.setItem("selectedLanguage", browserlang);
    }
  }

  toggleFieldTextType() {
    this.fieldTextType = !this.fieldTextType;
  }

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
              this.authService.sendToken(response.user.sessionId);
              saveToStorage("user", response.user);

              this.pushNotificationsService
                .getUserSettings(response.user.uuid)
                .subscribe((response) => {
                  if (response["data"].isChange == 0) {
                    this.dialog.open(ChangePasswordComponent, {
                      width: "500px",
                      data: { isChange: false },
                    });
                  }
                });

              if (provider.results[0].attributes.length === 0) {
                this.router.navigate(["/myAccount"]);
              } else {
                this.router.navigate(["/home"]);
              }
              this.translate.get('messages.welcome').subscribe((res: string) => {
                this.snackbar.open(`${res} ${provider.results[0].person.display}`,null, {duration: 2000});
              });
              saveToStorage("doctorName", provider.results[0].person.display);
            },
            (error) => {
              this.router.navigate(["home"]);
            }
          );
        } else {
          this.translate.get('messages.loginError').subscribe((res: string) => {
          this.snackbar.open(res, null, {duration: 4000});
        });
        }
      });
    }
  }
}
