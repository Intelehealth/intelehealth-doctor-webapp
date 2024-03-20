import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { EncounterService } from 'src/app/services/encounter.service';
import { DiagnosisService } from '../../../services/diagnosis.service';
import { transition, trigger, style, animate, keyframes } from '@angular/animations';
declare var getEncounterUUID: any, getFromStorage: any;
import * as moment from 'moment';
import { MatSnackBar } from '@angular/material/snack-bar';
import { SessionService } from 'src/app/services/session.service';
import { TranslateService } from '@ngx-translate/core';
import { Observable, Subscription } from 'rxjs';

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
export class DischargeOrderComponent implements OnInit, OnDestroy {

  @Input() isManagerRole: boolean;
  @Input() visitCompleted: boolean;
  dischargeOrders: any = [];
  encounterUuid: string;
  patientId: string;
  visitUuid: string;
  conceptDischargeOrder = 'b682c5de-bcac-4e70-a6d9-789034194d99';

  tempDischarge: any = [];
  tempDischargeDisplay: any = [];
  private eventsSubscription: Subscription;
  @Input() events: Observable<void>;
  
  dischargeOrderForm = new FormGroup({
    dischargeOrder: new FormControl('', [Validators.required])
  });

  constructor(private service: EncounterService,
    private diagnosisService: DiagnosisService,
    private route: ActivatedRoute,
    private snackbar: MatSnackBar,
    private sessionSvc:SessionService,
    private translationService: TranslateService
    ) { }

  ngOnInit(): void {
    this.visitUuid = this.route.snapshot.paramMap.get('visit_id');
    this.patientId = this.route.snapshot.params['patient_id'];
    this.diagnosisService.getObs(this.patientId, this.conceptDischargeOrder)
      .subscribe(response => {
        response.results.forEach(async obs => {
          if (obs.encounter.visit.uuid === this.visitUuid) {
            if (obs.comment) {
              const comment = obs.comment.split('|');
              obs.creatorRegNo = comment[5] != 'NA' ? `(${comment[5]})` : "(-)";
              obs.deletorRegNo = comment[3] != 'NA' ? `(${comment[3]})` : "(-)";
              this.dischargeOrders.push(this.diagnosisService.getData(obs));
            } else {
              obs.creatorRegNo = await this.sessionSvc.getRegNo(obs.creator.uuid);
              this.dischargeOrders.push(this.diagnosisService.getData(obs));
            }
          }
        });
      });
      this.eventsSubscription = this.events.subscribe(() => this.dischargeEvent());
  }

  Submit() {
    const date = new Date();
    const form = this.dischargeOrderForm.value;
    const value = form.dischargeOrder;
    if (this.dischargeOrders.filter(o => o.value.toLowerCase() == value.toLowerCase() && o.comment == null).length > 0) {
      this.translationService.get('messages.cantAdd').subscribe((res: string) => {
        this.snackbar.open(res,null, {duration: 4000,direction: this.txtDirection});
      });
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

      this.tempDischarge.push(json);
      const user = getFromStorage("user");
      this.tempDischargeDisplay.push({ value: value, obsDatetime: date, creatorRegNo:`(${getFromStorage("registrationNumber")})`, creator: { uuid: user.uuid, person: user.person }});

      // this.service.postObs(json)
      //   .subscribe(resp => {
      //     const user = getFromStorage("user");
      //     this.dischargeOrders.push({ uuid: resp.uuid, value: value, obsDatetime: resp.obsDatetime, creatorRegNo:`(${getFromStorage("registrationNumber")})`, creator: { uuid: user.uuid, person: user.person } });
      //   });
    }
  }

  get txtDirection() {
    return localStorage.getItem("selectedLanguage") === 'ar' ? "rtl" : "ltr";
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
          const deletorRegistrationNumber = getFromStorage("registrationNumber");
          const creatorRegistrationNumber = observation.creatorRegNo.replace('(', "").replace(')', "");
          const deletedTimestamp = moment.utc().toISOString();
          const prevCreator = observation?.creator?.person?.display;
          this.diagnosisService.updateObs(uuid, { comment: `DELETED|${deletedTimestamp}|${provider?.person?.display}|${deletorRegistrationNumber?deletorRegistrationNumber:'NA'}|${prevCreator}|${creatorRegistrationNumber?creatorRegistrationNumber:'NA'}|${observation.obsDatetime.replace('+0000','Z')}` })
          .subscribe(() => {
            this.dischargeOrders[i] = {...this.dischargeOrders[i], comment: `DELETED|${deletedTimestamp}|${provider?.person?.display}|${deletorRegistrationNumber?deletorRegistrationNumber:'NA'}|${prevCreator}|${creatorRegistrationNumber?creatorRegistrationNumber:'NA'}|${observation.obsDatetime.replace('+0000','Z')}` };
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

  dischargeEvent(){
    console.log('Discharge V')
    for (let i = 0; i < this.tempDischarge.length; i++) {
      this.service.postObs(this.tempDischarge[i]).subscribe(response => {
        const user = getFromStorage("user");
        const obj = { 
          uuid: response.uuid, 
          value: response.value, 
          obsDatetime: response.obsDatetime, 
          creatorRegNo:`(${getFromStorage("registrationNumber")})`, 
          creator: { uuid: user.uuid, person: user.person } 
        }
        this.dischargeOrders.push(this.diagnosisService.getData(obj));
      });
    }

    setTimeout(() => {
      this.tempDischargeDisplay = [];
      this.tempDischarge = [];
    }, 500);
  }

  ngOnDestroy() {
    this.eventsSubscription.unsubscribe();
  }
}
