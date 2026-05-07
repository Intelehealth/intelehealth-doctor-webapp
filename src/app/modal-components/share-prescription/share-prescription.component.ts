import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-share-prescription',
  templateUrl: './share-prescription.component.html',
})
export class SharePrescriptionComponent {
  isRapidCompletion: boolean = false;

  constructor(@Inject(MAT_DIALOG_DATA) public data: any,
  private dialogRef: MatDialogRef<SharePrescriptionComponent>) {
    // Check if this is a rapid completion warning
    if (data && data.isRapidCompletion) {
      this.isRapidCompletion = true;
    }
  }

  /**
  * Close modal
  * @param {boolean} val - Dialog result
  * @return {void}
  */
  close(val: boolean) {
    this.dialogRef.close(val);
  }

}
