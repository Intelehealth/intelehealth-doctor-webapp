import { trigger, transition, style, animate, keyframes } from '@angular/animations';
import { Component, OnInit } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute } from '@angular/router';
import { DiagnosisService } from 'src/app/services/diagnosis.service';
import { EncounterService } from 'src/app/services/encounter.service';
declare var getEncounterProviderUUID: any, getFromStorage: any, getEncounterUUID: any;

@Component({
  selector: 'app-referral',
  templateUrl: './referral.component.html',
  styleUrls: ['./referral.component.css'],
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
  ]
})
export class ReferralComponent implements OnInit {
  referralConcept: String = '3269f1ca-29ae-4b23-b5b9-9db6c1848eb9';
  referralTimeConcept: String = 'eb9ffedc-beab-4a3a-b4d4-32344a94214b';
  encounterUuid: string;
  patientId: string;
  visitUuid: string;
  referral: String = '';
  referralTime: String = '';
  referralObs: object = {};
  referralTimeObs: object = {};
  // ReferralLocationConcept: String = '56ed8dca-a028-4108-b42e-6f9fab6f5d9e';
  // referralLocationObs: object = {};
  // referralLocation: string;
  // ReferralReasonConcept: String = 'de7740d4-1f5c-4c0d-834a-b8de7b5b5458';
  // referralReasonObs: object = {};
  // referralReason: string;
  coordinator: Boolean = getFromStorage('coordinator') || false;

  constructor(private service: EncounterService,
    private diagnosisService: DiagnosisService,
    private snackbar: MatSnackBar,
    private route: ActivatedRoute) { }

  ngOnInit(): void {
    this.visitUuid = this.route.snapshot.paramMap.get('visit_id');
    this.patientId = this.route.snapshot.params['patient_id'];
    [{concept: this.referralConcept, name: 'referral'},
      {concept: this.referralTimeConcept, name: 'referralTime'},
      // {concept: this.ReferralLocationConcept, name: 'referralLocation'},
      // {concept: this.ReferralReasonConcept, name: 'referralReason'}
    ].forEach(each => {
      this.diagnosisService.getObs(this.patientId, each.concept)
      .subscribe(response => {
        response.results.forEach(obs => {
          if (obs.encounter.visit.uuid === this.visitUuid) {
            this[each.name] = obs.value;
            this[`${each.name}Obs`] = obs;
            console.log(each.name, obs.value)
            console.log(this[`${each.name}Obs`])
          }
        });
      });
    });
  }

  onChangeHandler = (type, value) => {
    this[type] = value;
    this.save(type);
  }

  save = (type) => {
    const date = new Date();
    const providerDetails = getFromStorage('provider');
    const providerUuid = providerDetails.uuid;
    if (providerDetails && providerUuid === getEncounterProviderUUID()) {
      this.encounterUuid = getEncounterUUID();
      // tslint:disable-next-line: max-line-length
      // const concept = type === 'referralLocation' ? this.ReferralLocationConcept : type === 'referralReason' ? this.ReferralReasonConcept : type === 'referral' ? this.referralConcept : this.urgentConcept;
      // tslint:disable-next-line: max-line-length
      // const value = type === 'referralLocation' ? this.referralLocation : type === 'referralReason' ? this.referralReason : type === 'referral' ? this.referral : this.urgent;
      const concept = type === 'referral' ? this.referralConcept : this.referralTimeConcept;
      const value = type === 'referral' ? this.referral : this.referralTime;
      const json = {
        concept,
        person: this.patientId,
        obsDatetime: date,
        value,
        encounter: this.encounterUuid
      };
      this.service.postObs(json).subscribe(response => {
        const data = {
          uuid: response.uuid,
          value: response.value
        };
        this[`${type}Obs`] = data;
      });
    } else { this.snackbar.open('Another doctor is viewing this case', null, { duration: 4000 }); }
  }

  delete(type, uuid) {
    this.diagnosisService.deleteObs(uuid)
      .subscribe(res => {
        if (type === 'referral' || type === 'urgent') {
          this[type] = false;
          this[`${type}Obs`] = {};
        } else {
          this[`${type}Obs`] = {};
        }
      });
  }
}
