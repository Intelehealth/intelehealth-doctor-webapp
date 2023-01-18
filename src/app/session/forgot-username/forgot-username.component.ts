import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-forgot-username',
  templateUrl: './forgot-username.component.html',
  styleUrls: ['./forgot-username.component.scss']
})
export class ForgotUsernameComponent implements OnInit {

  active = 'phone';
  forgotUsernameForm: FormGroup;
  submitted: boolean = false;
  phoneIsValid: boolean = false;
  phoneNumber: string;

  constructor(private toastr: ToastrService, private router: Router) {
    this.forgotUsernameForm = new FormGroup({
      phone: new FormControl('', Validators.required),
      email: new FormControl(''),
      countryCode: new FormControl('91', Validators.required)
    });
  }

  ngOnInit(): void {
  }

  get f() { return this.forgotUsernameForm.controls; }

  reset() {
    if (this.active == 'phone' ) {
      this.forgotUsernameForm.get('phone').setValidators([Validators.required]);
      this.forgotUsernameForm.get('phone').updateValueAndValidity();
      this.forgotUsernameForm.get('email').clearValidators();
      this.forgotUsernameForm.get('email').updateValueAndValidity();

    } else {
      this.forgotUsernameForm.get('email').setValidators([Validators.required, Validators.email]);
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
    this.toastr.success(`OTP sent on ${this.active == 'phone' ? this.replaceWithStar(this.phoneNumber) : this.replaceWithStar(this.forgotUsernameForm.value.email) } successfully!`, "OTP Sent");
    this.router.navigate(['/session/verify-otp'], { state: { verificationFor: 'forgot-username', via: this.active, val: (this.active == 'phone') ? this.phoneNumber : this.forgotUsernameForm.value.email } });
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
  }

  onCountryChange($event: any) {
    this.forgotUsernameForm.patchValue({
      countryCode: $event.dialCode
    });
  }

}
