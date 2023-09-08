import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { NgxRolesService } from 'ngx-permissions';
import { ToastrService } from 'ngx-toastr';
import { Subscription, timer } from 'rxjs';
import { AuthService } from 'src/app/services/auth.service';
import { LinkService } from 'src/app/services/link.service';
import { TranslationService } from 'src/app/services/translation.service';
import { getCacheData } from 'src/app/utils/utility-functions';

@Component({
  selector: 'app-otp-verification',
  templateUrl: './otp-verification.component.html',
  styleUrls: ['./otp-verification.component.scss']
})
export class OtpVerificationComponent implements OnInit, OnDestroy {

  otpVerificationForm: FormGroup;
  submitted: boolean = false;
  countDown: Subscription;
  counter = 60;
  tick = 1000;
  resendIn: string = '01:00';
  verificationFor: string;
  via: string;
  cred: string;
  userUuid: string;
  hash: string;
  visitId: string;

  constructor(
    private toastr: ToastrService,
    private router: Router,
    private route: ActivatedRoute,
    private authService: AuthService,
    private linkSvc: LinkService,
    private rolesService: NgxRolesService,
    public translationService: TranslationService,
    private translate: TranslateService) {
    this.otpVerificationForm = new FormGroup({
      otp: new FormControl('', [Validators.required, Validators.minLength(6), Validators.maxLength(6)])
    });
  }

  ngOnInit(): void {
    this.countDown = timer(0, this.tick)
      .subscribe(() => {
        const minutes: number = Math.floor(this.counter / 60);
        this.resendIn = ('00' + minutes).slice(-2) + ':' + ('00' + Math.floor(this.counter - minutes * 60)).slice(-2);
        if (this.counter > 0) --this.counter;
      });

    const { verificationFor, via, val, id, visitId } = window.history.state;
    this.verificationFor = verificationFor;
    this.via = via;
    this.cred = val;
    this.userUuid = id;
    this.visitId = visitId;
    if (!verificationFor && !via && !val) {
      this.router.navigate(['/session/login']);
    }
    this.hash = this.route.snapshot.queryParamMap.get("hash");
  }

  get fCtrl() { return this.otpVerificationForm.get('otp') }

  onOtpChange($event: any) {
  }

  verify() {
    this.submitted = true;
    if (this.otpVerificationForm.invalid) {
      return;
    }

    switch (this.verificationFor) {
      case 'login':
        this.verifyLogin();
        break;

      case 'forgot-username':
        this.verifyForgetUsername();
        break;

      case 'forgot-password':
        this.verifyForgetPassword();
        break;

      case 'presctiption-verification':
        this.verifyPrescription();
        break;

      default:
        break;
    }
  }

  verifyLogin() {
    let payload: any = {};
    payload.verifyFor = "verification";
    payload.username = (getCacheData(true,'user')).username ? (getCacheData(true,'user')).username : (getCacheData(true,'user')).systemId;
    if (this.via == 'phone') {
      payload.phoneNumber = this.cred.split('||')[1]
    } else {
      payload.email = this.cred
    }
    payload.otp = this.otpVerificationForm.value.otp;
    this.authService.verifyOtp(payload).subscribe((res: any) => {
      if (res.success) {
        this.authService.updateVerificationStatus();
        this.translationService.getTranslation("You have sucessfully logged in.", "Login Successful",true);
        let role = this.rolesService.getRole('ORGANIZATIONAL: SYSTEM ADMINISTRATOR');
        let isNurse = this.rolesService.getRole('ORGANIZATIONAL: NURSE');
        if (this.authService.rememberMe) {
          this.authService.setRememberMe().subscribe();
        }
        if (role) {
          this.router.navigate(['/admin']);
        } else {
          if (isNurse) {
            this.router.navigate(['/dashboard/hw-profile']);
          } else {
            this.router.navigate(['/dashboard']);
          }
        }
      } else {
        this.translationService.getTranslation(res.message, "Error",false);
      }
    });
  }

