import { Component, OnInit } from '@angular/core';
import { FormGroup, Validators, FormBuilder } from '@angular/forms';
import { MustMatch } from './password.validator';
import { HttpClient } from '@angular/common/http';
import { MatDialogRef } from '@angular/material';
import { environment } from '../../../environments/environment';


@Component({
  selector: 'app-change-password',
  templateUrl: './change-password.component.html',
  styleUrls: ['./change-password.component.css']
})

export class ChangePasswordComponent implements OnInit {
  baseURL = environment.baseURL;
  message: string;
  changePasswordForm: FormGroup;

  constructor(private formBuilder: FormBuilder,
              private http: HttpClient,
              private dialogRef: MatDialogRef<ChangePasswordComponent>) {
    this.changePasswordForm = this.formBuilder.group({
      currentPassword: ['', Validators.required],
      newPassword: ['', Validators.required],
      repeatPassword: ['', Validators.required]
    }, {
        validator: MustMatch('newPassword', 'repeatPassword')
      });
  }

  ngOnInit() {}

  onSubmit() {
    const value = this.changePasswordForm.value;
    const url = `${this.baseURL}/password`;
    const json = {
      'oldPassword': value.currentPassword,
      'newPassword': value.newPassword
    };
    this.http.post(url, json)
      .subscribe(response => {
        if (response == null) {
          this.message = 'Success';
        }
      }, error => {
        if (error.error.message.match('Old password is not correct.')) {
          this.message = error.error.message;
        }
      });
    this.changePasswordForm.reset();
  }

  onClose() {
    this.dialogRef.close();
  }

}
