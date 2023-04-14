import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-add-plan-assessment',
  templateUrl: './add-plan-assessment.component.html',
  styleUrls: ['./add-plan-assessment.component.scss']
})
export class AddPlanAssessmentComponent implements OnInit {

  constructor(@Inject(MAT_DIALOG_DATA) public data: any,
  private dialogRef: MatDialogRef<AddPlanAssessmentComponent>) { }

  ngOnInit(): void {
  }

  close(val: any) {
    this.dialogRef.close(val);
  }

}
