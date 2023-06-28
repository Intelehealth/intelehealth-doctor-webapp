import { Component, Inject, OnInit } from '@angular/core';
import { FormArray, FormControl, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Observable } from 'rxjs';
import { debounceTime, distinctUntilChanged, map } from 'rxjs/operators';
import medicines from '../../core/data/medicines';

@Component({
  selector: 'app-add-plan-assessment',
  templateUrl: './add-plan-assessment.component.html',
  styleUrls: ['./add-plan-assessment.component.scss']
})
export class AddPlanAssessmentComponent implements OnInit {

  addForm: FormGroup;
  submitted: boolean = false;
  strengthList: any[] = [
    {
      id: 1,
      name: '5 Mg'
    },
    {
      id: 2,
      name: '10 Mg'
    },
    {
      id: 3,
      name: '50 Mg'
    },
    {
      id: 4,
      name: '75 Mg'
    },
    {
      id: 5,
      name: '100 Mg'
    },
    {
      id: 6,
      name: '500 Mg'
    },
    {
      id: 7,
      name: '1000 Mg'
    },
    {
      id: 8,
      name: '150 Mg'
    },
    {
      id: 9,
      name: '200 Mg'
    },
    {
      id: 10,
      name: '250 Mg'
    },
    {
      id: 11,
      name: '750 Mg'
    }
  ];
  drugNameList: any = [];
  routeList: any = [
    {
      id: 1,
      name: 'Oral'
    },
    {
      id: 2,
      name: 'Subcutaneous'
    },
    {
      id: 3,
      name: 'Intramuscular'
    },
    {
      id: 4,
      name: 'Intravenous'
    },
    {
      id: 5,
      name: 'Intrathecal'
    },
    {
      id: 6,
      name: 'Sublingual'
    },
    {
      id: 7,
      name: 'Buccal'
    },
    {
      id: 8,
      name: 'Rectal'
    },
    {
      id: 9,
      name: 'Ocular'
    },
    {
      id: 10,
      name: 'Transdermal'
    },
    {
      id: 11,
      name: 'Nasal'
    },
    {
      id: 12,
      name: 'Vaginal Route'
    }
  ];
  typeOfMedicineList: any = [
    {
      id: 1,
      name: 'Liquid'
    },
    {
      id: 2,
      name: 'Tablet'
    },
    {
      id: 3,
      name: 'Capsule'
    },
    {
      id: 4,
      name: 'Injection'
    },
    {
      id: 5,
      name: 'Inhaler'
    },
    {
      id: 6,
      name: 'Drop'
    },
    {
      id: 7,
      name: 'Suppositorie'
    },
    {
      id: 8,
      name: 'Topical'
    },
    {
      id: 9,
      name: 'Implant'
    },
    {
      id: 10,
      name: 'Patche'
    }
  ];
  durationList: any = [
    {
      id: 1,
      name: 'Every 30 mins'
    },
    {
      id: 2,
      name: 'Every hour'
    },
    {
      id: 3,
      name: 'Every 4 hours'
    },
    {
      id: 4,
      name: 'Every 6 hours'
    },
    {
      id: 5,
      name: 'Every 8 hour'
    },
    {
      id: 6,
      name: 'Every 12 hour'
    }
  ];
  dosageUnitList: any = [
    {
      id: 1,
      name: 'mg/ml'
    },
    {
      id: 2,
      name: 'mg/kg'
    },
    {
      id: 3,
      name: 'gram/kg'
    }
  ]

  search1 = (text$: Observable<string>) =>
    text$.pipe(
      debounceTime(200),
      distinctUntilChanged(),
      map(term => term.length < 1 ? [] : this.dosageUnitList.filter(v => v.name.toLowerCase().indexOf(term.toLowerCase()) > -1).map((val) => val.name))
  );

  search2 = (text$: Observable<string>) =>
    text$.pipe(
      debounceTime(200),
      distinctUntilChanged(),
      map(term => term.length < 1 ? [] : this.durationList.filter(v => v.name.toLowerCase().indexOf(term.toLowerCase()) > -1).map((val) => val.name))
  );

  search3 = (text$: Observable<string>) =>
    text$.pipe(
      debounceTime(200),
      distinctUntilChanged(),
      map(term => term.length < 1 ? [] : this.drugNameList.filter(v => v.name.toLowerCase().indexOf(term.toLowerCase()) > -1).map((val) => val.name))
  );

  search4 = (text$: Observable<string>) =>
    text$.pipe(
      debounceTime(200),
      distinctUntilChanged(),
      map(term => term.length < 1 ? [] : this.strengthList.filter(v => v.name.toLowerCase().indexOf(term.toLowerCase()) > -1).map((val) => val.name))
  );

  search5 = (text$: Observable<string>) =>
    text$.pipe(
      debounceTime(200),
      distinctUntilChanged(),
      map(term => term.length < 1 ? [] : this.routeList.filter(v => v.name.toLowerCase().indexOf(term.toLowerCase()) > -1).map((val) => val.name))
  );

  search6 = (text$: Observable<string>) =>
    text$.pipe(
      debounceTime(200),
      distinctUntilChanged(),
      map(term => term.length < 1 ? [] : this.typeOfMedicineList.filter(v => v.name.toLowerCase().indexOf(term.toLowerCase()) > -1).map((val) => val.name))
  );

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
    this.drugNameList = this.drugNameList.concat(medicines);

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
            medicineName: new FormControl((medicine[0])? medicine[0] : null, [Validators.required, Validators.maxLength(100)]),
            strength: new FormControl((medicine[1])? medicine[1] : null, [Validators.required, Validators.maxLength(10)]),
            dosage: new FormControl((medicine[2])? medicine[2].includes('::') ? medicine[2].split('::')[0] : null : null, [Validators.required, Validators.maxLength(10)]),
            dosageUnit: new FormControl((medicine[2])? medicine[2].includes('::') ? medicine[2].split('::')[1] : medicine[2].split('::')[0] : null, [Validators.required, Validators.maxLength(10)]),
            duration: new FormControl((medicine[3])? medicine[3] : null, [Validators.required, Validators.maxLength(15)]),
            typeOfMedicine: new FormControl((medicine[4])? medicine[4] : null, [Validators.required, Validators.maxLength(15)]),
            routeOfMedicine: new FormControl((medicine[5])? medicine[5] : null, [Validators.required, Validators.maxLength(15)]),
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
      medicineName: new FormControl(null, [Validators.required, Validators.maxLength(100)]),
      strength: new FormControl(null, [Validators.required, Validators.maxLength(10)]),
      dosage: new FormControl(null, [Validators.required, Validators.maxLength(10)]),
      dosageUnit: new FormControl(null, [Validators.required, Validators.maxLength(10)]),
      duration: new FormControl(null, [Validators.required, Validators.maxLength(15)]),
      typeOfMedicine: new FormControl(null, [Validators.required, Validators.maxLength(15)]),
      routeOfMedicine: new FormControl(null, [Validators.required, Validators.maxLength(15)]),
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
    this.submitted = true;
    if (this.addForm.invalid) {
      return;
    }
    this.close(this.addForm.value);
  }

  close(val: any) {
    this.dialogRef.close(val);
  }

}
