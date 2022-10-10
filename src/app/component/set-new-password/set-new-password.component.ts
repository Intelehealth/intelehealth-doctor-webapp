import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators, FormBuilder } from "@angular/forms";

@Component({
  selector: 'app-set-new-password',
  templateUrl: './set-new-password.component.html',
  styleUrls: ['./set-new-password.component.scss']
})
export class SetNewPasswordComponent implements OnInit {
  signupForm: FormGroup;
  passwordIsValid = false;
  showPassword: boolean = false;

  constructor(private fb: FormBuilder) {}
  onSubmit(){ }

  showHidePassword() {
    this.showPassword = !this.showPassword;
  }

  ngOnInit() {
    this.signupForm = this.fb.group({
      password: ['', Validators.required],
      confirmPassword: new FormControl("", [Validators.required])
    });
  }

  passwordValid(event) {
    this.passwordIsValid = event;
  }
  
}

