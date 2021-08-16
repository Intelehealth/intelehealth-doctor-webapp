import { Component, OnInit } from '@angular/core';
import { EncounterService } from 'src/app/services/encounter.service';
import { ActivatedRoute } from '@angular/router';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { DiagnosisService } from 'src/app/services/diagnosis.service';
import { DatePipe } from '@angular/common';
import { transition, trigger, style, animate, keyframes } from '@angular/animations';
import { MatSnackBar } from '@angular/material/snack-bar';
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
  referralStatus: any= []
  urgentStatus: any = [];
  conceptReferral = '680bf71f-2cab-441a-9ebc-3fa3f47d0acd';
  conceptUrgent = 'fb5ca23c-d986-480d-9439-2b3addf125fd';
  encounterUuid: string;
  patientId: string;
  visitUuid: string;
  errorText: string;

  referralForm = new FormGroup({
    referral: new FormControl('', [Validators.required]),
  });

  urgentForm = new FormGroup({
    urgent: new FormControl('', [Validators.required]),
  });

  constructor(private service: EncounterService,
    private diagnosisService: DiagnosisService,
    private snackbar: MatSnackBar,
    private route: ActivatedRoute,
    private datepipe: DatePipe) { }

  ngOnInit() {
    this.visitUuid = this.route.snapshot.paramMap.get('visit_id');
    this.patientId = this.route.snapshot.params['patient_id'];
    this.diagnosisService.getObs(this.patientId, this.conceptReferral)
      .subscribe(response => {
        response.results.forEach(obs => {
          if (obs.encounter.visit.uuid === this.visitUuid) {
            this.referralStatus.push(obs);
          }
        });
      });
    this.diagnosisService.getObs(this.patientId, this.conceptUrgent)
      .subscribe(response => {
        response.results.forEach(obs => {
          if (obs.encounter.visit.uuid === this.visitUuid) {
            this.urgentStatus.push(obs);
          }
        });
      });
  }

  Submit() {
    const date= new Date();
    const formReferral = this.referralForm.value;
    const valueReferral = formReferral.referral;
    const formUrgent = this.urgentForm.value;
    const valueUrgent = formUrgent.urgent;
    
    const providerDetails = getFromStorage('provider');
    const providerUuid = providerDetails.uuid;
    if (providerDetails && providerUuid === getEncounterProviderUUID()) {
      this.encounterUuid = getEncounterUUID();
      const json = {
        concept: this.conceptReferral,
        person: this.patientId,
        obsDatetime: date,
        value: valueReferral,
        encounter: this.encounterUuid
      };
      this.service.postObs(json)
        .subscribe(resp => {
          this.referralStatus.push({ uuid: resp.uuid, value: json.value });
        });

      const jsonUrgent = {
        concept: this.conceptUrgent,
        person: this.patientId,
        obsDatetime: date,
        value: valueUrgent,
        encounter: this.encounterUuid
      };
      this.service.postObs(jsonUrgent)
        .subscribe(resp => {
          this.referralStatus.push({ uuid: resp.uuid, value: jsonUrgent.value });
        });
    } else { this.snackbar.open('Another doctor is viewing this case', null, { duration: 4000 }); }
  }

  delete(i) {
    const uuid = this.referralStatus[i].uuid;
    this.diagnosisService.deleteObs(uuid)
      .subscribe(res => {
        this.referralStatus.splice(i, 1);
      });
    const uuid1 = this.urgentStatus[i].uuid1;
    this.diagnosisService.deleteObs(uuid1)
      .subscribe(res => {
        this.urgentStatus.splice(i, 1);
      });
  }

}
