import { Component, EventEmitter, OnInit, Output } from "@angular/core";
import { EncounterService } from "src/app/services/encounter.service";
import { ActivatedRoute } from "@angular/router";
import { DiagnosisService } from "../../../services/diagnosis.service";
import { debounceTime, distinctUntilChanged, map } from "rxjs/operators";
import { Observable } from "rxjs";
// import { FormGroup, FormControl, Validators } from "@angular/forms";
import {
  transition,
  trigger,
  style,
  animate,
  keyframes,
} from "@angular/animations";
import medicines from "./medicines";
declare var getEncounterUUID: any;

@Component({
  selector: "app-prescribed-medication",
  templateUrl: "./prescribed-medication.component.html",
  styleUrls: ["./prescribed-medication.component.css"],
  animations: [
    trigger("moveInLeft", [
      transition("void=> *", [
        style({ transform: "translateX(300px)" }),
        animate(
          200,
          keyframes([
            style({ transform: "translateX(300px)" }),
            style({ transform: "translateX(0)" }),
          ])
        ),
      ]),
      transition("*=>void", [
        style({ transform: "translateX(0px)" }),
        animate(
          100,
          keyframes([
            style({ transform: "translateX(0px)" }),
            style({ transform: "translateX(300px)" }),
          ])
        ),
      ]),
    ]),
  ],
})
export class PrescribedMedicationComponent implements OnInit {
  @Output() isDataPresent = new EventEmitter<boolean>();
  meds: any = [];
  patientId: string;
  visitUuid: string;
  // add = false;
  // encounterUuid: string;
  conceptPrescription = [];
  // conceptDose = [];
  // conceptfrequency = [];
  // conceptAdministration = [];
  // conceptDurationUnit = [];
  prescTypes = [
    { label: 'Early Morning', hiLabel: 'बहुत सवेरे', key: 'earlyMorning', sortId: 1 },
    { label: 'Breakfast', hiLabel: 'नाश्ता', key: 'breakfast', sortId: 2 },
    { label: 'Mid Morning', hiLabel: 'सुबह के दौरान', key: 'midMorning', sortId: 3 },
    { label: 'Lunch', hiLabel: 'दिन का खाना', key: 'lunch', sortId: 4 },
    { label: 'Evening Snack', hiLabel: 'शाम का नाश्ता', key: 'eveningSnack', sortId: 5 },
    { label: 'Dinner', hiLabel: 'रात का खाना', key: 'dinner', sortId: 6 },
    { label: 'Bed Time', hiLabel: 'सोने के समय', key: 'bedTime', sortId: 7 }
  ];

  units = [
    'tablespoon',
    'grams',
    'ml',
    'small cup',
    'small bowl',
    'big bowl',
    'glass',
    'teaspoon'
  ]

  earlyMorning = [{
    value: '',
    unit: '',
    qty: ''
  }]

  breakfast = [{
    value: '',
    unit: '',
    qty: ''
  }]

  midMorning = [{
    value: '',
    unit: '',
    qty: ''
  }]

  lunch = [{
    value: '',
    unit: '',
    qty: ''
  }]

  eveningSnack = [{
    value: '',
    unit: '',
    qty: ''
  }]

  dinner = [{
    value: '',
    unit: '',
    qty: ''
  }]

  bedTime = [{
    value: '',
    unit: '',
    qty: ''
  }]

  conceptMed = "c38c0c50-2fd2-4ae3-b7ba-7dd25adca4ca";

  // medForm = new FormGroup({
  //   med: new FormControl("", [Validators.required]),
  //   dose: new FormControl("", Validators.min(0)),
  //   unit: new FormControl("", [Validators.required]),
  //   amount: new FormControl("", Validators.min(1)),
  //   unitType: new FormControl("", [Validators.required]),
  //   frequency: new FormControl("", [Validators.required]),
  //   route: new FormControl(""),
  //   reason: new FormControl(""),
  //   duration: new FormControl("", Validators.min(1)),
  //   durationUnit: new FormControl("", [Validators.required]),
  //   additional: new FormControl(""),
  // });

  constructor(
    private service: EncounterService,
    private diagnosisService: DiagnosisService,
    private route: ActivatedRoute
  ) { }

