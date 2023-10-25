import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-confirm-day-off',
  templateUrl: './confirm-day-off.component.html',
})
export class ConfirmDayOffComponent {

  constructor(@Inject(MAT_DIALOG_DATA) public data,
  private dialogRef: MatDialogRef<ConfirmDayOffComponent>) { }

  close(val: boolean) {
    this.dialogRef.close(val);
  }

}
