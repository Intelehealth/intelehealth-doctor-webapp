import { Component, OnInit } from '@angular/core';
import { PageTitleService } from 'src/app/core/page-title/page-title.service';
import { MAT_DATE_FORMATS, NativeDateAdapter, DateAdapter } from '@angular/material/core';
import { formatDate } from '@angular/common';
import * as moment from 'moment';

export const PICK_FORMATS = {
  parse: {dateInput: {month: 'short', year: 'numeric', day: 'numeric'}},
  display: {
      dateInput: 'input',
      monthYearLabel: {year: 'numeric', month: 'short'},
      dateA11yLabel: {year: 'numeric', month: 'long', day: 'numeric'},
      monthYearA11yLabel: {year: 'numeric', month: 'long'}
  }
};

class PickDateAdapter extends NativeDateAdapter {
  format(date: Date, displayFormat: Object): string {
      if (displayFormat === 'input') {
          return formatDate(date,'dd MMMM, yyyy',this.locale);;
      } else {
          return date.toDateString();
      }
  }
}

@Component({
  selector: 'app-setup-calendar',
  templateUrl: './setup-calendar.component.html',
  styleUrls: ['./setup-calendar.component.scss'],
  providers: [
    { provide: DateAdapter, useClass: PickDateAdapter },
    { provide: MAT_DATE_FORMATS, useValue: PICK_FORMATS }
  ]
})
export class SetupCalendarComponent implements OnInit {

  days: any = [
    {
      id: 1,
      name: 'Monday',
      shortName: 'Mon'
    },
    {
      id: 2,
      name: 'Tuesday',
      shortName: 'Tue'
    },
    {
      id: 3,
      name: 'Wednesday',
      shortName: 'Wed'
    },
    {
      id: 4,
      name: 'Thursday',
      shortName: 'Thu'
    },
    {
      id: 5,
      name: 'Friday',
      shortName: 'Fri'
    },
    {
      id: 6,
      name: 'Saturday',
      shortName: 'Sat'
    },
    {
      id: 7,
      name: 'Sunday',
      shortName: 'Sun'
    },
    {
      id: 8,
      name: 'Weekdays',
      shortName: 'Weekdays'
    },
    {
      id: 1,
      name: 'Weekends',
      shortName: 'Weekends'
    }
  ];
  timeList: any = [
    { id: 1, name: "09:00" },
    { id: 2, name: "10:00" },
    { id: 3, name: "11:00" },
    { id: 4, name: "12:00" },
    { id: 5, name: "01:00" },
    { id: 6, name: "02:00" },
    { id: 7, name: "03:00" },
    { id: 8, name: "04:00" },
    { id: 9, name: "05:00" },
    { id: 10, name: "06:00" },
    { id: 11, name: "07:00" },
    { id: 12, name: "08:00" }
  ];
  clockTimeAmPM: any = [
    { id: 1, name: "AM" },
    { id: 2, name: "PM" }
  ];

  minDate: any;
  maxDate: any;

  constructor(private pageTitleService: PageTitleService) {
    this.minDate = new Date();
    this.maxDate = moment().endOf('month').toISOString();
  }

  ngOnInit(): void {
    this.pageTitleService.setTitle({ title: 'Calendar', imgUrl: 'assets/svgs/menu-calendar-circle.svg' })
  }

}