  searchUnits = (text$: Observable<string>) =>
    text$.pipe(
      debounceTime(200),
      distinctUntilChanged(),
      map((term) =>
        term.length < 1
          ? []
          : this.units
            .filter((v) => v.toLowerCase().indexOf(term.toLowerCase()) > -1)
            .slice(0, 10)
      )
    );

  searchEarlyMorning = (text$: Observable<string>) =>
    text$.pipe(
      debounceTime(200),
      distinctUntilChanged(),
      map((term) =>
        term.length < 1
          ? []
          : medicines.earlyMorning
            .filter((v) => v.toLowerCase().indexOf(term.toLowerCase()) > -1)
            .slice(0, 10)
      )
    );

  searchBreakfast = (text$: Observable<string>) =>
    text$.pipe(
      debounceTime(200),
      distinctUntilChanged(),
      map((term) =>
        term.length < 1
          ? []
          : medicines.breakfast
            .filter((v) => v.toLowerCase().indexOf(term.toLowerCase()) > -1)
            .slice(0, 10)
      )
    );

  searchMidMorning = (text$: Observable<string>) =>
    text$.pipe(
      debounceTime(200),
      distinctUntilChanged(),
      map((term) =>
        term.length < 1
          ? []
          : medicines.midMorning
            .filter((v) => v.toLowerCase().indexOf(term.toLowerCase()) > -1)
            .slice(0, 10)
      )
    );

  searchLunch = (text$: Observable<string>) =>
    text$.pipe(
      debounceTime(200),
      distinctUntilChanged(),
      map((term) =>
        term.length < 1
          ? []
          : medicines.lunch
            .filter((v) => v.toLowerCase().indexOf(term.toLowerCase()) > -1)
            .slice(0, 10)
      )
    );

  searchEveningSnack = (text$: Observable<string>) =>
    text$.pipe(
      debounceTime(200),
      distinctUntilChanged(),
      map((term) =>
        term.length < 1
          ? []
          : medicines.eveningSnack
            .filter((v) => v.toLowerCase().indexOf(term.toLowerCase()) > -1)
            .slice(0, 10)
      )
    );

  searchDinner = (text$: Observable<string>) =>
    text$.pipe(
      debounceTime(200),
      distinctUntilChanged(),
      map((term) =>
        term.length < 1
          ? []
          : medicines.dinner
            .filter((v) => v.toLowerCase().indexOf(term.toLowerCase()) > -1)
            .slice(0, 10)
      )
    );

  searchBedTime = (text$: Observable<string>) =>
    text$.pipe(
      debounceTime(200),
      distinctUntilChanged(),
      map((term) =>
        term.length < 1
          ? []
          : medicines.bedTime
            .filter((v) => v.toLowerCase().indexOf(term.toLowerCase()) > -1)
            .slice(0, 10)
      )
    );


  // searchFrequency = (text$: Observable<string>) =>
  //   text$.pipe(
  //     debounceTime(200),
  //     distinctUntilChanged(),
  //     map((term) =>
  //       term.length < 1
  //         ? []
  //         : this.conceptfrequency
  //           .filter((v) => v.toLowerCase().indexOf(term.toLowerCase()) > -1)
  //           .slice(0, 10)
  //     )
  //   );

  // searchAdministration = (text$: Observable<string>) =>
  //   text$.pipe(
  //     debounceTime(200),
  //     distinctUntilChanged(),
  //     map((term) =>
  //       term.length < 1
  //         ? []
  //         : this.conceptAdministration
  //           .filter((v) => v.toLowerCase().indexOf(term.toLowerCase()) > -1)
  //           .slice(0, 10)
  //     )
  //   );

  // searchDose = (text$: Observable<string>) =>
  //   text$.pipe(
  //     debounceTime(200),
  //     distinctUntilChanged(),
  //     map((term) =>
  //       term.length < 1
  //         ? []
  //         : this.conceptDose
  //           .filter((v) => v.toLowerCase().indexOf(term.toLowerCase()) > -1)
  //           .slice(0, 10)
  //     )
  //   );

  // durationUnit = (text$: Observable<string>) =>
  //   text$.pipe(
  //     debounceTime(200),
  //     distinctUntilChanged(),
  //     map((term) =>
  //       term.length < 1
  //         ? []
  //         : this.conceptDurationUnit
  //           .filter((v) => v.toLowerCase().indexOf(term.toLowerCase()) > -1)
  //           .slice(0, 10)
  //     )
  //   );

