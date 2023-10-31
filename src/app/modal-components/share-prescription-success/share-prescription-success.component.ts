import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-share-prescription-success',
  templateUrl: './share-prescription-success.component.html',
})
export class SharePrescriptionSuccessComponent {
export class SharePrescriptionSuccessComponent {

  constructor(@Inject(MAT_DIALOG_DATA) public data,
  constructor(@Inject(MAT_DIALOG_DATA) public data,
  private dialogRef: MatDialogRef<SharePrescriptionSuccessComponent>) { }

  /**
  * Close modal
  * @param {string|boolean} val - Dialog result
  * @return {void}
  */
  close(val: string|boolean) {
    this.dialogRef.close(val);
  }

}
