import { Component, Inject, OnInit } from '@angular/core';
import { FormArray, FormControl, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-prescribe-oxytocin',
  templateUrl: './prescribe-oxytocin.component.html',
  styleUrls: ['./prescribe-oxytocin.component.scss']
})
export class PrescribeOxytocinComponent implements OnInit {

  addForm: FormGroup;
  submitted: boolean = false;
  prescribedOxytocin = [];
  infusionStatusList: any = [
    {
      id: 1,
      name: 'Start'
    },
    {
      id: 2,
      name: 'Continue'
    },
    {
      id: 3,
      name: 'Stop'
    }
  ];
  constructor(@Inject(MAT_DIALOG_DATA) public data: any,
  private dialogRef: MatDialogRef<PrescribeOxytocinComponent>) {
    this.addForm = new FormGroup({
      oxytocin: new FormArray([]),
    });
  }

  get f() { return this.addForm.controls; }
  get foxy() { return this.addForm.get('oxytocin') as FormArray; }

  ngOnInit(): void {
    if (this.data) {
      for (const element of this.data.historyData) {
        this.prescribedOxytocin.push({
          id: element.uuid,
          strength: element.value.strength,
          infusionRate: element.value.infusionRate,
          infusionStatus: element.value.infusionStatus,
          obsDatetime: element.obsDatetime,
          creator: element.creator,
          initial: element.initial
        });
      }

      if (this.data.currentEncData.length) {
        for (const element of this.data.currentEncData) {
          if (element.canEdit) {
            let itemToAdd = new FormGroup({
              id: new FormControl(element.uuid),
              strength: new FormControl(element.value.strength, [Validators.required, Validators.maxLength(3)]),
              infusionRate: new FormControl(element.value.infusionRate, [Validators.required, Validators.maxLength(3)]),
              infusionStatus: new FormControl(element.value.infusionStatus, [Validators.required]),
              isDeleted: new FormControl(false),
              index: new FormControl(-1),
              canEdit: new FormControl(true),
              obsDatetime: new FormControl(element.obsDatetime),
              creator: new FormControl(element.creator)
            });
            this.foxy.push(itemToAdd);
          }
        }
      }

      if (!this.foxy.length) {
        this.addOxytocin();
      }
    }
  }

  addOxytocin() {
    let itemToAdd = new FormGroup({
      id: new FormControl(null),
      strength: new FormControl(null, [Validators.required, Validators.min(1), Validators.max(10), Validators.maxLength(3)]),
      infusionRate: new FormControl(null, [Validators.required, Validators.min(5), Validators.max(60), Validators.maxLength(3)]),
      infusionStatus: new FormControl(null, [Validators.required]),
      isDeleted: new FormControl(false),
      index: new FormControl(-1),
      canEdit: new FormControl(true),
      obsDatetime: new FormControl(null),
      creator: new FormControl(null)
    });
    this.foxy.push(itemToAdd);
  }

  removeOxytocin(index: number) {
    if (this.foxy.at(index).get('id').value) {
      this.foxy.at(index).patchValue({ isDeleted: true });
    } else {
      this.foxy.removeAt(index);
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
