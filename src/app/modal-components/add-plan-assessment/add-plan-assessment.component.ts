import { Component, Inject, OnInit } from '@angular/core';
import { FormArray, FormControl, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Observable } from 'rxjs';
import { debounceTime, distinctUntilChanged, map } from 'rxjs/operators';
// import medicines from '../../core/data/medicines';

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
      name: '5 mg'
    },
    {
      id: 2,
      name: '10 mg'
    },
    {
      id: 3,
      name: '50 mg'
    },
    {
      id: 4,
      name: '75 mg'
    },
    {
      id: 5,
      name: '100 mg'
    },
    {
      id: 6,
      name: '500 mg'
    },
    {
      id: 7,
      name: '1000 mg'
    },
    {
      id: 8,
      name: '150 mg'
    },
    {
      id: 9,
      name: '200 mg'
    },
    {
      id: 10,
      name: '250 mg'
    },
    {
      id: 11,
      name: '750 mg'
    },
    {
      id: 12,
      name: '-'
    },
    {
      id: 13,
      name: '2000 mg'
    },
    {
      id: 14,
      name: '5%'
    },
    {
      id: 15,
      name: '0.9%'
    },
    {
      id: 16,
      name: '10 IU/mL'
    },
    {
      id: 17,
      name: '5 IU/mL'
    },
    {
      id: 18,
      name: '25 mg/mL'
    },
    {
      id: 19,
      name: '30 mg/mL'
    },
    {
      id: 20,
      name: '125 ug'
    },
    {
      id: 21,
      name: '5 mg/mL'
    },
    {
      id: 22,
      name: '1 mg/mL'
    },
    {
      id: 23,
      name: '2%'
    },
    {
      id: 24,
      name: '4 mg/mL'
    },
    {
      id: 25,
      name: '100 mg/mL'
    },
    {
      id: 26,
      name: '500 mg/mL'
    },
    {
      id: 27,
      name: '500 mg/100 mL'
    },
    {
      id: 28,
      name: '20 mg/mL'
    },
    {
      id: 29,
      name: '40 mg/mL'
    },
    {
      id: 30,
      name: '10 mg/mL'
    },
    {
      id: 31,
      name: '200 ug'
    },
    {
      id: 32,
      name: '400 mg'
    },
    {
      id: 33,
      name: '650 mg'
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
      name: 'Subcutaneous (SC)'
    },
    {
      id: 3,
      name: 'Intramuscular (IM)'
    },
    {
      id: 4,
      name: 'Intravenous (IV)'
    },
    {
      id: 5,
      name: 'Intrathecal'
    },
    {
      id: 6,
      name: 'Sublingual (SL)'
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
    },
    {
      id: 13,
      name: 'IV Infusion'
    },
    {
      id: 14,
      name: 'Intradermal (ID)'
    },
    {
      id: 15,
      name: 'Local infiltration'
    }
  ];
  typeOfMedicineList: any = [
    {
      id: 1,
      name: 'Tablet'
    },
    {
      id: 2,
      name: 'Capsule'
    },
    {
      id: 3,
      name: 'Injection'
    },
    {
      id: 4,
      name: 'Liquid'
    },
    {
      id: 5,
      name: 'Drop'
    },
    {
      id: 6,
      name: 'IV Fluid'
    },
    {
      id: 7,
      name: 'Inhaler'
    },
    {
      id: 8,
      name: 'Suppositorie'
    },
    {
      id: 9,
      name: 'Topical'
    },
    {
      id: 10,
      name: 'Implant'
    },
    {
      id: 11,
      name: 'Patche'
    },
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
    },
    {
      id: 7,
      name: 'Once daily (OD)'
    },
    {
      id: 8,
      name: 'Twice daily (BD)'
    },
    {
      id: 9,
      name: 'Thrice daily (TID)'
    },
    {
      id: 10,
      name: 'Four times in a day (QID)'
    },
    {
      id: 11,
      name: 'Single Dose'
    },
    {
      id: 12,
      name: 'Stat Dose'
    },
    {
      id: 13,
      name: 'As required (SOS)'
    },
  ];
  frequencyList: any = [
    {
      id: 1,
      name: 'Once daily (OD)'
    },
    {
      id: 2,
      name: 'Twice daily (BD)'
    },
    {
      id: 3,
      name: 'Thrice daily (TID)'
    },
    {
      id: 4,
      name: 'Four times in a day (QID)'
    },
    {
      id: 5,
      name: 'Single Dose'
    },
    {
      id: 6,
      name: 'Stat Dose'
    },
    {
      id: 7,
      name: 'As required (SOS)'
    },
  ];
  dosageUnitList: any = [
    {
      id: 1,
      name: 'mL'
    },
    {
      id: 2,
      name: 'Tab'
    },
    {
      id: 3,
      name: 'Cap'
    },
    {
      id: 4,
      name: 'Drop'
    }
  ];
  durationUnitList: any = [
    {
      id: 1,
      name: 'Minute'
    },
    {
      id: 2,
      name: 'Minutes'
    },
    {
      id: 3,
      name: 'Hour'
    },
    {
      id: 4,
      name: 'Hours'
    },
    {
      id: 5,
      name: 'Day'
    },
    {
      id: 6,
      name: 'Days'
    }
  ];
  medicines = [
    {
      id: 1,
      name: 'Ampicillin',
      form: 'Capsule',
      strength: '500 mg',
      doseUnit: 'Cap',
      route: 'Oral'
    },
    {
      id: 2,
      name: 'Metronidazole',
      form: 'Tablet',
      strength: '400 mg',
      doseUnit: 'Tab',
      route: 'Oral'
    },
    {
      id: 3,
      name: 'Paracetamol',
      form: 'Tablet',
      strength: '650 mg',
      doseUnit: 'Tab',
      route: 'Oral'
    },
    {
      id: 4,
      name: 'Paracetamol',
      form: 'Tablet',
      strength: '500 mg',
      doseUnit: 'Tab',
      route: 'Oral'
    },
    {
      id: 5,
      name: 'Ibuprofen',
      form: 'Tablet',
      strength: '400 mg',
      doseUnit: 'Tab',
      route: 'Oral'
    },
    {
      id: 6,
      name: 'B Complex',
      form: 'Tablet',
      strength: '-',
      doseUnit: 'Tab',
      route: 'Oral'
    },
    {
      id: 7,
      name: 'Misoprostol',
      form: 'Tablet',
      strength: '200 ug',
      doseUnit: 'Tab',
      route: 'Oral'
    },
    {
      id: 8,
      name: 'Gentamycin',
      form: 'Injection',
      strength: '10 mg/mL',
      doseUnit: 'mL',
      route: 'Intravenous (IV)'
    },
    {
      id: 9,
      name: 'Gentamycin',
      form: 'Injection',
      strength: '40 mg/mL',
      doseUnit: 'mL',
      route: 'Intravenous (IV)'
    },
    {
      id: 10,
      name: 'Betamethasone',
      form: 'Injection',
      strength: '4 mg/mL',
      doseUnit: 'mL',
      route: 'Intramuscular (IM)'
    },
    {
      id: 11,
      name: 'Hydralazine',
      form: 'Injection',
      strength: '20 mg/mL',
      doseUnit: 'mL',
      route: 'Intravenous (IV)'
    },
    {
      id: 12,
      name: 'Nifedipine',
      form: 'Capsule',
      strength: '10 mg',
      doseUnit: 'Cap',
      route: 'Oral'
    },
    {
      id: 13,
      name: 'Methyldopa',
      form: 'Tablet',
      strength: '250 mg',
      doseUnit: 'Tab',
      route: 'Oral'
    },
    {
      id: 14,
      name: 'Methyldopa',
      form: 'Tablet',
      strength: '500 mg',
      doseUnit: 'Tab',
      route: 'Oral'
    },
    {
      id: 15,
      name: 'Labetalol',
      form: 'Injection',
      strength: '5 mg/mL',
      doseUnit: 'mL',
      route: 'IV Infusion'
    },
    {
      id: 16,
      name: 'Magnesium Sulfate 20%',
      form: 'Injection',
      strength: '500 mg/mL',
      doseUnit: 'mL',
      route: 'Intravenous (IV)'
    },
    {
      id: 17,
      name: 'Magnesium Sulfate 50%',
      form: 'Injection',
      strength: '500 mg/mL',
      doseUnit: 'mL',
      route: 'Intravenous (IV)'
    },
    {
      id: 18,
      name: 'Metronidazole',
      form: 'Injection',
      strength: '500 mg/100 mL',
      doseUnit: 'mL',
      route: 'IV Infusion'
    },
    {
      id: 19,
      name: 'Calcium Gluconate',
      form: 'Injection',
      strength: '100 mg/mL',
      doseUnit: 'mL',
      route: 'IV Infusion'
    },
    {
      id: 20,
      name: 'Dexamethasone',
      form: 'Injection',
      strength: '4 mg/mL',
      doseUnit: 'mL',
      route: 'Intravenous (IV)'
    },
    {
      id: 21,
      name: 'Ampicillin',
      form: 'Injection',
      strength: '500 mg',
      doseUnit: 'mL',
      route: 'Intravenous (IV)'
    },
    {
      id: 22,
      name: 'Ampicillin',
      form: 'Injection',
      strength: '1000 mg',
      doseUnit: 'mL',
      route: 'Intravenous (IV)'
    },
    {
      id: 23,
      name: 'Lignocaine',
      form: 'Injection',
      strength: '2%',
      doseUnit: 'mL',
      route: 'Local infiltration'
    },
    {
      id: 24,
      name: 'Adrenaline',
      form: 'Injection',
      strength: '1 mg/mL',
      doseUnit: 'mL',
      route: 'Intravenous (IV)'
    },
    {
      id: 25,
      name: 'Hydrocortisone Succinate',
      form: 'Injection',
      strength: '100 mg',
      doseUnit: 'mL',
      route: 'Intravenous (IV)'
    },
    {
      id: 26,
      name: 'Hydrocortisone Succinate',
      form: 'Injection',
      strength: '200 mg',
      doseUnit: 'mL',
      route: 'Intravenous (IV)'
    },
    {
      id: 27,
      name: 'Diazepam',
      form: 'Injection',
      strength: '5 mg/mL',
      doseUnit: 'mL',
      route: 'Intravenous (IV)'
    },
    {
      id: 28,
      name: 'Pheniramine Maleate',
      form: 'Injection',
      strength: '22.75 mg/mL',
      doseUnit: 'mL',
      route: 'Intravenous (IV)'
    },
    {
      id: 29,
      name: 'Carboprost',
      form: 'Injection',
      strength: '125 ug',
      doseUnit: 'mL',
      route: 'Intramuscular (IM)'
    },
    {
      id: 30,
      name: 'Pentazocin Chloride',
      form: 'Injection',
      strength: '30 mg/mL',
      doseUnit: 'mL',
      route: 'Intramuscular (IM)'
    },
    {
      id: 31,
      name: 'Promethazine',
      form: 'Injection',
      strength: '25 mg/mL',
      doseUnit: 'mL',
      route: 'Intravenous (IV)'
    },
    {
      id: 32,
      name: 'Oxytocin',
      form: 'Injection',
      strength: '5 IU/mL',
      doseUnit: 'mL',
      route: 'IV Infusion'
    },
    {
      id: 33,
      name: 'Oxytocin',
      form: 'Injection',
      strength: '10 IU/mL',
      doseUnit: 'mL',
      route: 'IV Infusion'
    },
    {
      id: 34,
      name: 'Ringer Lactate',
      form: 'IV Fluid',
      strength: '-',
      doseUnit: 'mL',
      route: 'IV Infusion'
    },
    {
      id: 35,
      name: 'Normal Saline',
      form: 'IV Fluid',
      strength: '0.9%',
      doseUnit: 'mL',
      route: 'IV Infusion'
    },
    {
      id: 36,
      name: 'Dextrose (D5)',
      form: 'IV Fluid',
      strength: '5%',
      doseUnit: 'mL',
      route: 'IV Infusion'
    },
    {
      id: 37,
      name: 'Ceftriaxone',
      form: 'Injection',
      strength: '500 mg',
      doseUnit: 'mL',
      route: 'Intravenous (IV)'
    },
    {
      id: 38,
      name: 'Ceftriaxone',
      form: 'Injection',
      strength: '1000 mg',
      doseUnit: 'mL',
      route: 'Intravenous (IV)'
    },
    {
      id: 39,
      name: 'Ceftriaxone',
      form: 'Injection',
      strength: '2000 mg',
      doseUnit: 'mL',
      route: 'Intravenous (IV)'
    },
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
    // this.drugNameList = this.drugNameList.concat(medicines);

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
          let med = this.medicines.find(m => m.name === medicine[1] && m.form === medicine[0] && m.strength === medicine[2] && m.route === medicine[5] && m.doseUnit === medicine[3].split('::')[1]);
          let itemToAdd = new FormGroup({
            id: new FormControl(this.data.medicines[x].uuid),
            typeOfMedicine: new FormControl((medicine[0])? medicine[0] : null, [Validators.required, Validators.maxLength(15)]),
            medicineObj: new FormControl((med)? med : { label: medicine[1] }, [Validators.required]),
            medicineName: new FormControl((medicine[1])? medicine[1] : null, [Validators.required, Validators.maxLength(100)]),
            strength: new FormControl((medicine[2])? medicine[2] : null, [Validators.required, Validators.maxLength(15)]),
            dosage: new FormControl((medicine[3])? medicine[3].includes('::') ? medicine[3].split('::')[0] : null : null, [Validators.required, Validators.maxLength(10)]),
            dosageUnit: new FormControl((medicine[3])? medicine[3].includes('::') ? medicine[3].split('::')[1] : null : null, [Validators.required, Validators.maxLength(10)]),
            frequency: new FormControl((medicine[4])? medicine[4] : null, [Validators.required, Validators.maxLength(25)]),
            routeOfMedicine: new FormControl((medicine[5])? medicine[5] : null, [Validators.required, Validators.maxLength(25)]),
            duration: new FormControl((medicine[6])? medicine[6].includes('::') ? medicine[6].split('::')[0] : null : null, [Validators.required, Validators.maxLength(15)]),
            durationUnit: new FormControl((medicine[6])? medicine[6].includes('::') ? medicine[6].split('::')[1] : null : null, [Validators.required, Validators.maxLength(15)]),
            remark: new FormControl((medicine.length === 8)? medicine[7] : null, [Validators.maxLength(15)]),
            isDeleted: new FormControl(false),
            index: new FormControl(-1)
          });
          itemToAdd.get('medicineObj').valueChanges.subscribe((val: any) => {
            if (val.id) {
              // const index = this.fm.value.findIndex(m => m.medicineObj.id === val.id && m.medicineObj.name === val.name);
              itemToAdd.patchValue({
                medicineName: val.name,
                typeOfMedicine: val.form,
                strength: val.strength,
                dosageUnit: val.doseUnit,
                routeOfMedicine: val.route
              });
            } else {
              // const index = this.fm.value.findIndex(m => m.medicineObj.label === val.label);
              itemToAdd.patchValue({
                medicineName: val.label
              });
            }
          });
          this.fm.push(itemToAdd);
          // this.fm.push(new FormGroup({
          //   id: new FormControl(this.data.medicines[x].uuid),
          //   medicineName: new FormControl((medicine[0])? medicine[0] : null, [Validators.required, Validators.maxLength(100)]),
          //   strength: new FormControl((medicine[1])? medicine[1] : null, [Validators.required, Validators.maxLength(10)]),
          //   dosage: new FormControl((medicine[2])? medicine[2].includes('::') ? medicine[2].split('::')[0] : null : null, [Validators.required, Validators.maxLength(15)]),
          //   dosageUnit: new FormControl((medicine[2])? medicine[2].includes('::') ? medicine[2].split('::')[1] : medicine[2].split('::')[0] : null, [Validators.required, Validators.maxLength(15)]),
          //   duration: new FormControl((medicine[3])? medicine[3] : null, [Validators.required, Validators.maxLength(30)]),
          //   typeOfMedicine: new FormControl((medicine[4])? medicine[4] : null, [Validators.required, Validators.maxLength(25)]),
          //   routeOfMedicine: new FormControl((medicine[5])? medicine[5] : null, [Validators.required, Validators.maxLength(25)]),
          //   isDeleted: new FormControl(false),
          //   index: new FormControl(x)
          // }));
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
    // this.fm.push(new FormGroup({
    //   id: new FormControl(null),
    //   medicineName: new FormControl(null, [Validators.required, Validators.maxLength(100)]),
    //   strength: new FormControl(null, [Validators.required, Validators.maxLength(10)]),
    //   dosage: new FormControl(null, [Validators.required, Validators.maxLength(10)]),
    //   dosageUnit: new FormControl(null, [Validators.required, Validators.maxLength(10)]),
    //   duration: new FormControl(null, [Validators.required, Validators.maxLength(15)]),
    //   typeOfMedicine: new FormControl(null, [Validators.required, Validators.maxLength(15)]),
    //   routeOfMedicine: new FormControl(null, [Validators.required, Validators.maxLength(15)]),
    //   isDeleted: new FormControl(false),
    //   index: new FormControl(-1)
    // }));
    let itemToAdd = new FormGroup({
      id: new FormControl(null),
      typeOfMedicine: new FormControl(null, [Validators.required, Validators.maxLength(15)]),
      medicineObj: new FormControl(null, [Validators.required]),
      medicineName: new FormControl(null, [Validators.required, Validators.maxLength(100)]),
      strength: new FormControl(null, [Validators.required, Validators.maxLength(15)]),
      dosage: new FormControl(null, [Validators.required, Validators.maxLength(10)]),
      dosageUnit: new FormControl(null, [Validators.required, Validators.maxLength(10)]),
      frequency: new FormControl(null, [Validators.required, Validators.maxLength(25)]),
      routeOfMedicine: new FormControl(null, [Validators.required, Validators.maxLength(25)]),
      duration: new FormControl(null, [Validators.required, Validators.maxLength(15)]),
      durationUnit: new FormControl(null, [Validators.required, Validators.maxLength(15)]),
      remark: new FormControl(null, [Validators.maxLength(15)]),
      isDeleted: new FormControl(false),
      index: new FormControl(-1)
    });
    itemToAdd.get('medicineObj').valueChanges.subscribe((val: any) => {
      if (val.id) {
        // const index = this.fm.value.findIndex(m => m.medicineObj.id === val.id && m.medicineObj.name === val.name);
        itemToAdd.patchValue({
          medicineName: val.name,
          typeOfMedicine: val.form,
          strength: val.strength,
          dosageUnit: val.doseUnit,
          routeOfMedicine: val.route
        });
      } else {
        // const index = this.fm.value.findIndex(m => m.medicineObj.label === val.label);
        itemToAdd.patchValue({
          medicineName: val.label
        });
      }
    });
    this.fm.push(itemToAdd);
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

  addStrengthTag(tag: string) {
    return tag;
  }

}
