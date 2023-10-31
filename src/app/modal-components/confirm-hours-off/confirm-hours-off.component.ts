import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-confirm-hours-off',
  templateUrl: './confirm-hours-off.component.html',
})
export class ConfirmHoursOffComponent {

  constructor(@Inject(MAT_DIALOG_DATA) public data,
  constructor(@Inject(MAT_DIALOG_DATA) public data,
  private dialogRef: MatDialogRef<ConfirmHoursOffComponent>) { }

  /**
  * Close modal
  * @param {boolean} val - Dialog result
  * @return {void}
  */
  close(val: boolean) {
    this.dialogRef.close(val);
  }

}
