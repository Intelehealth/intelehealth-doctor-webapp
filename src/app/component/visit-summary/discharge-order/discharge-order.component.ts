import { Component, Input, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { EncounterService } from 'src/app/services/encounter.service';
import { DiagnosisService } from '../../../services/diagnosis.service';
import { transition, trigger, style, animate, keyframes } from '@angular/animations';
declare var getEncounterUUID: any, getFromStorage: any;
import * as moment from 'moment';
import { MatSnackBar } from '@angular/material/snack-bar';
import { SessionService } from 'src/app/services/session.service';

@Component({
  selector: 'app-discharge-order',
  templateUrl: './discharge-order.component.html',
  styleUrls: ['./discharge-order.component.css'],
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
export class DischargeOrderComponent implements OnInit {

  @Input() isManagerRole: boolean;
  @Input() visitCompleted: boolean;
  dischargeOrders: any = [];
  encounterUuid: string;
  patientId: string;
  visitUuid: string;
  conceptDischargeOrder = 'b682c5de-bcac-4e70-a6d9-789034194d99';

  dischargeOrderForm = new FormGroup({
    dischargeOrder: new FormControl('', [Validators.required])
  });

  constructor(private service: EncounterService,
    private diagnosisService: DiagnosisService,
    private route: ActivatedRoute,
    private snackbar: MatSnackBar,
    private sessionSvc:SessionService) { }

  ngOnInit(): void {
    this.visitUuid = this.route.snapshot.paramMap.get('visit_id');
    this.patientId = this.route.snapshot.params['patient_id'];
    this.diagnosisService.getObs(this.patientId, this.conceptDischargeOrder)
      .subscribe(response => {
        response.results.forEach(async obs => {
          if (obs.encounter.visit.uuid === this.visitUuid) {
              obs.regNo = await this.sessionSvc.getRegNo(obs.creator.uuid);

              this.dischargeOrders.push(this.diagnosisService.getData(obs));
          }
        });
      });
  }

  Submit() {
    const date = new Date();
    const form = this.dischargeOrderForm.value;
    const value = form.dischargeOrder;
    if (this.dischargeOrders.filter(o => o.value.toLowerCase() == value.toLowerCase()).length > 0) {
      this.snackbar.open("Can't add, this entry already exists!", null, { duration: 4000 });
      return;
    }
    if (this.diagnosisService.isEncounterProvider()) {
      this.encounterUuid = getEncounterUUID();
      const json = {
        concept: this.conceptDischargeOrder,
        person: this.patientId,
        obsDatetime: date,
        value: this.getObj(value),
        encounter: this.encounterUuid
      };
      this.service.postObs(json)
        .subscribe(resp => {
          const user = getFromStorage("user");
          this.dischargeOrders.push({ uuid: resp.uuid, value: value, obsDatetime: resp.obsDatetime, regNo:`(${getFromStorage("registrationNumber")})`, creator: { uuid: user.uuid, person: user.person } });
        });
    }
  }

  delete(i) {
    if (this.diagnosisService.isEncounterProvider()) {
      const observation = this.dischargeOrders[i];
      const uuid = observation.uuid;
      if (observation.comment) {
        console.log("Can't delete, already deleted")
      } else {
        // if (observation.creator.uuid == getFromStorage("user").uuid) {
        //   this.diagnosisService.deleteObs(uuid)
        //   .subscribe(() => {
        //     this.dischargeOrders.splice(i, 1);
        //   });
        // } else {
          const provider = getFromStorage("provider");
          const registrationNumber = observation.regNo.replace('(', "").replace(')', "");
          const deletedTimestamp = moment.utc().toISOString();
          const prevCreator = observation?.creator?.person?.display;
          this.diagnosisService.updateObs(uuid, { comment: `DELETED|${deletedTimestamp}|${provider?.person?.display}${registrationNumber?'|'+registrationNumber:'|NA'}|${prevCreator}` })
          .subscribe(() => {
            this.dischargeOrders[i] = {...this.dischargeOrders[i], comment: `DELETED|${deletedTimestamp}|${provider?.person?.display}${registrationNumber?'|'+registrationNumber:'|NA'}|${prevCreator}` };
          });
        // }
      }
    }
  }

  getLang() {
    return localStorage.getItem("selectedLanguage");
  }

  getObj(value) {
    let value1 = {
      // "ar": localStorage.getItem('selectedLanguage') === 'ar' ? value : "غير متوفر",
      // "en": localStorage.getItem('selectedLanguage') === 'en' ? value : "NA"
      "ar": value,
      "en": value
    }
    return JSON.stringify(value1);
  }
}
