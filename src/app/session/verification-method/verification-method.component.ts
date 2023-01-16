import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-verification-method',
  templateUrl: './verification-method.component.html',
  styleUrls: ['./verification-method.component.scss']
})
export class VerificationMethodComponent implements OnInit {

  active = 1;
  verificationForm: FormGroup;
  submitted: boolean = false;
  phoneIsValid: boolean = false;

  constructor() {
    this.verificationForm = new FormGroup({
      phone: new FormControl('', Validators.required),
      email: new FormControl(''),
      countryCode: new FormControl('91', Validators.required)
    });
  }

  ngOnInit(): void {
  }

  get f() { return this.verificationForm.controls; }

  reset() {
    if (this.active == 1 ) {
      this.verificationForm.get('phone').setValidators([Validators.required]);
      this.verificationForm.get('phone').updateValueAndValidity();
      this.verificationForm.get('email').clearValidators();
      this.verificationForm.get('email').updateValueAndValidity();

    } else {
      this.verificationForm.get('email').setValidators([Validators.required, Validators.email]);
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
    console.log(this.verificationForm.value);
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
    this.verificationForm.patchValue({
      countryCode: $event.dialCode
    });
  }

}
