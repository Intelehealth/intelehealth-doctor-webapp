import { Component, OnInit } from "@angular/core";
import { FormGroup, FormControl, Validators } from "@angular/forms";
import { Router } from "@angular/router";
import { MatSnackBar } from "@angular/material/snack-bar";
import { AuthService } from "src/app/services/auth.service";
import { SessionService } from "src/app/services/session.service";
import { NgSelectConfig } from "@ng-select/ng-select";
declare var saveToStorage: any;

@Component({
  selector: "app-login-container",
  templateUrl: "./login-container.component.html",
  styleUrls: ["./login-container.component.scss"],
})
export class LoginContainerComponent implements OnInit {
  loginForm = new FormGroup({
    username: new FormControl("", [Validators.required]),
    password: new FormControl("", [Validators.required]),
    recaptcha: new FormControl("", [Validators.required]),
  });
  showOTPverifictaion: boolean = false;
  showLoginverifictaion: boolean = false;
  showLogin: boolean = true;
  onFUform: boolean = false;
  onFPform: boolean = false;
  selectedLanguage: any;
  languageList = [{ name: "English" }, { name: "Hindi" }];

  constructor(
    //private sessionService: SessionService,
    private router: Router,
    //private snackbar: MatSnackBar,
    private authService: AuthService,
    private ngSelect: NgSelectConfig
  ) {}
  ngOnInit() {
    const isLoggedIn: boolean = this.authService.isLoggedIn();
    if (isLoggedIn) {
      this.router.navigateByUrl("/home");
    }
    this.selectedLanguage = this.languageList[0];
  }
  onLoginSucess(isSucess: boolean) {
    this.showLoginverifictaion = isSucess;
    this.showLogin = !isSucess;
  }
  onVerificationSucess(isSucess: boolean) {
    this.showOTPverifictaion = isSucess;
    this.showLoginverifictaion = !isSucess;
    this.onFUform = !isSucess;
    this.onFPform = !isSucess;
  }

  onFUSucess(isSucess: boolean) {
    this.onFUform = isSucess;
    this.showLogin = !isSucess;
  }

  onFPSucess(isSucess: boolean) {
    this.onFPform = isSucess;
    this.showLogin = !isSucess;
  }
}
