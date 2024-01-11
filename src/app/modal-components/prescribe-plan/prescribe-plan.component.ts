import { Component, Inject, OnInit } from '@angular/core';
import { FormArray, FormControl, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-prescribe-plan',
  templateUrl: './prescribe-plan.component.html',
  styleUrls: ['./prescribe-plan.component.scss']
})
export class PrescribePlanComponent implements OnInit {

  addForm: FormGroup;
  submitted: boolean = false;
  prescribedPlan = [];

  constructor(@Inject(MAT_DIALOG_DATA) public data: any,
  private dialogRef: MatDialogRef<PrescribePlanComponent>) {
    this.addForm = new FormGroup({
      plan: new FormArray([])
    });
  }

  get f() { return this.addForm.controls; }
  get fp() { return this.addForm.get('plan') as FormArray; }

  ngOnInit(): void {
    if (this.data) {
      for (const element of this.data.historyData) {
        this.prescribedPlan.push({
          id: element.uuid,
          planValue: element.value,
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
              planValue: new FormControl({value: element.value, disabled: !element.canEdit }, [Validators.required]),
              isDeleted: new FormControl(false),
              index: new FormControl(-1),
              canEdit: new FormControl(element.canEdit),
              obsDatetime: new FormControl(element.obsDatetime),
              creator: new FormControl(element.creator)
            });
            this.fp.push(itemToAdd);
          }
        }
      }

      if (!this.fp.length) {
        this.addPlan();
      }
    }
  }

  addPlan() {
    let itemToAdd = new FormGroup({
      id: new FormControl(null),
      planValue: new FormControl(null, [Validators.required]),
      isDeleted: new FormControl(false),
      index: new FormControl(-1),
      canEdit: new FormControl(true),
      obsDatetime: new FormControl(null),
      creator: new FormControl(null)
    });
    this.fp.push(itemToAdd);
  }

  removePlan(index: number) {
    if (this.fp.at(index).get('id').value) {
      this.fp.at(index).patchValue({ isDeleted: true });
    } else {
      this.fp.removeAt(index);
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
