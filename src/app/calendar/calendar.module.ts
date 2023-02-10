import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { CalendarRoutingModule } from './calendar-routing.module';
import { CalendarComponent } from './calendar.component';
import { SetupCalendarComponent } from './setup-calendar/setup-calendar.component';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { NgSelectModule } from '@ng-select/ng-select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';


@NgModule({
  declarations: [
    CalendarComponent,
    SetupCalendarComponent
  ],
  imports: [
    CommonModule,
    CalendarRoutingModule,
    MatIconModule,
    MatButtonModule,
    NgSelectModule,
    MatDatepickerModule,
    FormsModule,
    ReactiveFormsModule
  ]
})
export class CalendarModule { }
