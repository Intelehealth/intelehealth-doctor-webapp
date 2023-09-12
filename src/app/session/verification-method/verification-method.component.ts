import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { AuthService } from 'src/app/services/auth.service';
import { Subscription } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';
import { getCacheData } from 'src/app/utils/utility-functions';
import { notifications } from 'src/config/constant';

@Component({
  selector: 'app-verification-method',
  templateUrl: './verification-method.component.html',
  styleUrls: ['./verification-method.component.scss']
})
export class VerificationMethodComponent implements OnInit, OnDestroy {

  active = 'phone';
  verificationForm: FormGroup;
  submitted: boolean = false;
  phoneIsValid: boolean = false;
  phoneNumber: string;
  telObject: any;
  maxTelLegth: number = 10;
  subscription: Subscription;

  constructor(private authService: AuthService, private router: Router,
    private toastr: ToastrService, private translate: TranslateService) {
    this.verificationForm = new FormGroup({
      phone: new FormControl('', [Validators.required]),
      email: new FormControl('', Validators.pattern("^[a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,4}$")),
      countryCode: new FormControl('91', Validators.required)
    });
  }

  ngOnInit(): void {
    this.subscription = this.verificationForm.get('phone').valueChanges.subscribe((val: any) => {
      if (val.length > this.maxTelLegth) {
        this.verificationForm.get('phone').setValue(val.substring(0, this.maxTelLegth));
      }
    });
  }

  get f() { return this.verificationForm.controls; }

  reset() {
    if (this.active == 'phone' ) {
      this.verificationForm.get('phone').setValidators([Validators.required]);
      this.verificationForm.get('phone').updateValueAndValidity();
      this.verificationForm.get('email').clearValidators();
      this.verificationForm.get('email').updateValueAndValidity();

    } else {
      this.verificationForm.get('email').setValidators([Validators.required, Validators.pattern("^[a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,4}$")]);
      this.verificationForm.get('email').updateValueAndValidity();
      this.verificationForm.get('phone').clearValidators();
      this.verificationForm.get('phone').updateValueAndValidity();
    }
    this.submitted = false;
    this.phoneIsValid = false;
    this.verificationForm.patchValue({
      phone: '',
      countryCode: '91',
      email: ''
    })
  }

  verify() {
    this.submitted = true;
    if (this.verificationForm.invalid) {
      return;
    }
    if (this.active == 'phone' && !this.phoneIsValid) {
      return;
    }

    let payload: any = {
      otpFor: "verification",
      username: (getCacheData(true,notifications.USER)).username ? (getCacheData(true,notifications.USER)).username : (getCacheData(true,notifications.USER)).systemId
    };
    if (this.active == 'phone') {
      payload.phoneNumber = this.verificationForm.value.phone,
      payload.countryCode = this.verificationForm.value.countryCode
    } else {
      payload.email = this.verificationForm.value.email
    }

    this.authService.requestOtp(payload).subscribe((res: any) => {
      if (res.success) {
        this.toastr.success(`${this.translate.instant("OTP sent on")} ${this.active == 'phone' ? this.replaceWithStar(this.phoneNumber)
         : this.replaceWithStar(this.verificationForm.value.email) } ${this.translate.instant("successfully")}!`, `${this.translate.instant("OTP Sent")}`);
        this.router.navigate(['/session/verify-otp'], { state: { verificationFor: 'login', via: this.active, val: (this.active == 'phone') ? `${this.verificationForm.value.countryCode}||${this.verificationForm.value.phone}` : this.verificationForm.value.email } });
      } else {
        this.toastr.error(this.translate.instant(res.message), "Error");
      }
    });
  }

  replaceWithStar(str: string) {
    let n = str?.length;
    return str.replace(str.substring(5, (this.active == 'phone') ? n-2 : n-4), "*****");
  }

  hasError($event: any) {
    this.phoneIsValid = $event;
  }

  getNumber($event: any) {
    console.log($event);
    this.phoneNumber = $event;
    this.phoneIsValid = true;
  }

  telInputObject($event: any) {
    // console.log($event);
    this.telObject = $event;
  }

  onCountryChange($event: any) {
    // console.log($event);
    this.telObject.setCountry($event.iso2);
    this.verificationForm.patchValue({
      countryCode: $event.dialCode
    });
    this.maxTelLegth = this.authService.getInternationalMaskByCountryCode($event.iso2.toUpperCase(), false).filter((o) => o != ' ').length;
  }

  ngOnDestroy(): void {
    this.subscription?.unsubscribe();
  }

}
