import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-forgot-password',
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.scss']
})
export class ForgotPasswordComponent implements OnInit {

  forgotPasswordForm: FormGroup;
  submitted: boolean = false;

  constructor(private toastr: ToastrService, private router: Router) {
    this.forgotPasswordForm = new FormGroup({
      username: new FormControl('', Validators.required)
    });
  }

  ngOnInit(): void {
  }

  get f() { return this.forgotPasswordForm.controls; }

  forgotPassword() {
    this.submitted = true;
    if (this.forgotPasswordForm.invalid) {
      return;
    }
    this.toastr.success(`OTP sent on your mobile number and email successfully!`, "OTP Sent");
    this.router.navigate(['/session/verify-otp'], { state: { verificationFor: 'forgot-password', via: 'username', val: this.forgotPasswordForm.value.username } });
  }

}