  verifyForgetUsername() {
    let payload: any = {}
    payload.verifyFor = "username";
    if (this.via == 'phone') {
      payload.phoneNumber = this.cred.split('||')[1]
    } else {
      payload.email = this.cred
    }
    payload.otp = this.otpVerificationForm.value.otp;
    this.authService.verifyOtp(payload).subscribe((res: any) => {
      if (res.success) {
        this.translationService.getTranslation("Username has been successfully sent on your email and mobile number", "Username Sent",true);
        this.router.navigate(['/session/login']);
      } else {
        this.translationService.getTranslation(res.message, "Error",false);
      }
    });
  }

  verifyForgetPassword() {
    let payload: any = {}
    payload.verifyFor = "password";
    payload.username = this.cred;
    payload.otp = this.otpVerificationForm.value.otp;
    this.authService.verifyOtp(payload).subscribe((res: any) => {
      if (res.success) {
        this.router.navigate(['/session/setup-password'], { state: { username: this.cred, id: this.userUuid } });
      } else {
        this.translationService.getTranslation(res.message, "Error",false);
      }
    });
  }

  verifyPrescription() {
    this.linkSvc.verifyPresctionOtp(this.hash, this.otpVerificationForm.value.otp).subscribe((res: any) => {
      if (res.success) {
        this.router.navigate(['/i', this.hash], { state: { visitId: this.visitId, accessToken: btoa(this.otpVerificationForm.value.otp) } });
      } else {
        this.translationService.getTranslation(res.message, "Error",false);
      }
    });
  }

  resendOtp() {
    this.counter = 60;
    this.resendIn = '01:00';
    let payload: any = {};
    switch (this.verificationFor) {
      case 'login':
        payload.otpFor = "verification";
        payload.username = (getCacheData(true,'user')).username;
        if (this.via == 'phone') {
          payload.phoneNumber = this.cred.split('||')[1],
            payload.countryCode = this.cred.split('||')[0]
        } else {
          payload.email = this.cred
        }
        this.authService.requestOtp(payload).subscribe((res: any) => {
          if (res.success) {
            this.toastr.success(`${this.translate.instant("OTP sent on")} ${this.via == 'phone' ?
             this.replaceWithStar(`+${this.cred.split('||')[0]}${this.cred.split('||')[1]}`) :
             this.replaceWithStar(this.cred)} ${this.translate.instant("successfully")}!`, `${this.translate.instant("OTP Sent")}`);
          } else {
            this.translationService.getTranslation(res.message, "Error",false);
          }
        });
        break;

      case 'forgot-username':
        payload.otpFor = "username";
        if (this.via == 'phone') {
          payload.phoneNumber = this.cred.split('||')[1],
            payload.countryCode = this.cred.split('||')[0]
        } else {
          payload.email = this.cred
        }
        this.authService.requestOtp(payload).subscribe((res: any) => {
          if (res.success) {
            this.toastr.success(`${this.translate.instant("OTP sent on")} ${this.via == 'phone' ?
             this.replaceWithStar(`+${this.cred.split('||')[0]}${this.cred.split('||')[1]}`) :
             this.replaceWithStar(this.cred)} ${this.translate.instant("successfully")}!`, `${this.translate.instant("OTP Sent")}`);
          } else {
            this.translationService.getTranslation(res.message, "Error",false);
          }
        });
        break;

      case 'forgot-password':
        payload = {
          otpFor: "password",
          username: this.cred
        };
        this.authService.requestOtp(payload).subscribe((res: any) => {
          if (res.success) {
            this.translationService.getTranslation(`OTP sent on your mobile number/email successfully!`, "OTP Sent",true);
          } else {
            this.translationService.getTranslation(res.message, "Error", false);
          }
        });
        break;

      case 'presctiption-verification':
        this.router.navigate(['/i', this.hash]);
        break;

      default:
        break;
    }
  }

  replaceWithStar(str: string) {
    let n = str.length;
    return str.replace(str.substring(5, (this.via == 'phone') ? n - 2 : n - 4), "*****");
  }

  ngOnDestroy(): void {
    this.countDown?.unsubscribe();
  }

}
