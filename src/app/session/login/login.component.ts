import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {

  siteKey: string = environment.siteKey;
  loginForm: FormGroup;
  submitted: boolean = false;
  visible: boolean = false;

  constructor() {
    this.loginForm = new FormGroup({
      username: new FormControl("", Validators.required),
      password: new FormControl("", Validators.required),
      recaptcha: new FormControl("", Validators.required)
    });
  }

  get f() { return this.loginForm.controls; }

  ngOnInit(): void {
  }

  login() {
    this.submitted = true;
    if (this.loginForm.invalid) {
      return;
    }

  }

  handleReset() {}

  handleExpire() {}

  handleLoad() {}

  handleSuccess(event: any) {
  }

}
