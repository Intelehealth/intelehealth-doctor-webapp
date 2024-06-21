import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-diagnosis-detail',
  templateUrl: './diagnosis-detail.component.html',
  styleUrls: ['./diagnosis-detail.component.scss']
})
export class DiagnosisDetailComponent implements OnInit {

  constructor(@Inject(MAT_DIALOG_DATA) public data: any,
  private dialogRef: MatDialogRef<DiagnosisDetailComponent>) { }

  ngOnInit(): void {
  }

  close(val: any) {
    this.dialogRef.close(val);
  }

}
