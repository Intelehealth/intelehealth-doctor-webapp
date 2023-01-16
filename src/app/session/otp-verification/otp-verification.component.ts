import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Subscription, timer } from 'rxjs';

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

  constructor() {
    this.otpVerificationForm = new FormGroup({
      otp: new FormControl('', [Validators.required, Validators.minLength(6), Validators.maxLength(6)])
    });
  }

  ngOnInit(): void {
    this.countDown = timer(0, this.tick)
      .subscribe(() => {
        const minutes: number = Math.floor(this.counter / 60);
        this.resendIn = ('00' + minutes).slice(-2) + ':' + ('00' + Math.floor(this.counter - minutes * 60)).slice(-2);
        if(this.counter > 0) --this.counter;
      });
  }

  get fCtrl() { return this.otpVerificationForm.get('otp') }

  onOtpChange($event: any) {
    console.log($event);
  }

  verify() {
    this.submitted = true;
    if (this.otpVerificationForm.invalid) {
      return;
    }
    console.log(this.otpVerificationForm.value);
  }

  resendOtp() {
    this.counter = 60;
    this.resendIn = '01:00';
  }

  ngOnDestroy(): void {
    this.countDown?.unsubscribe();
  }

}
