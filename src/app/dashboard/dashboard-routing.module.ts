import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DashboardGuard } from '../core/guards/dashboard.guard';
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
    component: ProfileComponent
  },
  {
    path: 'get-started',
    component: GetStartedComponent
  },
  {
    path: 'visit-summary/:id',
    component: VisitSummaryComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class DashboardRoutingModule { }
