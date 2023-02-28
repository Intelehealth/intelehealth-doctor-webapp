import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CalendarComponent } from './calendar.component';
import { SetupCalendarComponent } from './setup-calendar/setup-calendar.component';

const routes: Routes = [
  {
    path: '',
    redirectTo: '/calendar/setup-calendar',
    pathMatch: 'full'
  },
  {
    path: 'view-calendar',
    component: CalendarComponent
  },
  {
    path: 'setup-calendar',
    component: SetupCalendarComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class CalendarRoutingModule { }
