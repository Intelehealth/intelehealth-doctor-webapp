import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ForgotPasswordComponent } from './forgot-password/forgot-password.component';
import { ForgotUsernameComponent } from './forgot-username/forgot-username.component';
import { LoginComponent } from './login/login.component';
import { OtpVerificationComponent } from './otp-verification/otp-verification.component';
import { SessionComponent } from './session.component';
import { SetupNewPasswordComponent } from './setup-new-password/setup-new-password.component';
import { VerificationMethodComponent } from './verification-method/verification-method.component';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full'
  },
  {
    path: '',
    component: SessionComponent,
    children: [
      {
        path: 'login',
        component: LoginComponent
      },
      {
        path: 'verfification',
        component: VerificationMethodComponent
      },
      {
        path: 'verify-otp',
        component: OtpVerificationComponent
      },
      {
        path: 'forgot-password',
        component: ForgotPasswordComponent
      },
      {
        path: 'forgot-username',
        component: ForgotUsernameComponent
      },
      {
        path: 'setup-password',
        component: SetupNewPasswordComponent
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class SessionRoutingModule { }
