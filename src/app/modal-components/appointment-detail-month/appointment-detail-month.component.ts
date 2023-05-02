import { Component, Inject, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import * as moment from 'moment';
import { ToastrService } from 'ngx-toastr';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-appointment-detail-month',
  templateUrl: './appointment-detail-month.component.html',
  styleUrls: ['./appointment-detail-month.component.scss']
})
export class AppointmentDetailMonthComponent implements OnInit {

  appointmentCount: number = 0;
  followupCount: number = 0;
  timeList: any = [];
  dayOffForm: FormGroup;

  constructor(@Inject(MAT_DIALOG_DATA) public data: any,
    private dialogRef: MatDialogRef<AppointmentDetailMonthComponent>,
    private toastr: ToastrService,
    private translateService: TranslateService
  ) {
    this.dayOffForm = new FormGroup({
      markAs: new FormControl('dayOff'),
      from: new FormControl(null),
      to: new FormControl(null)
    });
  }

  ngOnInit(): void {
    this.appointmentCount = this.getCount('Appointment');
    this.followupCount = this.getCount('Follow-up visit');
    this.timeList= this.getHours();
    this.dayOffForm.get('markAs').valueChanges.subscribe((val: any) => {
      if (val == 'dayOff') {
        this.dayOffForm.get('from').clearValidators();
        this.dayOffForm.get('from').updateValueAndValidity();
        this.dayOffForm.get('to').clearValidators();
        this.dayOffForm.get('to').updateValueAndValidity();
        this.dayOffForm.patchValue({ from: null, to: null });
      } else {
        this.dayOffForm.get('from').setValidators(Validators.required);
        this.dayOffForm.get('from').updateValueAndValidity();
        this.dayOffForm.get('to').setValidators(Validators.required);
        this.dayOffForm.get('to').updateValueAndValidity();
        this.dayOffForm.patchValue({ from: null, to: null });
      }
    })
  }

  markDayOff() {
    if (this.dayOffForm.invalid) {
      this.toastr.warning(this.translateService.instant(`messages.${"Please select from and to time"}`), this.translateService.instant(`messages.${"Invalid Time!"}`));
      return;
    }
    if (this.dayOffForm.value.markAs == 'dayOff') {
      this.close(this.dayOffForm.value);
    } else {
      if (this.validateTimeSlot(this.dayOffForm.value.from, this.dayOffForm.value.to)) {
        this.close(this.dayOffForm.value);
      } else {
        this.toastr.warning(this.translateService.instant(`messages.${"Please select valid from and to time"}`), this.translateService.instant(`messages.${"Invalid Time!"}`));
      }
    }
  }

  close(val: any) {
    this.dialogRef.close(val);
  }

  getCount(type: string) {
    let count = 0;
    this.data?.events.forEach((e: any) => {
      if (e.title == type) {
        count++;
      }
    });
    return count;
  }

  getHours(returnAll = true, date?: any) {
    const hours = Array.from(
      {
        length: 21,
      },
      (_, hour) =>
        moment({
          hour,
          minutes: 0,
        }).format("LT")
    );
    hours.splice(0, 9);
    if (this.isToday(date) && !returnAll) {
      const hrs = hours.filter((h) => moment(h, "LT").isAfter(moment()));
      return hrs;
    } else {
      return hours;
    }
  }

  isToday(date: any) {
    const start = moment().startOf("day");
    const end = moment().endOf("day");
    return (
      moment().startOf("day").isSame(moment(date)) ||
      moment(date).isBetween(start, end)
    );
  }

  validateTimeSlot(from: any, to: any) {
    if (moment(from, "h:mm A").format("HH:mm:ss") >= moment(to, "h:mm A").format("HH:mm:ss")) {
      return false;
    }
    return true;
  }

}
