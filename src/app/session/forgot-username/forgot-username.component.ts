import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { Subscription } from 'rxjs';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-forgot-username',
  templateUrl: './forgot-username.component.html',
  styleUrls: ['./forgot-username.component.scss']
})
export class ForgotUsernameComponent implements OnInit, OnDestroy {

  active = 'phone';
  forgotUsernameForm: FormGroup;
  submitted: boolean = false;
  phoneIsValid: boolean = false;
  phoneNumber: string;
  telObject: any;
  maxTelLegth: number = 10;
  subscription: Subscription;

  constructor(private toastr: ToastrService, private router: Router, private authService: AuthService) {
    this.forgotUsernameForm = new FormGroup({
      phone: new FormControl('', [Validators.required]),
      email: new FormControl('',Validators.pattern("^[a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,4}$")),
      countryCode: new FormControl('91', Validators.required)
    });
  }

  ngOnInit(): void {
    this.subscription = this.forgotUsernameForm.get('phone').valueChanges.subscribe((val: any) => {
      if (val.length > this.maxTelLegth) {
        this.forgotUsernameForm.get('phone').setValue(val.substring(0, this.maxTelLegth));
      }
    });
  }

  get f() { return this.forgotUsernameForm.controls; }

  reset() {
    if (this.active == 'phone' ) {
      this.forgotUsernameForm.get('phone').setValidators([Validators.required]);
      this.forgotUsernameForm.get('phone').updateValueAndValidity();
      this.forgotUsernameForm.get('email').clearValidators();
      this.forgotUsernameForm.get('email').updateValueAndValidity();

    } else {
      this.forgotUsernameForm.get('email').setValidators([Validators.required, Validators.pattern("^[a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,4}$")]);
      this.forgotUsernameForm.get('email').updateValueAndValidity();
      this.forgotUsernameForm.get('phone').clearValidators();
      this.forgotUsernameForm.get('phone').updateValueAndValidity();
    }
    this.submitted = false;
    this.phoneIsValid = false;
    this.forgotUsernameForm.patchValue({
      phone: '',
      countryCode: '91',
      email: ''
    })
  }

  forgotUsername() {
    this.submitted = true;
    if (this.forgotUsernameForm.invalid) {
      return;
    }
    if (this.active == 'phone' && !this.phoneIsValid) {
      return;
    }

    let payload: any = {
      otpFor: "username"
    };
    if (this.active == 'phone') {
      payload.phoneNumber = this.forgotUsernameForm.value.phone,
      payload.countryCode = this.forgotUsernameForm.value.countryCode
    } else {
      payload.email = this.forgotUsernameForm.value.email
    }

    this.authService.requestOtp(payload).subscribe((res: any) => {
      if (res.success) {
        this.toastr.success(`OTP sent on ${this.active == 'phone' ? this.replaceWithStar(this.phoneNumber) : this.replaceWithStar(this.forgotUsernameForm.value.email) } successfully!`, "OTP Sent");
        this.router.navigate(['/session/verify-otp'], { state: { verificationFor: 'forgot-username', via: this.active, val: (this.active == 'phone') ? `${this.forgotUsernameForm.value.countryCode}||${this.forgotUsernameForm.value.phone}` : this.forgotUsernameForm.value.email } });
      } else {
        this.toastr.error(res.message, "Error");
      }
    });
  }

  replaceWithStar(str: string) {
    let n = str.length;
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
    this.forgotUsernameForm.patchValue({
      countryCode: $event.dialCode
    });
    this.maxTelLegth = this.authService.getInternationalMaskByCountryCode($event.iso2.toUpperCase(), false).filter((o) => o != ' ').length;
  }

  ngOnDestroy(): void {
    this.subscription?.unsubscribe();
  }

}