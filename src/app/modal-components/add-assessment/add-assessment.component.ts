import { Component, Inject, OnInit } from '@angular/core';
import { FormArray, FormControl, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-add-assessment',
  templateUrl: './add-assessment.component.html',
  styleUrls: ['./add-assessment.component.scss']
})
export class AddAssessmentComponent implements OnInit {

  addForm: FormGroup;
  submitted: boolean = false;
  pastAssessment = [];

  constructor(@Inject(MAT_DIALOG_DATA) public data: any,
  private dialogRef: MatDialogRef<AddAssessmentComponent>) {
    this.addForm = new FormGroup({
      assessment: new FormArray([])
    });
  }

  get f() { return this.addForm.controls; }
  get fa() { return this.addForm.get('assessment') as FormArray; }

  ngOnInit(): void {
    if (this.data) {
      for (const element of this.data.historyData) {
        this.pastAssessment.push({
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

      if (this.data.currentEncData.length) {
        for (const element of this.data.currentEncData) {
          if (element.canEdit) {
            let itemToAdd = new FormGroup({
              id: new FormControl(element.uuid),
              assessmentValue: new FormControl({value: element.value, disabled: !element.canEdit }, [Validators.required]),
              isDeleted: new FormControl(false),
              index: new FormControl(-1),
              canEdit: new FormControl(element.canEdit),
              obsDatetime: new FormControl(element.obsDatetime),
              creator: new FormControl(element.creator)
            });
            this.fa.push(itemToAdd);
          }
        }
      }

      if (!this.fa.length) {
        this.addAssessment();
      }
    }
  }

  addAssessment() {
    let itemToAdd = new FormGroup({
      id: new FormControl(null),
      assessmentValue: new FormControl(null, [Validators.required]),
      isDeleted: new FormControl(false),
      index: new FormControl(-1),
      canEdit: new FormControl(true),
      obsDatetime: new FormControl(null),
      creator: new FormControl(null)
    });
    this.fa.push(itemToAdd);
  }

  removeAssessment(index: number) {
    if (this.fa.at(index).get('id').value) {
      this.fa.at(index).patchValue({ isDeleted: true });
    } else {
      this.fa.removeAt(index);
    }
  }

  add() {
    this.submitted = true;
    if (this.addForm.invalid) {
      return;
    }
    this.close(this.addForm.getRawValue());
  }

  close(val: any) {
    this.dialogRef.close(val);
  }

}
