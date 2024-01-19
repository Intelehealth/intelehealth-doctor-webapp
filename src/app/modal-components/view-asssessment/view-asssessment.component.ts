import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-view-asssessment',
  templateUrl: './view-asssessment.component.html',
  styleUrls: ['./view-asssessment.component.scss']
})
export class ViewAsssessmentComponent implements OnInit {

  assessment = [];

  constructor(@Inject(MAT_DIALOG_DATA) public data: any,
  private dialogRef: MatDialogRef<ViewAsssessmentComponent>) { }

  ngOnInit(): void {
    if (this.data) {
      for (const element of this.data.assessmentData) {
        this.assessment.push({
          id: element.uuid,
          assessmentValue: element.value,
          isDeleted: false,
          index: -1,
          canEdit: element.canEdit,
          obsDatetime: element.obsDatetime,
          creator: element.creator,
          initial: element.initial
        })
      }
    }
  }

  close(val: any) {
    this.dialogRef.close(val);
  }

}
