import { Component, OnInit } from "@angular/core";
import { FormGroup, FormControl, Validators } from "@angular/forms";
import { Router } from "@angular/router";
import { AuthService } from "src/app/services/auth.service";
import { HelperService } from "src/app/services/helper.service";

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
  showOTPVerifictaion: boolean = false;
  showLoginVerifictaion: boolean = false;
  showLogin: boolean = true;
  onFUform: boolean = false;
  onFPform: boolean = false;
  selectedLanguage: any;
  languageList = [{ name: "English" }, { name: "Hindi" }];

  constructor(private router: Router, private authService: AuthService, private helperService: HelperService) {}
  ngOnInit() {
    const isLoggedIn: boolean = this.authService.isLoggedIn();
    if (isLoggedIn) {
      let user = JSON.parse(localStorage.getItem('user'));
      if (this.helperService.checkIfRoleExists('Organizational: System Administrator', (user) ? user.roles : [])) {
        this.router.navigate(["/admin"]);
      } else {
        this.router.navigate(["/dashboard"]);
      }
    }
    this.selectedLanguage = this.languageList[0];
  }
}
