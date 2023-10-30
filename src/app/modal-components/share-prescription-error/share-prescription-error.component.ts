import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-share-prescription-error',
  templateUrl: './share-prescription-error.component.html',
})
export class SharePrescriptionErrorComponent {

  constructor(@Inject(MAT_DIALOG_DATA) public data,
  private dialogRef: MatDialogRef<SharePrescriptionErrorComponent>) { }

  /**
  * Close modal
  * @param {boolean} val - Dialog result
  * @return {void}
  */
  close(val: boolean) {
    this.dialogRef.close(val);
  }
}
