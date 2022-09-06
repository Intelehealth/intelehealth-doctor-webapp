import { Component, OnInit } from "@angular/core";
import { FormGroup, FormControl, Validators } from "@angular/forms";
import { Router } from "@angular/router";
import { MatSnackBar } from "@angular/material/snack-bar";
import { AuthService } from "src/app/services/auth.service";
import { SessionService } from "src/app/services/session.service";
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
  showLoginverifictaion: boolean = true;
  showLogin: boolean = false;

  constructor(
    //private sessionService: SessionService,
    private router: Router,
    //private snackbar: MatSnackBar,
    private authService: AuthService
  ) {}
  ngOnInit() {
    const isLoggedIn: boolean = this.authService.isLoggedIn();
    if (isLoggedIn) {
      this.router.navigateByUrl("/home");
    }
  }
  onLoginSucess(isSucess: boolean) {
    this.showLoginverifictaion = isSucess;
    this.showLogin = !isSucess;
  }
  onVerificationSucess(isSucess: boolean) {
    this.showOTPverifictaion = isSucess;
    this.showLoginverifictaion = !isSucess;
  }
}
