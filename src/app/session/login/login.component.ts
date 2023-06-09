import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { NgxRolesService } from 'ngx-permissions';
import { ToastrService } from 'ngx-toastr';
import { AuthService } from 'src/app/services/auth.service';
import { environment } from 'src/environments/environment';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {

  siteKey: string = environment.siteKey;
  loginForm: FormGroup;
  submitted: boolean = false;
  visible: boolean = false;
  rememberMe: boolean = false;
  selectedLanguage:string = localStorage.getItem('selectedLanguage');

  constructor(
    public authService: AuthService,
    private toastr: ToastrService,
    private router: Router,
    private rolesService: NgxRolesService,
    private translateService: TranslateService,
    ) {

    this.loginForm = new FormGroup({
      username: new FormControl("", Validators.required),
      password: new FormControl("", Validators.required),
      recaptcha: new FormControl("", Validators.required)
    });

  }

  get f() { return this.loginForm.controls; }

  ngOnInit(): void {
    if(localStorage.getItem('selectedLanguage')) {
      this.translateService.setDefaultLang(localStorage.getItem('selectedLanguage'));
      this.translateService.use(localStorage.getItem('selectedLanguage'));
    } else {
      let browserlang = this.translateService.getBrowserLang();
      this.translateService.setDefaultLang(browserlang);
      localStorage.setItem("selectedLanguage", browserlang);
    }
    this.selectedLanguage = localStorage.getItem('selectedLanguage');
    // this.checkSession();
  }

  login() {
    this.submitted = true;
    if (this.loginForm.invalid) {
      return;
    }
    const val = this.loginForm.value;
    const cred = `${val.username}:${val.password}`;
    const base64cred = btoa(cred);
    this.authService.login(base64cred).subscribe((res: any) => {
      if (res.authenticated && !res.verified) {
        this.authService.getProvider(res.user.uuid).subscribe((provider: any) => {
          if (provider.results.length) {
            localStorage.setItem('provider', JSON.stringify(provider.results[0]));
            localStorage.setItem("doctorName", provider.results[0].person.display);
            // if (this.rememberMe) {
              this.loginSuccess();
            // } else if (provider.results[0].attributes.length) {
            //   this.router.navigate(['/session/verification']);
            // } else {
            //   this.loginSuccess();
            // }
          } else {
            this.toastr.error(this.translateService.instant(`messages.${"Couldn't find provider."}`), this.translateService.instant(`messages.${"Login Failed!"}`));
          }
        });
      }
      else {
        this.toastr.error(this.translateService.instant(`messages.${"Couldn't find you, credentials provided are wrong."}`), this.translateService.instant(`messages.${"Login Failed!"}`));
      }
    });
  }

  handleReset() { }

  handleExpire() { }

  handleLoad() { }

  handleSuccess(event: any) {
  }

  loginSuccess() {
    this.authService.updateVerificationStatus();
    this.toastr.success(this.translateService.instant(`messages.${"You have sucessfully logged in."}`), this.translateService.instant(`messages.${"Login Successful"}`));
    let role = this.rolesService.getRole('ORGANIZATIONAL: SYSTEM ADMINISTRATOR');
    if (role) {
      this.router.navigate(['/admin']);
    } else {
      this.router.navigate(['/dashboard']);
    }
  }

  checkSession() {
    this.authService.checkSession().subscribe({
      next: (res: any) => {
        this.rememberMe = res.rememberme;
        this.authService.rememberMe = this.rememberMe ? true : false;
      }
    });
  }
}
