import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-share-prescription',
  templateUrl: './share-prescription.component.html',
})
export class SharePrescriptionComponent {

  constructor(@Inject(MAT_DIALOG_DATA) public data,
  private dialogRef: MatDialogRef<SharePrescriptionComponent>) { }

  close(val: boolean) {
    this.dialogRef.close(val);
  }

}