  ngOnInit() {
    // this.init();
    this.conceptPrescription = this.conceptPrescription.concat(medicines);
    this.visitUuid = this.route.snapshot.paramMap.get("visit_id");
    this.patientId = this.route.snapshot.params["patient_id"];
    this.diagnosisService
      .getObs(this.patientId, this.conceptMed)
      .subscribe((response) => {
        response.results.forEach((obs) => {
          if (obs.encounter.visit.uuid === this.visitUuid) {
            const data = this.parse(obs.value);
            const sortId = this.prescTypes.find(pt => pt.label === data?.en?.meal_type)?.sortId;
            obs.sortId = sortId;
            this.meds.push(obs);
          }
        });
        this.setJsonData();
      });
  }

  // init(){
  //   const prescriptionUuid = "c25ea0e9-6522-417f-97ec-6e4b7a615254";
  //   this.conceptPrescription = this.conceptPrescription.concat(medicines);
  //   const doseUnit = "162384AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA";
  //   this.diagnosisService.concept(doseUnit).subscribe((res) => {
  //     const result = res.setMembers;
  //     result.forEach((ans) => {
  //       this.conceptDose.push(ans.display);
  //     });
  //   });
  //   const frequency = "9847b24f-8434-4ade-8978-157184c435d2";
  //   this.diagnosisService.concept(frequency).subscribe((res) => {
  //     const result = res.setMembers;
  //     result.forEach((ans) => {
  //       this.conceptfrequency.push(ans.display);
  //     });
  //   });
  //   const RouteOfAdministration = "162394AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA";
  //   this.diagnosisService.concept(RouteOfAdministration).subscribe((res) => {
  //     const result = res.setMembers;
  //     result.forEach((ans) => {
  //       this.conceptAdministration.push(ans.display);
  //     });
  //   });
  //   const conceptDurationUnit = "1732AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA";
  //   this.diagnosisService.concept(conceptDurationUnit).subscribe((res) => {
  //     const result = res.setMembers;
  //     result.forEach((ans) => {
  //       this.conceptDurationUnit.push(ans.display);
  //     });
  //   });
  // }

  // onSubmit() {
  //   const date = new Date();
  //   const value = this.prescription;
  //   // tslint:disable-next-line:max-line-length
  //   var insertValue = `${value.med}: ${value.dose} ${value.unit}, ${value.amount} ${value.unitType} ${value.frequency}`;
  //   if (value.route) {
  //     insertValue = `${insertValue} (${value.route})`;
  //   }
  //   if (value.reason) {
  //     insertValue = `${insertValue} ${value.reason}`;
  //   }
  //   insertValue = `${insertValue} for ${value.duration} ${value.durationUnit}`;
  //   if (value.additional) {
  //     insertValue = `${insertValue} ${value.additional}`;
  //   } else {
  //     insertValue = `${insertValue}`;
  //   }
  //   if (this.diagnosisService.isSameDoctor()) {
  //     this.encounterUuid = getEncounterUUID();
  //     const json = {
  //       concept: this.conceptMed,
  //       person: this.patientId,
  //       obsDatetime: date,
  //       value: insertValue,
  //       encounter: this.encounterUuid,
  //     };
  //     this.service.postObs(json).subscribe((response) => {
  //       this.isDataPresent.emit(true);
  //       this.meds.push({ uuid: response.uuid, value: insertValue });
  //       this.add = false;
  //     });
  //   }
  // }

  invalid(opt) {
    return opt.value && opt.unit && opt.qty ? false : true;
  }

  get isInvalid() {
    let hasValue = false;
    this.prescTypes.forEach(type => {
      const data = this[type.key].filter(opt => !this.invalid(opt));
      if (data.length) {
        hasValue = true
      }
    });
    return hasValue;
  }

