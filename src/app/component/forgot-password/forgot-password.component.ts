import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { FormGroup, FormControl, Validators } from "@angular/forms";
import { Router } from "@angular/router";
import { OtpService } from "src/app/services/otp.service";

@Component({
  selector: 'app-forgot-password',
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.scss']
})
export class ForgotPasswordComponent implements OnInit {
  @Output() onSucess = new EventEmitter<boolean>();

  forgotpasswordForm = new FormGroup({
    username: new FormControl("", [Validators.required]),
  });

  constructor(     
    private router: Router,
    private otpservice: OtpService,
  ) {}
  ngOnInit() {
  }
  onSubmit() {
    this.onSucess.emit(true);
    this.router.navigateByUrl("/login/otp-verification");
    const username = this.forgotpasswordForm.value.username
    localStorage.setItem('session',username);
        
    // this.otpservice
    //   .getOTP("sign-in-button", this.drPhoneNumber)
    //   .subscribe((confimationResult) => {
    //     localStorage.setItem(
    //       "verificationId",
    //       JSON.stringify(confimationResult.verificationId)
    //     );
    //     localStorage.setItem("mobilenumber", this.drPhoneNumber);
    //     this.onSucess.emit(true);
    //     this.router.navigateByUrl("/login/otp-verification");
    //   });
  }
}
