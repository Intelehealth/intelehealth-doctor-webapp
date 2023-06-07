import { Component, Input, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute } from '@angular/router';
import { DiagnosisService } from 'src/app/services/diagnosis.service';
import { EncounterService } from 'src/app/services/encounter.service';
declare var getEncounterUUID: any;

@Component({
  selector: 'app-aid-order',
  templateUrl: './aid-order.component.html',
  styleUrls: ['./aid-order.component.css']
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
  visitUuid: string;
  patientId: string;
  encounterUuid: string;

  constructor(
    private diagnosisService: DiagnosisService,
    private encounterService: EncounterService,
    private route: ActivatedRoute,
    private snackbar: MatSnackBar) {
    this.aidOrderForm = new FormGroup({
      type1: new FormControl(null),
      type1Uuid: new FormControl(null),
      type1Other: new FormControl(null),
      type1OtherUuid: new FormControl(null),
      type2: new FormControl(null),
      type2Uuid: new FormControl(null),
      type2Other: new FormControl(null),
      type2OtherUuid: new FormControl(null),
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
        } else {
          this.aidOrderForm.get('type2Other').setValue(null);
          this.aidOrderForm.get('type2Other').clearValidators();
          this.aidOrderForm.get('type2Other').updateValueAndValidity();
        }
      }
    });
  }

  getAidOrders() {
    this.diagnosisService.getObs(this.patientId, this.conceptAidOrder).subscribe((response: any) => {
      response.results.forEach((obs: any) => {
        if (obs.encounter.visit.uuid === this.visitUuid) {
          switch (obs?.comment) {
            case 'Type 1. Medical Equipment loan (nebulizer, oxygen container, cane, wheel chair, hospital bed, others)':
              this.aidOrderForm.patchValue({ type1: JSON.parse(obs?.value).en.split(','), type1Uuid: obs.uuid });
              break;
            case 'Other medical equipment loan':
              this.aidOrderForm.patchValue({ type1Other: JSON.parse(obs?.value).en, type1OtherUuid: obs.uuid });
              break;
            case 'Type 2. Free Medical equipment (Stents, baloons, others)':
              this.aidOrderForm.patchValue({ type2: JSON.parse(obs?.value).en.split(','), type2Uuid: obs.uuid });
              break;
            case 'Other free medical equipment':
              this.aidOrderForm.patchValue({ type2Other: JSON.parse(obs?.value).en, type2OtherUuid: obs.uuid });
              break;
            case 'Type 3. Cover medication expenses (amount)':
              this.aidOrderForm.patchValue({ type3: JSON.parse(obs?.value).en, type3Uuid: obs.uuid });
              break;
            case 'Type 4. Cover surgical expenses (amount)':
              this.aidOrderForm.patchValue({ type4: JSON.parse(obs?.value).en, type4Uuid: obs.uuid });
              break;
            case 'Type 5. Cash assistance (amount)':
              this.aidOrderForm.patchValue({ type5: JSON.parse(obs?.value).en, type5Uuid: obs.uuid });
              break;
            default:
              break;
          }
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
          this.updateObs(value.type1.toString(), value.type1Uuid);
        } else {
          this.postObs(value.type1.toString(), 'Type 1. Medical Equipment loan (nebulizer, oxygen container, cane, wheel chair, hospital bed, others)', 'type1Uuid');
        }
      } else {
        if (value.type1Uuid) {
          this.deleteObs(value.type1Uuid, 'type1Uuid');
        }
      }

      if (value.type1Other) {
        if (value.type1OtherUuid) {
          this.updateObs(value.type1Other, value.type1OtherUuid);
        } else {
          this.postObs(value.type1Other, 'Other medical equipment loan', 'type1OtherUuid');
        }
      } else {
        if (value.type1OtherUuid) {
          this.deleteObs(value.type1OtherUuid, 'type1OtherUuid');
        }
      }

      if (value.type2?.length) {
        if (value.type2Uuid) {
          this.updateObs(value.type2.toString(), value.type2Uuid);
        } else {
          this.postObs(value.type2.toString(), 'Type 2. Free Medical equipment (Stents, baloons, others)', 'type2Uuid');
        }
      } else {
        if (value.type2Uuid) {
          this.deleteObs(value.type2Uuid, 'type2Uuid');
        }
      }

      if (value.type2Other) {
        if (value.type2OtherUuid) {
          this.updateObs(value.type2Other, value.type2OtherUuid);
        } else {
          this.postObs(value.type2Other, 'Other free medical equipment', 'type2OtherUuid');
        }
      } else {
        if (value.type2OtherUuid) {
          this.deleteObs(value.type2OtherUuid, 'type2OtherUuid');
        }
      }

      if (value.type3) {
        if (value.type3Uuid) {
          this.updateObs(value.type3, value.type3Uuid);
        } else {
          this.postObs(value.type3, 'Type 3. Cover medication expenses (amount)', 'type3Uuid');
        }
      } else {
        if (value.type3Uuid) {
          this.deleteObs(value.type3Uuid, 'type3Uuid');
        }
      }

      if (value.type4) {
        if (value.type4Uuid) {
          this.updateObs(value.type4, value.type4Uuid);
        } else {
          this.postObs(value.type4, 'Type 4. Cover surgical expenses (amount)', 'type4Uuid');
        }
      } else {
        if (value.type4Uuid) {
          this.deleteObs(value.type4Uuid, 'type4Uuid');
        }
      }

      if (value.type5) {
        if (value.type5Uuid) {
          this.updateObs(value.type5, value.type5Uuid);
        } else {
          this.postObs(value.type5, 'Type 5. Cash assistance (amount)', 'type5Uuid');
        }
      } else {
        if (value.type5Uuid) {
          this.deleteObs(value.type5Uuid, 'type5Uuid');
        }
      }
      this.snackbar.open(`Aid order saved successfully`,null, {duration: 2000});
    }
  }

  postObs(value: string, comment: string, key: string) {
    const json = {
      concept: this.conceptAidOrder,
      person: this.patientId,
      obsDatetime: new Date(),
      value: JSON.stringify({ en: value, ar: value }),
      encounter: this.encounterUuid,
      comment
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
    });
  }

  getLang() {
    return localStorage.getItem("selectedLanguage");
  }

}
