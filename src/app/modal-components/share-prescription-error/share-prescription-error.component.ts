import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-share-prescription-error',
  templateUrl: './share-prescription-error.component.html',
  styleUrls: ['./share-prescription-error.component.scss']
})
export class SharePrescriptionErrorComponent implements OnInit {

  constructor(@Inject(MAT_DIALOG_DATA) public data: any,
  private dialogRef: MatDialogRef<SharePrescriptionErrorComponent>) { }

  ngOnInit(): void {
  }

  close(val: any) {
    this.dialogRef.close(val);
  }
}
