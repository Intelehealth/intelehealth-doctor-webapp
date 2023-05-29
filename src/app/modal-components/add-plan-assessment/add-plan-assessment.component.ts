import { Component, Inject, OnInit } from '@angular/core';
import { FormArray, FormControl, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-add-plan-assessment',
  templateUrl: './add-plan-assessment.component.html',
  styleUrls: ['./add-plan-assessment.component.scss']
})
export class AddPlanAssessmentComponent implements OnInit {

  addForm: FormGroup;

  constructor(@Inject(MAT_DIALOG_DATA) public data: any,
  private dialogRef: MatDialogRef<AddPlanAssessmentComponent>) {
    this.addForm = new FormGroup({
      assessment: new FormControl(null),
      plan: new FormControl(null),
      medicine: new FormControl('N'),
      medicines: new FormArray([]),
    });
  }

  get f() { return this.addForm.controls; }
  get fm() { return this.addForm.get('medicines') as FormArray; }

  ngOnInit(): void {
    this.fm.clear();
    if (this.data) {
      if (!this.data.medicines.length) {
        this.addForm.patchValue({
          assessment: this.data.assessment,
          plan: this.data.plan,
          medicine: 'N'
        });
      } else {
        for (let x = 0; x < this.data.medicines.length; x++) {
          let medicine = this.data.medicines[x].value.split('|').map(o => o.trim());
          this.fm.push(new FormGroup({
            id: new FormControl(this.data.medicines[x].uuid),
            medicineName: new FormControl((medicine[0])? medicine[0] : null, [Validators.required]),
            strength: new FormControl((medicine[1])? medicine[1] : null),
            dosage: new FormControl((medicine[2])? medicine[2] : null),
            duration: new FormControl((medicine[3])? medicine[3] : null),
            typeOfMedicine: new FormControl((medicine[4])? medicine[4] : null),
            routeOfMedicine: new FormControl((medicine[5])? medicine[5] : null),
            isDeleted: new FormControl(false),
            index: new FormControl(x)
          }));
        }
        this.addForm.patchValue({
          assessment: this.data.assessment,
          plan: this.data.plan,
          medicine: 'Y'
        });
      }
    }
    this.addForm.get('medicine').valueChanges.subscribe(res=> {
      if (res == 'Y') {
        for (let x = 0; x < this.fm.length; x++) {
          this.fm.at(x).patchValue({ isDeleted: false });
        }
      } else {
        for (let x = 0; x < this.fm.length; x++) {
          this.fm.at(x).patchValue({ isDeleted: true });
        }
      }
    });
  }

  addMedicine() {
    this.fm.push(new FormGroup({
      id: new FormControl(null),
      medicineName: new FormControl(null, [Validators.required]),
      strength: new FormControl(null),
      dosage: new FormControl(null),
      duration: new FormControl(null),
      typeOfMedicine: new FormControl(null),
      routeOfMedicine: new FormControl(null),
      isDeleted: new FormControl(false),
      index: new FormControl(-1)
    }));
  }

  removeMedicine(index: number) {
    if (this.fm.at(index).get('id').value) {
      this.fm.at(index).patchValue({ isDeleted: true });
    } else {
      this.fm.removeAt(index);
    }
  }

  add() {
    if (this.addForm.invalid) {
      return;
    }
    this.close(this.addForm.value);
  }

  close(val: any) {
    this.dialogRef.close(val);
  }

}
