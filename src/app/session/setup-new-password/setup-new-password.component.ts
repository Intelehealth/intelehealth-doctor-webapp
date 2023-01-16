import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-setup-new-password',
  templateUrl: './setup-new-password.component.html',
  styleUrls: ['./setup-new-password.component.scss']
})
export class SetupNewPasswordComponent implements OnInit {

  resetPasswordForm: FormGroup;
  submitted: boolean = false;
  visible1: boolean = false;
  visible2: boolean = false;

  constructor() {
    this.resetPasswordForm = new FormGroup({
      password: new FormControl('', [Validators.required]),
      confirmPassword: new FormControl('', [Validators.required]),
    });
  }

  ngOnInit(): void {
  }

  get f() { return this.resetPasswordForm.controls; }

  resetPassword() {
    this.submitted = true;
    if (this.resetPasswordForm.invalid) {
      return;
    }
    console.log(this.resetPasswordForm.value);
  }

}
