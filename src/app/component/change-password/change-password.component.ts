import { Component, OnInit } from '@angular/core';
import { FormGroup, Validators, FormBuilder } from '@angular/forms';
import { MustMatch } from './password.validator';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { environment } from '../../../environments/environment';
import { SessionService } from 'src/app/services/session.service';
import { PushNotificationsService } from 'src/app/services/push-notification.service';
declare var getFromStorage: any
@Component({
  selector: 'app-change-password',
  templateUrl: './change-password.component.html',
  styleUrls: ['./change-password.component.css']
})
export class ChangePasswordComponent implements OnInit {
  baseURL = environment.baseURL;
  changePasswordForm: FormGroup;
  userUuid: string;
  constructor(
              private sessionService: SessionService,
              private formBuilder: FormBuilder,
              private http: HttpClient,
              private snackbar: MatSnackBar,
              private dialogRef: MatDialogRef<ChangePasswordComponent>,
              private pushNotificationsService: PushNotificationsService,    
              ) {
    this.changePasswordForm = this.formBuilder.group({
      currentPassword: ['', Validators.required],
      newPassword: ['', Validators.required],
      repeatPassword: ['', Validators.required]
    }, {
        validator: MustMatch('newPassword', 'repeatPassword')
      });
  }


  ngOnInit() {
    const userDetails = getFromStorage('user');
    this.userUuid = userDetails.uuid;
  }

  onSubmit() {
    const value = this.changePasswordForm.value;
    const url = `${this.baseURL}/password`;
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type':  'application/json',
        'Authorization': 'Basic my-auth-token'
      })
    };
    
    
    const json = {
      'oldPassword': value.currentPassword,
      'newPassword': value.newPassword
    };

    const json1 = {
      'userId': this.userUuid
    }
    this.http.post(url, json, httpOptions)
      .subscribe(response => {
        if (response == null) {
          this.pushNotificationsService.changePassword(json1).subscribe((response)=>{
            this.snackbar.open('Password changed successfully.', null, { duration: 4000 });
            this.dialogRef.close();
          })
        }
      }, error => {
        if (error.error.message.match('Old password is not correct.')) {
          this.snackbar.open('Old password is incorrect.', null, { duration: 4000 });
        }
      });
  }

  onClose() {
    this.dialogRef.close();
  }

}
