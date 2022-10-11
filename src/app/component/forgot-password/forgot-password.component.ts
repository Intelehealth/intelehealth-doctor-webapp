import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { FormGroup, FormControl, Validators } from "@angular/forms";
import { Router } from "@angular/router";

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

  constructor() {}
  ngOnInit() {
  }
  onSubmit() {
    this.onSucess.emit(true);
  }
}
