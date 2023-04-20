import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DashboardGuard } from '../core/guards/dashboard.guard';
import { ChangePasswordComponent } from './change-password/change-password.component';
import { DashboardComponent } from './dashboard.component';
import { GetStartedComponent } from './get-started/get-started.component';
import { ProfileComponent } from './profile/profile.component';
import { VisitSummaryComponent } from './visit-summary/visit-summary.component';

const routes: Routes = [
  {
    path: '',
    canActivate: [DashboardGuard],
    component: DashboardComponent
  },
  {
    path: 'profile',
    data: {
      breadcrumb: 'Profile'
    },
    component: ProfileComponent
  },
  {
    path: 'get-started',
    data: {
      breadcrumb: 'Get-Started'
    },
    component: GetStartedComponent
  },
  {
    path: 'visit-summary/:id',
    data: {
      breadcrumb: 'Visit Summary'
    },
    component: VisitSummaryComponent
  },
  {
    path: 'change-password',
    data: {
      breadcrumb: 'Change Password'
    },
    component: ChangePasswordComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class DashboardRoutingModule { }
