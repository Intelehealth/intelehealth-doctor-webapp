import { Component, Inject, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
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
      medicineName: new FormControl(null),
      strength: new FormControl(null),
      dosage: new FormControl(null),
      duration: new FormControl(null),
      typeOfMedicine: new FormControl(null),
      routeOfMedicine: new FormControl(null),
    });
  }

  get f() { return this.addForm.controls; }

  ngOnInit(): void {
    if (this.data) {
      if (this.data.medicine == 'N') {
        this.addForm.patchValue(this.data);
      } else {
        const medicine = this.data.medicine.split('|').map(o => o.trim());
        this.addForm.patchValue({
          assessment: this.data.assessment,
          plan: this.data.plan,
          medicine: 'Y',
          medicineName: (medicine[0])? medicine[0] : null,
          strength: (medicine[1])? medicine[1] : null,
          dosage: (medicine[2])? medicine[2] : null,
          duration: (medicine[3])? medicine[3] : null,
          typeOfMedicine: (medicine[4])? medicine[4] : null,
          routeOfMedicine: (medicine[5])? medicine[5] : null
        });
      }
    }
    this.addForm.get('medicine').valueChanges.subscribe(res=> {
      if (res == 'Y') {
        this.addForm.get('medicineName').addValidators([Validators.required]);
        this.addForm.get('medicineName').updateValueAndValidity();
        this.addForm.get('strength').addValidators([Validators.required]);
        this.addForm.get('strength').updateValueAndValidity();
        this.addForm.get('dosage').addValidators([Validators.required]);
        this.addForm.get('dosage').updateValueAndValidity();
        this.addForm.get('duration').addValidators([Validators.required]);
        this.addForm.get('duration').updateValueAndValidity();
        this.addForm.get('typeOfMedicine').addValidators([Validators.required]);
        this.addForm.get('typeOfMedicine').updateValueAndValidity();
        this.addForm.get('routeOfMedicine').addValidators([Validators.required]);
        this.addForm.get('routeOfMedicine').updateValueAndValidity();
      } else {
        this.addForm.get('medicineName').clearValidators();
        this.addForm.get('medicineName').updateValueAndValidity();
        this.addForm.get('strength').clearValidators();
        this.addForm.get('strength').updateValueAndValidity();
        this.addForm.get('dosage').clearValidators();
        this.addForm.get('dosage').updateValueAndValidity();
        this.addForm.get('duration').clearValidators();
        this.addForm.get('duration').updateValueAndValidity();
        this.addForm.get('typeOfMedicine').clearValidators();
        this.addForm.get('typeOfMedicine').updateValueAndValidity();
        this.addForm.get('routeOfMedicine').clearValidators();
        this.addForm.get('routeOfMedicine').updateValueAndValidity();
      }
    });
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
