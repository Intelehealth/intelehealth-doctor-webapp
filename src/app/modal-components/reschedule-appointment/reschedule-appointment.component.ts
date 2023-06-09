import { formatDate } from '@angular/common';
import { Component, Inject, OnInit } from '@angular/core';
import { DateAdapter, MAT_DATE_FORMATS, NativeDateAdapter } from '@angular/material/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import * as moment from 'moment';
import { ToastrService } from 'ngx-toastr';
import { AppointmentService } from 'src/app/services/appointment.service';
import { TranslateService } from '@ngx-translate/core';

export const PICK_FORMATS = {
  parse: { dateInput: { month: 'short', year: 'numeric', day: 'numeric' } },
  display: {
    dateInput: 'input',
    monthYearLabel: { year: 'numeric', month: 'short' },
    dateA11yLabel: { year: 'numeric', month: 'long', day: 'numeric' },
    monthYearA11yLabel: { year: 'numeric', month: 'long' }
  }
};

class PickDateAdapter extends NativeDateAdapter {
  format(date: Date, displayFormat: Object): string {
    if (displayFormat === 'input') {
      return formatDate(date, 'dd MMMM yyyy', this.locale);
    } else {
      return date.toDateString();
    }
  }
}

@Component({
  selector: 'app-reschedule-appointment',
  templateUrl: './reschedule-appointment.component.html',
  styleUrls: ['./reschedule-appointment.component.scss'],
  providers: [
    { provide: DateAdapter, useClass: PickDateAdapter },
    { provide: MAT_DATE_FORMATS, useValue: PICK_FORMATS }
  ]
})
export class RescheduleAppointmentComponent implements OnInit {

  minDate: any;
  scheduleData: any = {
    morning: [],
    afternoon: [],
    evening: []
  };
  selectedDate = moment().format("YYYY-MM-DD");
  slots: any = [];
  selectedSlot: any;

  constructor(@Inject(MAT_DIALOG_DATA) public data: any,
    private dialogRef: MatDialogRef<RescheduleAppointmentComponent>,
    private appointmentService: AppointmentService,
    private toastr: ToastrService,
    private translateService: TranslateService
    ) {
    this.minDate = new Date();
  }

  ngOnInit(): void {
    this.getAppointmentSlots();
    moment.locale(localStorage.getItem('selectedLanguage'));
  }

  dateChanged(event: any) {
    this.selectedSlot = null;
    this.selectedDate = moment(event.target.value).format("YYYY-MM-DD");
    this.getAppointmentSlots();
  }

  getAppointmentSlots(fromDate = this.selectedDate, toDate = this.selectedDate, speciality = this.data?.speciality) {
    this.scheduleData = {
      morning: [],
      afternoon: [],
      evening: []
    };
    this.appointmentService.getAppointmentSlots(moment(fromDate).format("DD/MM/YYYY"), moment(toDate).format("DD/MM/YYYY"), speciality).subscribe((res: any) => {
      this.slots = res.dates;
      this.slots.forEach((slot: any) => {
        if (moment(slot.slotTime, "LT").isBefore(moment("12:00 PM", "LT"))) {
          this.scheduleData.morning.push(slot.slotTime);
        } else if (moment(slot.slotTime, "LT").isBetween(moment("11:30 AM", "LT"), moment("5:00 PM", "LT"))) {
          this.scheduleData.afternoon.push(slot.slotTime);
        } else {
          this.scheduleData.evening.push(slot.slotTime);
        }
      });
    });
  }

  reschedule() {
    if (this.selectedDate && this.selectedSlot) {
      this.close({ date: this.selectedDate, slot: this.selectedSlot });
    } else {
      this.toastr.warning(this.translateService.instant(`messages.${"Please select slot to reschedule."}`), this.translateService.instant(`messages.${"Select Slot"}`));
    }
  }

  close(val: any) {
    this.dialogRef.close(val);
  }

}
