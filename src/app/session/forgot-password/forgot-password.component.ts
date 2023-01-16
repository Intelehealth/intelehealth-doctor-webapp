import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-forgot-password',
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.scss']
})
export class ForgotPasswordComponent implements OnInit {

  forgotPasswordForm: FormGroup;
  submitted: boolean = false;

  constructor() {
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
  }

}
