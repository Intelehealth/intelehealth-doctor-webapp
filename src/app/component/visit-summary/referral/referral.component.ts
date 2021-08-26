import { trigger, transition, style, animate, keyframes } from '@angular/animations';
import { Component, OnInit } from '@angular/core';
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
  referral: Boolean = false;
  urgent: Boolean = false;
  referralConcept = '3269f1ca-29ae-4b23-b5b9-9db6c1848eb9';
  urgentConcept = 'eb9ffedc-beab-4a3a-b4d4-32344a94214b';
  encounterUuid: string;
  patientId: string;
  visitUuid: string;
  referralObs: object = {};
  urgentObs: object = {};
  constructor(private service: EncounterService,
    private diagnosisService: DiagnosisService,
    private route: ActivatedRoute) { }

  ngOnInit(): void {
    this.visitUuid = this.route.snapshot.paramMap.get('visit_id');
    this.patientId = this.route.snapshot.params['patient_id'];
    this.diagnosisService.getObs(this.patientId, this.referralConcept)
    .subscribe(response => {
      response.results.forEach(obs => {
        if (obs.encounter.visit.uuid === this.visitUuid) {
          if (obs.value === 'true') {
            this.referral = true;
            this.referralObs = obs;
          }
        }
      });
    });
    this.diagnosisService.getObs(this.patientId, this.urgentConcept)
    .subscribe(response => {
      response.results.forEach(obs => {
        if (obs.encounter.visit.uuid === this.visitUuid) {
          if (obs.value === 'true') {
            this.urgent = true;
            this.urgentObs = obs;
          }
        }
      });
    });
  }

  updateValue = (type, value) => {
    this[type] = value;
    this.save(type);
  }

  save = (type) => {
    const date = new Date();
    const providerDetails = getFromStorage('provider');
    const providerUuid = providerDetails.uuid;
    if (providerDetails && providerUuid === getEncounterProviderUUID()) {
      this.encounterUuid = getEncounterUUID();
      const json = {
        concept: type === 'referral' ? this.referralConcept : this.urgentConcept,
        person: this.patientId,
        obsDatetime: date,
        value: type === 'referral' ? this.referral : this.urgent,
        encounter: this.encounterUuid
      };
      this.service.postObs(json).subscribe(response => {
        const data = {
          uuid: response.uuid,
          value: response.value
        };
        this[`${type}Obs`] = data;
      });
    }
  }

  delete(type, uuid) {
    this.diagnosisService.deleteObs(uuid)
      .subscribe(res => {
        this[type] = false;
      });
  }
}
