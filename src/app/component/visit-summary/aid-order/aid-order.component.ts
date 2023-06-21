import { Component, Input, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute } from '@angular/router';
import { DiagnosisService } from 'src/app/services/diagnosis.service';
import { EncounterService } from 'src/app/services/encounter.service';
import { transition, trigger, style, animate, keyframes } from '@angular/animations';
import { MatSelect } from '@angular/material/select';
declare var getEncounterUUID: any;

@Component({
  selector: 'app-aid-order',
  templateUrl: './aid-order.component.html',
  styleUrls: ['./aid-order.component.css'],
  animations: [
    trigger('moveInLeft', [
      transition('void=> *', [style({ transform: 'translateX(300px)' }),
      animate(200, keyframes([
        style({ transform: 'translateX(300px)' }),
        style({ transform: 'translateX(0)' })
      ]))]),
      transition('*=>void', [style({ transform: 'translateX(0px)' }),
      animate(100, keyframes([
        style({ transform: 'translateX(0px)' }),
        style({ transform: 'translateX(300px)' })
      ]))])
    ])
  ],
  encapsulation: ViewEncapsulation.None
})
export class AidOrderComponent implements OnInit {

  @Input() isManagerRole : boolean;
  medicalEquipmentsList: string[]= [
    'Nebulizer',
    'Oxygen container',
    'Cane',
    'Wheel chair',
    'Hospital bed',
    'Others'
  ];

  freeMedicalEquipmentsList: string[]= [
    'Stents',
    'Baloons',
    'Others'
  ];
  aidOrderForm: FormGroup;
  conceptAidOrder: string = 'a9f7d0af-7be9-47c2-bde4-fce5eff4503f';
  conceptType1: string = '27247234-e4aa-4139-a34c-c0494e40719b';
  conceptType2: string = 'f6cddc5b-974a-419d-a4d5-6a56df3ffb1f';
  conceptType3: string = 'b21c3e01-2272-46b3-91eb-c40896323a8d';
  conceptType4: string = '4d3f1e6e-171d-4b4b-a49f-ef5125788b8c';
  conceptType5: string = '0bf24570-a959-4066-9354-6d553cd6161b';

  visitUuid: string;
  patientId: string;
  encounterUuid: string;
  @ViewChild('type1Select') type1Select: MatSelect;
  @ViewChild('type2Select') type2Select: MatSelect;

  constructor(
    private diagnosisService: DiagnosisService,
    private encounterService: EncounterService,
    private route: ActivatedRoute,
    private snackbar: MatSnackBar) {
    this.aidOrderForm = new FormGroup({
      type1: new FormControl(null),
      type1Uuid: new FormControl(null),
      type1Other: new FormControl(null),
      type2: new FormControl(null),
      type2Uuid: new FormControl(null),
      type2Other: new FormControl(null),
      type3: new FormControl(null),
      type3Uuid: new FormControl(null),
      type4: new FormControl(null),
      type4Uuid: new FormControl(null),
      type5: new FormControl(null),
      type5Uuid: new FormControl(null)
    });
  }

  ngOnInit(): void {
    this.visitUuid = this.route.snapshot.paramMap.get('visit_id');
    this.patientId = this.route.snapshot.params['patient_id'];
    this.formControlValueChanges();
    this.getAidOrders();
  }

  formControlValueChanges() {
    this.aidOrderForm.get('type1').valueChanges.subscribe((val: any) => {
      if (val) {
        if (val.includes('Others')) {
          this.aidOrderForm.get('type1Other').setValidators([Validators.required]);
          this.aidOrderForm.get('type1Other').updateValueAndValidity();
          this.type1Select.close();
        } else {
          this.aidOrderForm.get('type1Other').setValue(null);
          this.aidOrderForm.get('type1Other').clearValidators();
          this.aidOrderForm.get('type1Other').updateValueAndValidity();
        }
      }
    });

    this.aidOrderForm.get('type2').valueChanges.subscribe((val: any) => {
      if (val) {
        if (val.includes('Others')) {
          this.aidOrderForm.get('type2Other').setValidators([Validators.required]);
          this.aidOrderForm.get('type2Other').updateValueAndValidity();
          this.type2Select.close();
        } else {
          this.aidOrderForm.get('type2Other').setValue(null);
          this.aidOrderForm.get('type2Other').clearValidators();
          this.aidOrderForm.get('type2Other').updateValueAndValidity();
        }
      }
    });
  }

