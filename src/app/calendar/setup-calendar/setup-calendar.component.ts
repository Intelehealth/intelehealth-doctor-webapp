import { Component, Injectable, OnInit, ViewChild } from '@angular/core';
import { PageTitleService } from 'src/app/core/page-title/page-title.service';
import { MAT_DATE_FORMATS, NativeDateAdapter, DateAdapter } from '@angular/material/core';
import { formatDate } from '@angular/common';
import * as moment from 'moment';
import * as _ from 'lodash';
import { AppointmentService } from 'src/app/services/appointment.service';
import { FormArray, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDatepicker } from '@angular/material/datepicker';
import { ToastrService } from 'ngx-toastr';
import { CoreService } from 'src/app/services/core/core.service';

export const PICK_FORMATS = {
  parse: {dateInput: {month: 'short', year: 'numeric', day: 'numeric'}},
  display: {
      dateInput: 'input',
      monthYearLabel: {year: 'numeric', month: 'short'},
      dateA11yLabel: {year: 'numeric', month: 'long', day: 'numeric'},
      monthYearA11yLabel: {year: 'numeric', month: 'long'}
  }
};

@Injectable()
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
    // {
    //   id: 8,
    //   name: 'Weekdays',
    //   shortName: 'Weekdays'
    // },
    // {
    //   id: 9,
    //   name: 'Weekends',
    //   shortName: 'Weekends'
    // }
  ];
  timeList: any = [
    { id: 1, name: "9:00" },
    { id: 2, name: "10:00" },
    { id: 3, name: "11:00" },
    { id: 4, name: "12:00" },
    { id: 5, name: "1:00" },
    { id: 6, name: "2:00" },
    { id: 7, name: "3:00" },
    { id: 8, name: "4:00" },
    { id: 9, name: "5:00" },
    { id: 10, name: "6:00" },
    { id: 11, name: "7:00" },
    { id: 12, name: "8:00" }
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
  daysOffSelected: any[] = [];
  @ViewChild('picker3', { static: true }) _picker: MatDatepicker<Date>;
  submitted: boolean = false;

  constructor(
    private appointmentService: AppointmentService,
    private pageTitleService: PageTitleService,
    private toastr: ToastrService,
    private coreService: CoreService) {

    this.addSlotsForm = new FormGroup({
      drName: new FormControl(this.drName, Validators.required),
      userUuid: new FormControl(this.userId, Validators.required),
      speciality: new FormControl(this.getSpeciality(), Validators.required),
      type: new FormControl('month', Validators.required),
      month: new FormControl(null, Validators.required),
      year: new FormControl(null, Validators.required),
      startDate: new FormControl(null, Validators.required),
      endDate: new FormControl(null, Validators.required),
      slotDays: new FormControl(''),
      slotSchedule: new FormArray([]),
      timings: new FormArray([]),
      daysOff: new FormArray([])
    });

  }

  get f() { return this.addSlotsForm.controls; }
  get ft() { return this.addSlotsForm.get('timings') as FormArray; };
  get fd() { return this.addSlotsForm.get('daysOff') as FormArray; };
  get fs() { return this.addSlotsForm.get('slotSchedule') as FormArray; }

  ngOnInit(): void {
    this.pageTitleService.setTitle({ title: 'Calendar', imgUrl: 'assets/svgs/menu-calendar-circle.svg' });
    this.getScheduledMonths();
  }

  addMonth() {
    if (this.scheduledMonths.length !== this.monthNames.length) {
      let today = new Date();
      for (let x = 0; x < this.monthNames.length; x++) {
        let flag = 0;
        for (let y = 0; y < this.scheduledMonths.length; y++) {
          if (this.monthNames[x] == this.scheduledMonths[y].name) {
            flag = 1;
            break;
          }
        }
        if (flag == 0 && today.getMonth() <= x) {
          this.scheduledMonths.push({ name: this.monthNames[x], year: new Date().getFullYear() });
          break;
        }
      }
    }
  }

  selectMonth(name: string, year: string) {
    if (this.selectedMonth.name != name) {
      this.selectedMonth = { name, year };
      this.getSchedule(year, name);
      this.submitted = false;
    }
  }

  getMinMaxDate() {
    let today = moment();
    let min = moment(`${this.selectedMonth.year}-${this.selectedMonth.name}-1`, 'YYYY-MMMM-D');
    let max = moment(`${this.selectedMonth.year}-${this.selectedMonth.name}-1`, 'YYYY-MMMM-D').endOf('month');
    this.minDate = (min < today) ? today.format('YYYY-MM-DD') : min.format('YYYY-MM-DD');
    this.maxDate = max.format('YYYY-MM-DD');
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
              month: month,
              year: year,
              startDate: null,
              endDate: null,
              slotDays: '',
              slotSchedule: [],
              timings: [],
              daysOff: []
            };
            this.setData(this.selectedMonthSchedule);
          }
          this.getMinMaxDate();
        },
      });
  }

  private setData(schedule: any) {
    if (!this.scheduledMonths.some((month: any) => month.name === schedule.month)) {
      this.scheduledMonths.push({ name: schedule.month, year: schedule.year });
    }
    this.ft.clear();
    this.fd.clear();
    this.fs.clear();
    let uniqTiming = _.uniqWith(schedule.slotSchedule, (arrVal: any, otherVal: any) => { return arrVal.startTime == otherVal.startTime && arrVal.endTime == otherVal.endTime });
    uniqTiming.forEach((ut: any) => {
      let utslots = _.filter(schedule.slotSchedule, { startTime: ut.startTime, endTime: ut.endTime });
      let timingFormGroup = new FormGroup({
        startTime: new FormControl({ value: ut.startTime.split(" ")[0], disabled: true }, Validators.required),
        startMeridiem: new FormControl({ value: ut.startTime.split(" ")[1], disabled: true }, Validators.required),
        endTime: new FormControl({ value: ut.endTime.split(" ")[0], disabled: true }, Validators.required),
        endMeridiem: new FormControl({ value: ut.endTime.split(" ")[1], disabled: true }, Validators.required),
        days: new FormControl({ value: _.map(_.uniq(_.map(utslots,'day')), (val) => val.slice(0,3)), disabled: true }, Validators.required),
        slots: this.getSlotsArray(utslots)
      });
      this.ft.push(timingFormGroup);
    });

    // Add empty formGroup to Timings array for new entry
    this.ft.push(
      new FormGroup({
        startTime: new FormControl(null, Validators.required),
        startMeridiem: new FormControl(null, Validators.required),
        endTime: new FormControl(null, Validators.required),
        endMeridiem: new FormControl(null, Validators.required),
        days: new FormControl(null, Validators.required),
        slots: new FormArray([])
      })
    );
    // Push daysOff's to the form
    if (schedule.daysOff) {
      schedule.daysOff.forEach((doff: any) => {
        this.fd.push(new FormControl(moment(doff, "DD/MM/YYYY").format("YYYY-MM-DD HH:mm:ss"), Validators.required));
      });
    }

    this.addSlotsForm.patchValue({
      month: this.selectedMonth['name'],
      year: this.selectedMonth['year'],
      startDate: (schedule.startDate) ? moment(schedule.startDate).format('YYYY-MM-DD') : null,
      endDate: (schedule.endDate) ? moment(schedule.endDate).format('YYYY-MM-DD') : null,
      slotDays: ''
    });

    this.daysOffSelected = [];

    // console.log(this.addSlotsForm.value);
  }

  getSlotsArray(utslots: any) {
    let dataArray = new FormArray([]);
    utslots.forEach((uts: any) => {
      let d: FormGroup;
      d = new FormGroup({
        id: new FormControl(uts.id, Validators.required),
        day: new FormControl(uts.day, Validators.required),
        date: new FormControl(moment(uts.date).format('YYYY-MM-DD HH:mm:ss'), Validators.required),
        startTime: new FormControl(uts.startTime, Validators.required),
        endTime: new FormControl(uts.endTime, Validators.required)
      });
      dataArray.push(d);
    });
    return dataArray;
  }

  toggleAddMoreTiming() {
    this._addMoreTiming = !this._addMoreTiming;
  }

  getSlotsFormArray(i: any): FormArray {
    return this.ft.at(i).get("slots") as FormArray;
  }

  save() {
    this.submitted = true;
    this.fs.clear();
    if (this.addSlotsForm.invalid) {
      return;
    }
    if (moment(this.addSlotsForm.value.startDate) > moment(this.addSlotsForm.value.endDate)) {
      this.toastr.warning("Start date should greater than end date.", "Invalid Dates!");
      return;
    }
    let flag = 0;
    let ts = [...this.ft.getRawValue()];
    for (let i = 0; i < ts.length; i++) {
      if (this.validateTimeSlot({ startTime: `${ts[i].startTime} ${ts[i].startMeridiem}`, endTime: `${ts[i].endTime} ${ts[i].endMeridiem}` })) {
        let newSlots = this.createSlots(ts[i].days, `${ts[i].startTime} ${ts[i].startMeridiem}`, `${ts[i].endTime} ${ts[i].endMeridiem}`);
        let oldSlots = [...this.getSlotsFormArray(i).value];
        this.getSlotsFormArray(i).clear();
        for (let x = 0; x < oldSlots.length; x++) {
          if (_.find(newSlots, { date: oldSlots[x].date, day: oldSlots[x].day })) {
            this.getSlotsFormArray(i).push(
              new FormGroup({
                id: new FormControl(oldSlots[x].id, Validators.required),
                day: new FormControl(oldSlots[x].day, Validators.required),
                date: new FormControl(oldSlots[x].date, Validators.required),
                startTime: new FormControl(oldSlots[x].startTime, Validators.required),
                endTime: new FormControl(oldSlots[x].endTime, Validators.required)
              })
            );
            this.fs.push(
              new FormGroup({
                id: new FormControl(oldSlots[x].id, Validators.required),
                day: new FormControl(oldSlots[x].day, Validators.required),
                date: new FormControl(oldSlots[x].date, Validators.required),
                startTime: new FormControl(oldSlots[x].startTime, Validators.required),
                endTime: new FormControl(oldSlots[x].endTime, Validators.required)
              })
            );
          }
        }
        oldSlots = [...this.getSlotsFormArray(i).value];
        for (let x = 0; x < newSlots.length; x++) {
          if (!_.find(oldSlots, { date: newSlots[x].date, day: newSlots[x].day })) {
            this.getSlotsFormArray(i).push(
              new FormGroup({
                id: new FormControl(newSlots[x].id, Validators.required),
                day: new FormControl(newSlots[x].day, Validators.required),
                date: new FormControl(newSlots[x].date, Validators.required),
                startTime: new FormControl(newSlots[x].startTime, Validators.required),
                endTime: new FormControl(newSlots[x].endTime, Validators.required)
              })
            );
            this.fs.push(
              new FormGroup({
                id: new FormControl(newSlots[x].id, Validators.required),
                day: new FormControl(newSlots[x].day, Validators.required),
                date: new FormControl(newSlots[x].date, Validators.required),
                startTime: new FormControl(newSlots[x].startTime, Validators.required),
                endTime: new FormControl(newSlots[x].endTime, Validators.required)
              })
            );
          }
        }

        if (i == ts.length-1) {
          this.addSlotsForm.get('slotDays').setValue(_.uniq(_.map([...this.getSlotsFormArray(i).value],'day')).join('||'));
        }
      }
      else {
        this.toastr.warning("Slot start time should be less than end time.", "Invalid Slot Timings!");
        flag = 1;
        break;
      }
    }
    if (flag == 1) {
      return;
    }
    console.log(this.addSlotsForm.getRawValue());
    let body = { ...this.addSlotsForm.value };
    delete body['timings'];
    delete body['daysOff'];
    this.appointmentService.updateOrCreateAppointment(body).subscribe({
      next: (res: any) => {
        if (res.status) {
          this.getSchedule(this.selectedMonth.year, this.selectedMonth.name);
          this.submitted = false;
        }
      },
    });
  }

  deleteSlot(index: number) {
    this.coreService.openConfirmationDialog({ confirmationMsg: 'Do you really want to delete this timing slot?', cancelBtnText: 'Cancel', confirmBtnText: 'Confirm' }).afterClosed().subscribe(res => {
      if (res) {
        this.fs.clear();
        if (moment(this.addSlotsForm.value.startDate) > moment(this.addSlotsForm.value.endDate)) {
          this.toastr.warning("Start date should greater than end date.", "Invalid Dates!");
          return;
        }
        let flag = 0;
        let ts = [...this.ft.getRawValue()];
        for (let i = 0; i < ts.length - 1; i++) {
          if (i != index) {
            if (this.validateTimeSlot({ startTime: `${ts[i].startTime} ${ts[i].startMeridiem}`, endTime: `${ts[i].endTime} ${ts[i].endMeridiem}` })) {
              let newSlots = this.createSlots(ts[i].days, `${ts[i].startTime} ${ts[i].startMeridiem}`, `${ts[i].endTime} ${ts[i].endMeridiem}`);
              let oldSlots = [...this.getSlotsFormArray(i).value];
              this.getSlotsFormArray(i).clear();
              for (let x = 0; x < oldSlots.length; x++) {
                if (_.find(newSlots, { date: oldSlots[x].date, day: oldSlots[x].day })) {
                  this.getSlotsFormArray(i).push(
                    new FormGroup({
                      id: new FormControl(oldSlots[x].id, Validators.required),
                      day: new FormControl(oldSlots[x].day, Validators.required),
                      date: new FormControl(oldSlots[x].date, Validators.required),
                      startTime: new FormControl(oldSlots[x].startTime, Validators.required),
                      endTime: new FormControl(oldSlots[x].endTime, Validators.required)
                    })
                  );
                  this.fs.push(
                    new FormGroup({
                      id: new FormControl(oldSlots[x].id, Validators.required),
                      day: new FormControl(oldSlots[x].day, Validators.required),
                      date: new FormControl(oldSlots[x].date, Validators.required),
                      startTime: new FormControl(oldSlots[x].startTime, Validators.required),
                      endTime: new FormControl(oldSlots[x].endTime, Validators.required)
                    })
                  );
                }
              }
              oldSlots = [...this.getSlotsFormArray(i).value];
              for (let x = 0; x < newSlots.length; x++) {
                if (!_.find(oldSlots, { date: newSlots[x].date, day: newSlots[x].day })) {
                  this.getSlotsFormArray(i).push(
                    new FormGroup({
                      id: new FormControl(newSlots[x].id, Validators.required),
                      day: new FormControl(newSlots[x].day, Validators.required),
                      date: new FormControl(newSlots[x].date, Validators.required),
                      startTime: new FormControl(newSlots[x].startTime, Validators.required),
                      endTime: new FormControl(newSlots[x].endTime, Validators.required)
                    })
                  );
                  this.fs.push(
                    new FormGroup({
                      id: new FormControl(newSlots[x].id, Validators.required),
                      day: new FormControl(newSlots[x].day, Validators.required),
                      date: new FormControl(newSlots[x].date, Validators.required),
                      startTime: new FormControl(newSlots[x].startTime, Validators.required),
                      endTime: new FormControl(newSlots[x].endTime, Validators.required)
                    })
                  );
                }
              }

              this.addSlotsForm.get('slotDays').setValue('');
            }
            else {
              this.toastr.warning("Slot start time should be less than end time.", "Invalid Slot Timings!");
              flag = 1;
              break;
            }
          }
        }
        if (flag == 1) {
          return;
        }
        console.log(this.addSlotsForm.getRawValue());
        let body = { ...this.addSlotsForm.value };
        delete body['timings'];
        delete body['daysOff'];
        this.appointmentService.updateOrCreateAppointment(body).subscribe({
          next: (res: any) => {
            if (res.status) {
              this.getSchedule(this.selectedMonth.year, this.selectedMonth.name);
              this.submitted = false;
            }
          },
        });
      }
    });
  }

  validateTimeSlot(slot: any) {
    if (moment(slot.startTime, ["h:mm A"]).format("HH:mm:ss") >= moment(slot.endTime, ["h:mm A"]).format("HH:mm:ss")) {
      return false;
    }
    return true;
  }

  createSlots(days: any, startTime: string, endTime: string) {
    let slots = [];
    const start = moment(this.addSlotsForm.value.startDate).format('YYYY-MM-DD');
    const end = moment(this.addSlotsForm.value.endDate).format('YYYY-MM-DD');
    const daysOff = [...this.fd.value];
    let currentDate = moment(start);
    while (currentDate <= moment(end)) {
      const currentDateDay = currentDate.format('ddd');
      if (days.includes(currentDateDay) && !daysOff.includes(currentDate.format("YYYY-MM-DD HH:mm:ss"))) {
        slots.push({
          id: this.getUniqueId(),
          day: currentDate.format('dddd'),
          date: currentDate.format('YYYY-MM-DD HH:mm:ss'),
          startTime,
          endTime
        });
      }
      currentDate.add(1, "day");
    }
    return slots;
  }

  isDayOff = (event: any) => {
    const date = moment(
      event.getFullYear() +
      "-" +
      ("00" + (event.getMonth() + 1)).slice(-2) +
      "-" +
      ("00" + event.getDate()).slice(-2)).format('YYYY-MM-DD HH:mm:ss');
    return this.daysOffSelected.find((x: any) => x == date) ? "dayOffDate" : null;
  }

  dayOffSelected(event: any) {
    if (event.value) {
      const date = moment(event.value).format('YYYY-MM-DD HH:mm:ss');
      const index = this.daysOffSelected.indexOf(date);
      if (index < 0) {
        this.daysOffSelected.push(date);
      }
      else {
        this.daysOffSelected.splice(index, 1);
      }
    }
  }

  resetSelectedDaysOff() {
    this.daysOffSelected = [];
  }

  saveDaysOff() {
    if(!this.daysOffSelected.length) {
      this.toastr.warning("Please select atleast 1 date for day off.","Select dates!");
      return;
    }

    this.coreService.openConfirmationDialog({ confirmationMsg: 'Do you really want to save these days off ?', cancelBtnText: 'Cancel', confirmBtnText: 'Confirm' }).afterClosed().subscribe(res => {
      if (res) {
        let finalDaysOff = _.map(_.uniq([...this.fd.value].concat(this.daysOffSelected)), (val: any)=> {
          return moment(val, "YYYY-MM-DD HH:mm:ss").format('DD/MM/YYYY');
        });
        let body = {
          userUuid: this.userId,
          daysOff: finalDaysOff,
          month: this.selectedMonth.name,
          year: this.selectedMonth.year
        }
        this.appointmentService.updateDaysOff(body).subscribe({
          next: (res: any) => {
            if (res.status) {
              this.daysOffSelected.forEach(doff => {
                this.fd.push(new FormControl(doff, Validators.required));
              });
              this.daysOffSelected = [];
            }
          },
        });
      }
    });
  }

  removeDaysOff(index: number) {
    this.coreService.openConfirmationDialog({ confirmationMsg: 'Do you really want to remove this day off ?', cancelBtnText: 'Cancel', confirmBtnText: 'Confirm' }).afterClosed().subscribe(res => {
      if (res) {
        let finalDaysOff = [...this.fd.value];
        finalDaysOff.splice(index, 1);
        finalDaysOff = _.map(_.uniq(finalDaysOff), (val: any)=> {
          return moment(val, "YYYY-MM-DD HH:mm:ss").format('DD/MM/YYYY');
        });
        let body = {
          userUuid: this.userId,
          daysOff: finalDaysOff,
          month: this.selectedMonth.name,
          year: this.selectedMonth.year
        }
        this.appointmentService.updateDaysOff(body).subscribe({
          next: (res: any) => {
            if (res.status) {
              this.fd.removeAt(index);
            }
          },
        });
      }
    });
  }

  get daysOffDates() {
    let data = '';
    this.daysOffSelected.forEach((d) => {
      data += `${moment(d).format('DD MMM')}, `;
    });
    return data;
  }

  getUniqueId() {
    return Math.random().toString(36).substr(2, 9);
  };

  private get userId() {
    return JSON.parse(localStorage.user).uuid;
  }

  private get drName() {
    return (
      JSON.parse(localStorage.user)?.person?.display ||
      JSON.parse(localStorage.user)?.display
    );
  }

  private getSpeciality() {
    return JSON.parse(localStorage.provider).attributes.find((a: any) =>
      a.display.includes("specialization")
    ).value;
  }

}
