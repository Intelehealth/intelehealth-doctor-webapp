import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-reschedule-appointment-confirm',
  templateUrl: './reschedule-appointment-confirm.component.html',
  styleUrls: ['./reschedule-appointment-confirm.component.scss']
})
export class RescheduleAppointmentConfirmComponent implements OnInit {

  constructor(@Inject(MAT_DIALOG_DATA) public data: any,
  private dialogRef: MatDialogRef<RescheduleAppointmentConfirmComponent>) { }

  ngOnInit(): void {
  }

  close(val: any) {
    this.dialogRef.close(val);
  }

}
