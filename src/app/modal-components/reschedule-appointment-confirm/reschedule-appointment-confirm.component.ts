import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import * as moment from 'moment';

@Component({
  selector: 'app-reschedule-appointment-confirm',
  templateUrl: './reschedule-appointment-confirm.component.html',
  styleUrls: ['./reschedule-appointment-confirm.component.scss']
})
export class RescheduleAppointmentConfirmComponent implements OnInit {

  slot = { original: this.data?.newSlot?.slot, modified: moment(this.data?.newSlot?.slot, "LT").format("H:mm")}
  slotTime = { original: this.data?.appointment?.slotTime, modified: moment(this.data?.appointment?.slotTime, "LT").format("H:mm")}
  locale: any = localStorage.getItem('selectedLanguage');
  constructor(@Inject(MAT_DIALOG_DATA) public data: any,
  private dialogRef: MatDialogRef<RescheduleAppointmentConfirmComponent>) { }

  ngOnInit(): void {
  }

  close(val: any) {
    this.dialogRef.close(val);
  }

}
