import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from "@angular/forms";
import { Router } from "@angular/router";

@Component({
  selector: 'app-forgot-username',
  templateUrl: './forgot-username.component.html',
  styleUrls: ['./forgot-username.component.scss']
})
export class ForgotUsernameComponent implements OnInit {
  fieldTextType: boolean = false;
  ForgotUsernameForm = new FormGroup({
    mobileNumber: new FormControl("", [Validators.required]),
    emailId: new FormControl("", [Validators.required]),
  });

  constructor() { }

  ngOnInit(): void {
  }

  onSubmit() {}

  toggleFieldTextType() {
    this.fieldTextType = !this.fieldTextType;
  }
}