  submit() {
    if (this.diagnosisService.isSameDoctor()) {
      this.prescTypes.forEach(type => {
        const data = this[type.key].filter(opt => !this.invalid(opt));
        if (data.length) {
          let dataObj = {
            en: { meal_type: type.label, data: [] },
            hi: { meal_type: type.hiLabel, data: [], },
          }

          data.forEach(dietValue => {
            let arr = dietValue.value.split('||');
            let enValue = '', hiValue = '';
             for(let i=0; i<arr.length; i++) {
               if(arr.length === 2) {
                if(i%2==0) enValue =  arr[i];
                if(i%2==1) hiValue =  arr[i];
               } else {
                if(arr[i].toLowerCase().includes('or')) {
                  let a = arr[i].split('or');
                    enValue = enValue + ' or ' + a[1] ;
                    hiValue = a[0] + ' अथवा ' + hiValue ;
                 } else if(arr[i].toLowerCase().includes('and')) {
                  let a = arr[i].split('and');
                    enValue = enValue + ' and ' + a[1] ;
                    hiValue = a[0] + ' और ' + hiValue ;
                 } else {
                   if(i == 2) {
                     hiValue = hiValue + arr[i] ;
                   } else {
                    if(i%2==1) {
                      hiValue = hiValue + arr[i] ;
                    }
                    if(i%2==0) {
                      enValue =  enValue + ',' + arr[i];
                    }
                   }
                 }
               }
             }
            dataObj.en.data.push({ value:  enValue.replace(/^,/, '').trim(), unit: dietValue.unit, qty: dietValue.qty });
            dataObj.hi.data.push({ value:  hiValue.replace(/,\s*$/, "").trim(), unit: dietValue.unit, qty: dietValue.qty });
          });

          const value = JSON.stringify(dataObj);

          const json = {
            concept: this.conceptMed,
            person: this.patientId,
            obsDatetime: new Date(),
            value,
            encounter: getEncounterUUID(),
          };
          this.service.postObs(json).subscribe((response) => {
            this.isDataPresent.emit(true);
            const sortId = this.prescTypes.find(pt => pt.label === dataObj?.en?.meal_type)?.sortId;
            this.meds.push({ uuid: response.uuid, value,sortId:sortId });
            this.setJsonData(true);
            this.clearFields(type.key);
          });

        }
      });
    }
  }

  parse(value) {
    try {
      return JSON.parse(value);
    } catch (error) {
      return value;
    }
  }

  setJsonData(flag?) {
    let meds = [];
    this.meds.forEach((med) => {
      const data = this.parse(med.value);
      let sortId;
      if(flag) {
        this.prescTypes.forEach(type => {
          if(med.value.includes(type.label)) {
            sortId = type.sortId;
          }
        })
      } else {
        sortId = this.prescTypes.find(pt => pt.label === data?.en?.meal_type)?.sortId;
      }
      if (data instanceof Object) {

        let value = `${data.en.meal_type}(${data.hi.meal_type}) :\n`;
        data.en.data.forEach((enData, idx) => {
          const hiData = data.hi.data[idx];

          const val = hiData && hiData.value ? `, ${hiData.value}` : '';
          value += `${idx + 1}. ${enData.value}${val} - ${enData.qty || ''} ${enData.unit || ''}\n`

        });
        meds.unshift({ value, uuid: med.uuid, sortId });

      } else {
        meds.unshift({ value: data, uuid: med.uuid, sortId });
      }
    });
    meds = meds.sort((a, b) => a.sortId - b.sortId).map(({ sortId, ...rest }) => rest);
    this.meds = meds;
  }

  delete(i) {
    if (this.diagnosisService.isSameDoctor()) {
      const uuid = this.meds[i].uuid;
      this.diagnosisService.deleteObs(uuid).subscribe((res) => {
        this.meds.splice(i, 1);
        if (this.meds.length === 0) {
          this.isDataPresent.emit(false);
        }
      });
    }
  }

  add(optArr, type) {
    // if (!this.invalid(opt)) {
    //   const value = `${type}: ${opt.value}, ${opt.qty || ''} ${opt.unit || ''}`
    //   this.submit(value);
    // }
    if (!this.invalid(optArr[0])) {
      optArr.unshift({
        value: '',
        qty: '',
        unit: ''
      })
    }
  }

  clearFields(key) {
    this[key] = [{ value: '', qty: '', unit: '' }];
    // this.earlyMorning = [{ value: '', qty: '', unit: '' }];
    // this.breakfast = [{ value: '', qty: '', unit: '' }];
    // this.midMorning = [{ value: '', qty: '', unit: '' }];
    // this.lunch = [{ value: '', qty: '', unit: '' }];
    // this.eveningSnack = [{ value: '', qty: '', unit: '' }];
    // this.dinner = [{ value: '', qty: '', unit: '' }];
    // this.bedTime = [{ value: '', qty: '', unit: '' }];
  }

  remove(arr, i) {
    arr.splice(i, 1);
  }
}
