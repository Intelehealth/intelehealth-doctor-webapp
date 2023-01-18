import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-verification-method',
  templateUrl: './verification-method.component.html',
  styleUrls: ['./verification-method.component.scss']
})
export class VerificationMethodComponent implements OnInit {

  active = 'phone';
  verificationForm: FormGroup;
  submitted: boolean = false;
  phoneIsValid: boolean = false;
  phoneNumber: string;

  constructor(private authService: AuthService, private router: Router, private toastr: ToastrService) {
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
    if (this.active == 'phone' ) {
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
    this.toastr.success(`OTP sent on ${this.active == 'phone' ? this.replaceWithStar(this.phoneNumber) : this.replaceWithStar(this.verificationForm.value.email) } successfully!`, "OTP Sent");
    this.router.navigate(['/session/verify-otp'], { state: { verificationFor: 'login', via: this.active, val: (this.active == 'phone') ? this.phoneNumber : this.verificationForm.value.email } });
  }

  replaceWithStar(str: string) {
    let n = str.length;
    return str.replace(str.substring(5, (this.active == 'phone') ? n-2 : n-4), "*****");
  }

  hasError($event: any) {
    this.phoneIsValid = $event;
  }

  getNumber($event: any) {
    this.phoneNumber = $event;
    this.phoneIsValid = true;
  }

  telInputObject($event: any) {
    // console.log($event);
  }

  onCountryChange($event: any) {
    console.log($event);
    this.verificationForm.patchValue({
      countryCode: $event.dialCode
    });
  }

}
