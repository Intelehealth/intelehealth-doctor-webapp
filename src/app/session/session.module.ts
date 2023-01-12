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


@NgModule({
  declarations: [
    SessionComponent,
    LoginComponent,
    VerificationMethodComponent,
    OtpVerificationComponent,
    ForgotPasswordComponent,
    SetupNewPasswordComponent,
    ForgotUsernameComponent
  ],
  imports: [
    CommonModule,
    SessionRoutingModule
  ]
})
export class SessionModule { }
