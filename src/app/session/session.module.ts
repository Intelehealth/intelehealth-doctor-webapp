import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { SessionRoutingModule } from './session-routing.module';
import { SessionComponent } from './session.component';
import { LoginComponent } from './login/login.component';
import { VerificationMethodComponent } from './verification-method/verification-method.component';
import { OtpVerificationComponent } from './otp-verification/otp-verification.component';
import { ForgotPasswordComponent } from './forgot-password/forgot-password.component';
import { SetupNewPasswordComponent } from './setup-new-password/setup-new-password.component';
import { ForgotUsernameComponent } from './forgot-username/forgot-username.component';
import { NgbCarouselModule, NgbNavModule } from '@ng-bootstrap/ng-bootstrap';
import { PageNotFoundComponent } from './page-not-found/page-not-found.component';
import { NgSelectModule } from '@ng-select/ng-select';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { NgxCaptchaModule } from 'ngx-captcha';
import { Ng2TelInputModule } from 'ng2-tel-input';
import { NgOtpInputModule } from  'ng-otp-input';
import { NgxPermissionsModule } from 'ngx-permissions';

@NgModule({
  declarations: [
    SessionComponent,
    LoginComponent,
    VerificationMethodComponent,
    OtpVerificationComponent,
    ForgotPasswordComponent,
    SetupNewPasswordComponent,
    ForgotUsernameComponent,
    PageNotFoundComponent
  ],
  imports: [
    CommonModule,
    SessionRoutingModule,
    NgbCarouselModule,
    NgSelectModule,
    FormsModule,
    MatIconModule,
    ReactiveFormsModule,
    NgxCaptchaModule,
    NgbNavModule,
    Ng2TelInputModule,
    NgOtpInputModule,
    NgxPermissionsModule.forChild()
  ]
})
export class SessionModule { }