  getAidOrders() {
    this.diagnosisService.getObs(this.patientId, this.conceptType1).subscribe((response: any) => {
      response.results.forEach((obs: any) => {
        if (obs.encounter.visit.uuid === this.visitUuid) {
          const value =  JSON.parse(obs?.value);
          const splitVal = value.en.split('||');
          const type1Val = splitVal[0]?.split(',');
          const type1OtherVal = splitVal[1] ? splitVal[1] : null;
          this.aidOrderForm.patchValue({ type1: type1Val, type1Uuid: obs.uuid, type1Other: type1OtherVal });
        }
      });
    });

    this.diagnosisService.getObs(this.patientId, this.conceptType2).subscribe((response: any) => {
      response.results.forEach((obs: any) => {
        if (obs.encounter.visit.uuid === this.visitUuid) {
          const value =  JSON.parse(obs?.value);
          const splitVal = value.en.split('||');
          const type2Val = splitVal[0]?.split(',');
          const type2OtherVal = splitVal[1] ? splitVal[1] : null;
          this.aidOrderForm.patchValue({ type2: type2Val, type2Uuid: obs.uuid, type2Other: type2OtherVal });
        }
      });
    });

    this.diagnosisService.getObs(this.patientId, this.conceptType3).subscribe((response: any) => {
      response.results.forEach((obs: any) => {
        if (obs.encounter.visit.uuid === this.visitUuid) {
          const value =  JSON.parse(obs?.value);
          this.aidOrderForm.patchValue({ type3: value.en, type3Uuid: obs.uuid });
        }
      });
    });

    this.diagnosisService.getObs(this.patientId, this.conceptType4).subscribe((response: any) => {
      response.results.forEach((obs: any) => {
        if (obs.encounter.visit.uuid === this.visitUuid) {
          const value =  JSON.parse(obs?.value);
          this.aidOrderForm.patchValue({ type4: value.en, type4Uuid: obs.uuid });
        }
      });
    });

    this.diagnosisService.getObs(this.patientId, this.conceptType5).subscribe((response: any) => {
      response.results.forEach((obs: any) => {
        if (obs.encounter.visit.uuid === this.visitUuid) {
          const value =  JSON.parse(obs?.value);
          this.aidOrderForm.patchValue({ type5: value.en, type5Uuid: obs.uuid });
        }
      });
    });
  }

  submit() {
    this.encounterUuid = getEncounterUUID();
    const value = { ...this.aidOrderForm.value };
    if (this.diagnosisService.isSameDoctor()) {
      if (value.type1?.length) {
        if (value.type1Uuid) {
          // this.updateObs((value.type1.indexOf('Others') == -1) ? value.type1.toString() : `${value.type1.toString()}||${value.type1Other}`, value.type1Uuid);
        } else {
          this.postObs((value.type1.indexOf('Others') == -1) ? value.type1.toString() : `${value.type1.toString()}||${value.type1Other}`, this.conceptType1, 'type1Uuid');
        }
      } else {
        if (value.type1Uuid) {
          this.deleteObs(value.type1Uuid, 'type1Uuid');
        }
      }

      if (value.type2?.length) {
        if (value.type2Uuid) {
          // this.updateObs((value.type2.indexOf('Others') == -1) ? value.type2.toString() : `${value.type2.toString()}||${value.type2Other}`, value.type2Uuid);
        } else {
          this.postObs((value.type2.indexOf('Others') == -1) ? value.type2.toString() : `${value.type2.toString()}||${value.type2Other}`, this.conceptType2, 'type2Uuid');
        }
      } else {
        if (value.type2Uuid) {
          this.deleteObs(value.type2Uuid, 'type2Uuid');
        }
      }

      if (value.type3) {
        if (value.type3Uuid) {
          // this.updateObs(value.type3, value.type3Uuid);
        } else {
          this.postObs(value.type3, this.conceptType3, 'type3Uuid');
        }
      } else {
        if (value.type3Uuid) {
          this.deleteObs(value.type3Uuid, 'type3Uuid');
        }
      }

      if (value.type4) {
        if (value.type4Uuid) {
          // this.updateObs(value.type4, value.type4Uuid);
        } else {
          this.postObs(value.type4, this.conceptType4, 'type4Uuid');
        }
      } else {
        if (value.type4Uuid) {
          this.deleteObs(value.type4Uuid, 'type4Uuid');
        }
      }

      if (value.type5) {
        if (value.type5Uuid) {
          // this.updateObs(value.type5, value.type5Uuid);
        } else {
          this.postObs(value.type5, this.conceptType5, 'type5Uuid');
        }
      } else {
        if (value.type5Uuid) {
          this.deleteObs(value.type5Uuid, 'type5Uuid');
        }
      }
      this.snackbar.open(`Aid order saved successfully`,null, {duration: 2000});
    }
  }

  postObs(value: string, conceptId: string, key: string) {
    const json = {
      concept: conceptId,
      person: this.patientId,
      obsDatetime: new Date(),
      value: JSON.stringify({ en: value, ar: value }),
      encounter: this.encounterUuid
    };

    this.encounterService.postObs(json).subscribe(response => {
      // console.log(response);
      this.aidOrderForm.get(key).setValue(response.uuid);
    });
  }

  updateObs(value: string, uuid: string) {
    const json = {
      value: JSON.stringify({ en: value, ar: value })
    };

    this.encounterService.updateObs(json, uuid).subscribe(response => {
      // console.log(response);
    });
  }

  deleteObs(uuid: string, key: string) {
    this.encounterService.deleteObs(uuid).subscribe(response => {
      // console.log(response);
      this.aidOrderForm.get(key).setValue(null);
      switch (key) {
        case 'type1Uuid':
          this.aidOrderForm.patchValue({ type1: null, type1Other: null });
          break;
        case 'type2Uuid':
          this.aidOrderForm.patchValue({ type2: null, type2Other: null });
          break;
        case 'type3Uuid':
          this.aidOrderForm.patchValue({ type3: null });
          break;
        case 'type4Uuid':
          this.aidOrderForm.patchValue({ type4: null });
          break;
        case 'type5Uuid':
          this.aidOrderForm.patchValue({ type5: null });
          break;
        default:
          break;
      }
    });
  }

  getLang() {
    return localStorage.getItem("selectedLanguage");
  }

}
