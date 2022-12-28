import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators, FormBuilder } from "@angular/forms";
import { MustMatch } from './password.validator';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { MatSnackBar } from '@angular/material/snack-bar';
import { environment } from '../../../environments/environment';
import { SessionService } from 'src/app/services/session.service';
import { PushNotificationsService } from 'src/app/services/push-notification.service';
declare var getFromStorage: any;

@Component({
  selector: 'app-set-new-password',
  templateUrl: './set-new-password.component.html',
  styleUrls: ['./set-new-password.component.scss']
})
export class SetNewPasswordComponent implements OnInit {
  baseURL = environment.baseURL;
  setNewPasswordForm: FormGroup;
  userUuid: string;
  passwordIsValid = false;
  showPassword: boolean = false;
  userName: string;

  constructor(
    private formBuilder: FormBuilder,
    private http: HttpClient,
    private snackbar: MatSnackBar,
    private pushNotificationsService: PushNotificationsService,
  ) {
    this.setNewPasswordForm = this.formBuilder.group({
      newPassword: ['', Validators.required],
      confirmPassword: new FormControl("", [Validators.required])
    }, {
      validator: MustMatch('newPassword', 'confirmPassword')
    });
  }

  ngOnInit() {
    const user = getFromStorage("user");
    this.userName = user?.person?.display;
    this.userUuid = user.uuid;
  }

  onSubmit(){ 
    const value = this.setNewPasswordForm.value;
    const url = `${this.baseURL}/password`;
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type':  'application/json',
        'Authorization': 'Basic my-auth-token'
      })
    };

    const json = {
      'oldPassword': value.newPassword,
      'newPassword': value.confirmPassword
    };

    const json1 = {
      'userId': this.userUuid
    }
    this.http.post(url, json, httpOptions)
    .subscribe(response => {
      if (response == null) {
        this.pushNotificationsService.changePassword(json1).subscribe((response)=>{
          this.snackbar.open('Password changed successfully.', null, { duration: 4000 });
        })
      }
    }, error => {
      if (error.error.message.match('Old password is not correct.')) {
        this.snackbar.open('Old password is incorrect.', null, { duration: 4000 });
      }
    });
  }

  showHidePassword() {
    this.showPassword = !this.showPassword;
  }

  passwordValid(event) {
    this.passwordIsValid = event;
  }  
}

