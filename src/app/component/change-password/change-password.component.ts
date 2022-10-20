import { Component, OnInit } from '@angular/core';
import { FormGroup, Validators, FormBuilder } from '@angular/forms';
import { MustMatch } from './password.validator';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { MatDialogRef } from '@angular/material/dialog';
import { environment } from '../../../environments/environment';
import { PushNotificationsService } from 'src/app/services/push-notification.service';
import { TranslationService } from 'src/app/services/translation.service';
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
              private formBuilder: FormBuilder,
              private http: HttpClient,
              private dialogRef: MatDialogRef<ChangePasswordComponent>,
              private pushNotificationsService: PushNotificationsService,
              private translationService: TranslationService
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
          this.translationService.getTranslation('Password changed successfully.');
          this.dialogRef.close();
          this.pushNotificationsService.changePassword(json1).subscribe((response)=>{
          })
        }
      }, error => {
        if (error.error.message.match('Old password is not correct.')) {
          this.translationService.getTranslation('Old password is incorrect.');
        }
      });
  }

  onClose() {
    this.dialogRef.close();
  }

}
