import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from '../auth.guard';
import { CalendarContainerComponent } from '../component/calendar-container/calendar-container.component';
import { ViewCalendarComponent } from '../component/calendar-v4/view-calendar/view-calendar.component';
import { SetupCalendarV4Component } from '../setup-calendar-v4/setup-calendar-v4.component';
import { CalendarComponent } from './calendar.component';

const routes: Routes = [
  // {
  //   path: '',
  //   component: CalendarComponent
  // }
  {
    path: "",
    component: CalendarContainerComponent,
    canActivate: [AuthGuard],
  },
  {
    path: "view-calendar",
    component: ViewCalendarComponent,
    canActivate: [AuthGuard],
  },
  {
    path: "setup-calendar",
    component: SetupCalendarV4Component,
    canActivate: [AuthGuard],
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class CalendarRoutingModule { }
