import { formatDate } from '@angular/common';
import { AfterViewInit, Component, Inject, OnInit, ViewChild } from '@angular/core';
import { DateAdapter, MAT_DATE_FORMATS, NativeDateAdapter } from '@angular/material/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { TranslateService } from '@ngx-translate/core';
import { MatDatepicker } from '@angular/material/datepicker';
import * as moment from 'moment';
import { ToastrService } from 'ngx-toastr';
import { ApiResponseModel, RescheduleAppointmentModalResponseModel, ScheduleDataModel, SlotModel } from 'src/app/model/model';
import { AppointmentService } from 'src/app/services/appointment.service';

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
export class RescheduleAppointmentComponent implements OnInit,AfterViewInit {

  minDate: Date;
  scheduleData: ScheduleDataModel = {
    morning: [],
    afternoon: [],
    evening: []
  };
  selectedDate = moment().format("YYYY-MM-DD");
  slots: SlotModel[] = [];
  selectedSlot: SlotModel;
  @ViewChild('dp1') dp1: MatDatepicker<Date>;

  constructor(@Inject(MAT_DIALOG_DATA) public data,
    private dialogRef: MatDialogRef<RescheduleAppointmentComponent>,
    private appointmentService: AppointmentService,
    private toastr: ToastrService,
    private translate: TranslateService) {
    this.minDate = new Date();
  }

  ngOnInit(): void {
    this.getAppointmentSlots();
  }
ngAfterViewInit() {
  this.dp1.openedStream.subscribe(() => {
    setTimeout(() => {
      const cells = document.querySelectorAll('.mat-calendar-body-cell');
      cells.forEach(cell => {
        const label = cell.getAttribute('aria-label'); // e.g. "Mon Sep 08 2025"
        if (label) {
          const day = new Date(label).getDate();
          cell.setAttribute('data-test-id', `day-${day}`);
        }
      });
    });
  });
}
  /**
  * Callback for date change event
  * @param {Event} event - Date changed event
  * @return {void}
  */
  dateChanged(event) {
    this.selectedSlot = null;
    this.selectedDate = moment(event.target.value).format("YYYY-MM-DD");
    this.getAppointmentSlots();
  }

  /**
  * Get appointment slots for a given speciality, from and to date
  * @param {string} fromDate - From date
  * @param {string} toDate - To date
  * @param {string} speciality - Speciality
  * @return {void}
  */
  getAppointmentSlots(fromDate = this.selectedDate, toDate = this.selectedDate, speciality = this.data?.speciality) {
    this.scheduleData = {
      morning: [],
      afternoon: [],
      evening: []
    };
    this.appointmentService.getAppointmentSlots(moment(fromDate).format("DD/MM/YYYY"), moment(toDate).format("DD/MM/YYYY"), speciality).subscribe((res: ApiResponseModel) => {
      this.slots = res.dates;
      this.slots.forEach((slot: SlotModel) => {
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

  /**
  * Reschedule appointment
  * @return {void}
  */
  reschedule() {
    if (this.selectedDate && this.selectedSlot) {
      this.close({ date: this.selectedDate, slot: this.selectedSlot });
    } else {
    this.toastr.warning(this.translate.instant("Please select slot to reschedule."), this.translate.instant("Select Slot"));
      setTimeout(() => {
      const toastElement = document.querySelector('.toast-warning:last-child');
      if (toastElement) {
        toastElement.setAttribute('data-test-id', 'toastSelectSlot');
      }
    }, 0);
    }
  }

  /**
  * Close modal
  * @param {boolean|RescheduleAppointmentModalResponseModel} val - Dialog result
  * @return {void}
  */
  close(val: boolean|RescheduleAppointmentModalResponseModel) {
    this.dialogRef.close(val);
  }

}
