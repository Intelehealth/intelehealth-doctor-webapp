import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-forgot-username',
  templateUrl: './forgot-username.component.html',
  styleUrls: ['./forgot-username.component.scss']
})
export class ForgotUsernameComponent implements OnInit {

  active = 1;
  forgotUsernameForm: FormGroup;
  submitted: boolean = false;
  phoneIsValid: boolean = false;

  constructor() {
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
    if (this.active == 1 ) {
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
    console.log(this.forgotUsernameForm.value);
  }

  hasError($event: any) {
    this.phoneIsValid = $event;
  }

  getNumber($event: any) {
    console.log($event);
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
