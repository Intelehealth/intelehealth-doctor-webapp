import { trigger, transition, style, animate, keyframes } from '@angular/animations';
import { Component, OnInit } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute } from '@angular/router';
import { DiagnosisService } from 'src/app/services/diagnosis.service';
import { EncounterService } from 'src/app/services/encounter.service';
declare var getEncounterProviderUUID: any, getFromStorage: any, getEncounterUUID: any, checkReview: any;

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
  referralConceptReview1: String = '80c7718e-6022-4d06-b7fb-bea36c061e39';
  referralConceptReview2: String = 'd5d22ecb-3cae-4d45-a49f-16848844bf01';
  urgentConcept: String = 'eb9ffedc-beab-4a3a-b4d4-32344a94214b';
  urgentConceptReview1: String = '5c53e6a1-f9ef-48b3-9ebf-e3b9657c0c38';
  urgentConceptReview2: String = '1655c4eb-e0aa-4e4c-bea9-dbe72619489d';
  encounterUuid: string;
  patientId: string;
  visitUuid: string;
  referral: Boolean = false;
  urgent: Boolean = false;
  referralObs: object = {};
  urgentObs: object = {};
  ReferralLocationConcept: String = '56ed8dca-a028-4108-b42e-6f9fab6f5d9e';
  ReferralLocationConceptReview1: String = 'ecfb84ea-c164-49bb-81b2-942a09510305';
  ReferralLocationConceptReview2: String = '43ef7583-4f67-452c-90b8-a27534b0ec4d';

  referralLocationObs: object = {};
  referralLocation: string;
  ReferralReasonConcept: String = 'de7740d4-1f5c-4c0d-834a-b8de7b5b5458';
  ReferralReasonConceptReview1: String = '9c966a56-26c3-4aa3-8d65-7bd86e38db0a';
  ReferralReasonConceptReview2: String = '12bd2c1a-b0fd-411c-be98-59bcb946e9e4';
  referralReasonObs: object = {};
  referralReason: string;
  referralConcepts = [{ concept: this.referralConcept, name: 'referral' },
  { concept: this.urgentConcept, name: 'urgent' },
  { concept: this.ReferralLocationConcept, name: 'referralLocation' },
  { concept: this.ReferralReasonConcept, name: 'referralReason' }
  ];
  referralConceptsReview1 = [{ concept: this.referralConceptReview1, name: 'referral' },
  { concept: this.urgentConceptReview1, name: 'urgent' },
  { concept: this.ReferralLocationConceptReview1, name: 'referralLocation' },
  { concept: this.ReferralReasonConceptReview1, name: 'referralReason' }
  ];
  referralConceptsReview2 = [{ concept: this.referralConceptReview2, name: 'referral' },
  { concept: this.urgentConceptReview2, name: 'urgent' },
  { concept: this.ReferralLocationConceptReview2, name: 'referralLocation' },
  { concept: this.ReferralReasonConceptReview2, name: 'referralReason' }
  ];
  rightConcept: string;

  constructor(private service: EncounterService,
    private diagnosisService: DiagnosisService,
    private snackbar: MatSnackBar,
    private route: ActivatedRoute) { }

  ngOnInit(): void {
    this.visitUuid = this.route.snapshot.paramMap.get('visit_id');
    this.patientId = this.route.snapshot.params['patient_id'];
    const reviewVisit = checkReview(this.visitUuid);
    this.rightConcept = reviewVisit?.reviewType === 1 ? 'referralConceptsReview1' : reviewVisit?.reviewType === 2 ? 'referralConceptsReview2' : 'referralConcepts';
    this[this.rightConcept].forEach(each => {
      this.diagnosisService.getObs(this.patientId, each.concept)
        .subscribe(response => {
          response.results.forEach(obs => {
            if (obs.encounter.visit.uuid === this.visitUuid) {
              if (obs.value === 'true') {
                this[each.name] = true;
                this[`${each.name}Obs`] = obs;
              } else {
                this[`${each.name}Obs`] = obs;
              }
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
      const concept = type === 'referralLocation' ? this[this.rightConcept][2].concept : type === 'referralReason' ? this[this.rightConcept][3].concept : type === 'referral' ? this[this.rightConcept][0].concept : this[this.rightConcept][1].concept;
      const value = type === 'referralLocation' ? this.referralLocation : type === 'referralReason' ? this.referralReason : type === 'referral' ? this.referral : this.urgent;
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
