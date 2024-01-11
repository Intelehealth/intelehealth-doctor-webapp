import { Component, Inject, OnInit } from '@angular/core';
import { FormArray, FormControl, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-prescribe-iv-fluid',
  templateUrl: './prescribe-iv-fluid.component.html',
  styleUrls: ['./prescribe-iv-fluid.component.scss']
})
export class PrescribeIvFluidComponent implements OnInit {

  addForm: FormGroup;
  submitted: boolean = false;
  prescribedIV = [];
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

  typeList: any = [
    {
      id: 1,
      name: 'Ringer Lactate'
    },
    {
      id: 2,
      name: 'Normal Saline'
    },
    {
      id: 3,
      name: 'Dextrose 5% (D5)'
    },
    {
      id: 4,
      name: 'Other'
    }
  ];

  constructor(@Inject(MAT_DIALOG_DATA) public data: any,
  private dialogRef: MatDialogRef<PrescribeIvFluidComponent>) {
    this.addForm = new FormGroup({
      iv: new FormArray([]),
    });
  }

  get f() { return this.addForm.controls; }
  get fiv() { return this.addForm.get('iv') as FormArray; }

  ngOnInit(): void {
    if (this.data) {
      for (const element of this.data.historyData) {
        this.prescribedIV.push({
          id: element.uuid,
          type: element.value.type,
          otherType: element.value.otherType,
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
              type: new FormControl(element.value.type, [Validators.required]),
              otherType: new FormControl(element.value.otherType, [Validators.maxLength(15)]),
              infusionRate: new FormControl(element.value.infusionRate, [Validators.required, Validators.maxLength(3)]),
              infusionStatus: new FormControl(element.value.infusionStatus, [Validators.required]),
              isDeleted: new FormControl(false),
              index: new FormControl(-1),
              canEdit: new FormControl(true),
              obsDatetime: new FormControl(element.obsDatetime),
              creator: new FormControl(element.creator)
            });
            itemToAdd.get('type').valueChanges.subscribe((val: any) => {
              if (val == 'Other') {
                itemToAdd.get('otherType').addValidators([Validators.required, Validators.maxLength(15)]);
              } else {
                itemToAdd.get('otherType').setValue(null);
                itemToAdd.get('otherType').clearValidators();
              }
              itemToAdd.get('otherType').updateValueAndValidity();
            });
            this.fiv.push(itemToAdd);
          }
        }
      }

      if (!this.fiv.length) {
        this.addIVFluid();
      }
    }
  }

  addIVFluid() {
    let itemToAdd = new FormGroup({
      id: new FormControl(null),
      type: new FormControl(null, [Validators.required]),
      otherType: new FormControl(null, [Validators.maxLength(15)]),
      infusionRate: new FormControl(null, [Validators.required, Validators.maxLength(3)]),
      infusionStatus: new FormControl(null, [Validators.required]),
      isDeleted: new FormControl(false),
      index: new FormControl(-1),
      canEdit: new FormControl(true),
      obsDatetime: new FormControl(null),
      creator: new FormControl(null)
    });
    itemToAdd.get('type').valueChanges.subscribe((val: any) => {
      if (val == 'Other') {
        itemToAdd.get('otherType').addValidators([Validators.required, Validators.maxLength(15)]);
      } else {
        itemToAdd.get('otherType').clearValidators();
      }
      itemToAdd.get('otherType').updateValueAndValidity();
    });
    this.fiv.push(itemToAdd);
  }

  removeIVFluid(index: number) {
    if (this.fiv.at(index).get('id').value) {
      this.fiv.at(index).patchValue({ isDeleted: true });
    } else {
      this.fiv.removeAt(index);
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
