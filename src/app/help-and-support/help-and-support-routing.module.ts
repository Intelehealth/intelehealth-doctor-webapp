import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HelpAndSupportComponent } from './help-and-support.component';
import { TicketDetailComponent } from './tickets/ticket-detail/ticket-detail.component';

const routes: Routes = [
  {
    path: '',
    component: HelpAndSupportComponent,
  },
  {
    path: 'ticket/:id',
    component: TicketDetailComponent,
    data: {
      breadcrumb: ':id',
    }
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class HelpAndSupportRoutingModule { }