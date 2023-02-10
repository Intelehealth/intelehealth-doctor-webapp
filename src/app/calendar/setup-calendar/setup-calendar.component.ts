import { Component, OnInit } from '@angular/core';
import { PageTitleService } from 'src/app/core/page-title/page-title.service';
import { MAT_DATE_FORMATS, NativeDateAdapter, DateAdapter } from '@angular/material/core';
import { formatDate } from '@angular/common';
import * as moment from 'moment';
import { AppointmentService } from 'src/app/services/appointment.service';
import { FormArray, FormControl, FormGroup, Validators } from '@angular/forms';

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
          return formatDate(date,'dd MMM, yyyy',this.locale);
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
  monthNames: string[] = ["January", "February", "March", "April", "May", "June","July", "August", "September", "October", "November", "December"];

  minDate: any;
  maxDate: any;
  scheduledMonths: any = [];
  selectedMonth: any;
  selectedMonthSchedule: any;
  addSlotsForm: FormGroup;
  _addMoreTiming: boolean = false;

  constructor(private appointmentService: AppointmentService, private pageTitleService: PageTitleService) {
    this.minDate = new Date();
    this.maxDate = moment().endOf('month').toISOString();

    this.addSlotsForm = new FormGroup({
      startDate: new FormControl(null, Validators.required),
      endDate: new FormControl(null, Validators.required),
      timings: new FormArray([
        new FormGroup({
          id: new FormControl(null),
          startTime: new FormControl(null, Validators.required),
          startMeridiem: new FormControl(null, Validators.required),
          endTime: new FormControl(null, Validators.required),
          endMeridiem: new FormControl(null, Validators.required),
          days: new FormControl(null, Validators.required)
        })
      ])
    });

  }

  ngOnInit(): void {
    this.pageTitleService.setTitle({ title: 'Calendar', imgUrl: 'assets/svgs/menu-calendar-circle.svg' });
    this.getScheduledMonths();
  }

  getScheduledMonths() {
    this.appointmentService.getScheduledMonths(this.userId, new Date().getFullYear())
      .subscribe({
        next: (res: any) => {
          this.scheduledMonths = res.data;
          if (this.scheduledMonths.length === 0) {
            this.scheduledMonths.push({ name: this.monthNames[new Date().getMonth()], year: new Date().getFullYear() });
          }
          this.getSchedule(this.scheduledMonths[0].year, this.scheduledMonths[0].name);
          this.selectedMonth = { name: this.scheduledMonths[0].name, year: this.scheduledMonths[0].year }
        }
      });
  }

  getSchedule(year = moment(this.minDate).format("YYYY"), month = moment(this.minDate).format("MMMM")) {
    this.appointmentService.getUserAppoitment(this.userId, year, month)
      .subscribe({
        next: (res: any) => {
          if (res && res.data) {
            this.selectedMonthSchedule = res.data;
            this.setData(res.data);
          } else {
            this.selectedMonthSchedule = {
              slotSchedule: [],
            };
          }
        },
      });
  }

  private setData(schedule: any) {
    /*
    if (!this.scheduledMonths.some((month: any) => month.name === schedule.month)) {
      this.scheduledMonths.push({ name: schedule.month, year: schedule.year });
    }
    this.startDate = schedule.startDate;
    this.endDate = schedule.endDate;
    this.data = []
    schedule.slotSchedule.forEach((slot, i) => {
      let obj = {
        startTime: "",
        startClocktime: "",
        endTime: "",
        endClocktime: "",
        days: "",
        ids: []
      }
      obj.startTime = schedule.slotSchedule[i].startTime.split(" ")[0];
      obj.startClocktime = schedule.slotSchedule[i].startTime.split(" ")[1];
      obj.endTime = schedule.slotSchedule[i].endTime.split(" ")[0];
      obj.endClocktime = schedule.slotSchedule[i].endTime.split(" ")[1];
      obj.ids.push(schedule.slotSchedule[i].id);
      if (!this.data.some(el => el.startTime === obj.startTime && el.endTime === obj.endTime)) {
        this.data.push(obj);
      }
      this.data.forEach(d1 => {
        if (d1.startTime === obj.startTime && d1.endTime === obj.endTime) {
          d1.ids.push(schedule.slotSchedule[i].id);
          if (!d1.days.includes(schedule.slotSchedule[i].day.slice(0, 3)))
            d1.days = d1.days ? d1.days.concat(",", schedule.slotSchedule[i].day.slice(0, 3)) : schedule.slotSchedule[i].day.slice(0, 3);
        }
      })
    });
    this.getDaysOff(schedule.daysOff);
    */
  }

  toggleAddMoreTiming() {
    this._addMoreTiming = !this._addMoreTiming;
  }

  private get userId() {
    return JSON.parse(localStorage.user).uuid;
  }

}
