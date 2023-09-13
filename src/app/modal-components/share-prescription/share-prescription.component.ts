import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-share-prescription',
  templateUrl: './share-prescription.component.html',
})
export class SharePrescriptionComponent implements OnInit {

  constructor(@Inject(MAT_DIALOG_DATA) public data: any,
  private dialogRef: MatDialogRef<SharePrescriptionComponent>) { }

  ngOnInit(): void {
  }

  close(val: any) {
    this.dialogRef.close(val);
  }

}
