import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-confirm-hours-off',
  templateUrl: './confirm-hours-off.component.html',
})
export class ConfirmHoursOffComponent implements OnInit {

  constructor(@Inject(MAT_DIALOG_DATA) public data,
  private dialogRef: MatDialogRef<ConfirmHoursOffComponent>) { }

  ngOnInit(): void {
  }

  close(val: boolean) {
    this.dialogRef.close(val);
  }

}
