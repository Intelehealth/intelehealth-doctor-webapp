import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { EncounterService } from 'src/app/services/encounter.service';
import { ActivatedRoute } from '@angular/router';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { DiagnosisService } from 'src/app/services/diagnosis.service';
import { transition, trigger, style, animate, keyframes } from '@angular/animations';
import * as moment from 'moment';
import { DateAdapter } from '@angular/material/core';
import { DatePipe } from '@angular/common';
import { SessionService } from 'src/app/services/session.service';
import { Observable, Subscription } from 'rxjs';
declare var getEncounterUUID: any, getFromStorage: any;

@Component({
  selector: 'app-follow-up',
  templateUrl: './follow-up.component.html',
  styleUrls: ['./follow-up.component.css'],
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
export class FollowUpComponent implements OnInit, OnDestroy {
  @Input() isManagerRole: boolean;
  @Input() visitCompleted: boolean;
  minDate = new Date();
  followUp: any = [];
  conceptFollow = 'e8caffd6-5d22-41c4-8d6a-bc31a44d0c86';
  encounterUuid: string;
  patientId: string;
  visitUuid: string;
  errorText: string;

  tempFollowUp: any = [];
  tempFollowUpDisplay: any = [];
  private eventsSubscription: Subscription;
  @Input() events: Observable<void>;

  followForm = new FormGroup({
    date: new FormControl('', [Validators.required]),
    advice: new FormControl('')
  });

  constructor(private service: EncounterService,
    private diagnosisService: DiagnosisService,
    private route: ActivatedRoute,
    private datepipe: DatePipe,
    private dateAdapter: DateAdapter<any>,
    private sessionSvc: SessionService) { }

  ngOnInit() {
    this.visitUuid = this.route.snapshot.paramMap.get('visit_id');
    this.patientId = this.route.snapshot.params['patient_id'];
    this.diagnosisService.getObs(this.patientId, this.conceptFollow)
      .subscribe(response => {
        response.results.forEach(async obs => {
          if (obs.encounter.visit.uuid === this.visitUuid) {
            if (obs.comment) {
              const comment = obs.comment.split('|');
              obs.creatorRegNo = comment[5] != 'NA' ? `(${comment[5]})` : "(-)";
              obs.deletorRegNo = comment[3] != 'NA' ? `(${comment[3]})` : "(-)";
            } else {
              obs.creatorRegNo = await this.sessionSvc.getRegNo(obs.creator.uuid);
            }
            let obs1 = this.diagnosisService.getData(obs);
            this.followUp.push(localStorage.getItem('selectedLanguage') === 'ar' ? this.getArabicDate(obs1) : obs1);
          }
        });
      });
    this.dateAdapter.setLocale(this.getLang());
    this.eventsSubscription = this.events?.subscribe(() => this.followUpEvent());
  }

  get allowFollowUp() {
    return this.followUp.filter((o: any) => o.comment == null).length;
  }

  Submit() {
    const date = new Date();
    const form = this.followForm.value;
    const obsdate = this.datepipe.transform(form.date, 'dd-MMMM-yyyy');
    const advice = form.advice;
    if (this.diagnosisService.isEncounterProvider()) {
      this.encounterUuid = getEncounterUUID();
      const json = {
        concept: this.conceptFollow,
        person: this.patientId,
        obsDatetime: date,
        value: this.getObj(obsdate, advice),
        encounter: this.encounterUuid
      };

      this.tempFollowUp.push(json);
      const user = getFromStorage("user");
      this.tempFollowUpDisplay.push(this.diagnosisService.getData({ value: json.value, obsDatetime: date, creatorRegNo:`(${getFromStorage("registrationNumber")})`, creator: { uuid: user.uuid, person: user.person } }));

      // this.service.postObs(json)
      //   .subscribe(resp => {
      //     const user = getFromStorage("user");
      //     let obj = {
      //       uuid: resp.uuid,
      //       value: json.value,
      //       obsDatetime: resp.obsDatetime,
      //       creatorRegNo:`(${getFromStorage("registrationNumber")})`,
      //       creator: { uuid: user.uuid, person: user.person }
      //     }
      //     let obs1 = this.diagnosisService.getData(obj);
      //     this.followUp.push(localStorage.getItem('selectedLanguage') === 'ar' ? this.getArabicDate(obs1) : obs1);
      //     // this.followUp.push(this.diagnosisService.getData(obj));
      //   });
    }
  }

  delete(i) {
    if (this.diagnosisService.isEncounterProvider()) {
      const observation = this.followUp[i];
      const uuid = observation.uuid;
      if (observation.comment) {
        console.log("Can't delete, already deleted")
      } else {
        // if (observation.creator.uuid == getFromStorage("user").uuid) {
        //   this.diagnosisService.deleteObs(uuid)
        //   .subscribe(() => {
        //     this.followUp.splice(i, 1);
        //   });
        // } else {
          const provider = getFromStorage("provider");
          const deletorRegistrationNumber = getFromStorage("registrationNumber");
          const creatorRegistrationNumber = observation.creatorRegNo.replace('(', "").replace(')', "");
          const deletedTimestamp = moment.utc().toISOString();
          const prevCreator = observation?.creator?.person?.display;
          this.diagnosisService.updateObs(uuid, { comment: `DELETED|${deletedTimestamp}|${provider?.person?.display}|${deletorRegistrationNumber?deletorRegistrationNumber:'NA'}|${prevCreator}|${creatorRegistrationNumber?creatorRegistrationNumber:'NA'}|${observation.obsDatetime.replace('+0000','Z')}` })
          .subscribe(() => {
            this.followUp[i] = {...this.followUp[i], comment: `DELETED|${deletedTimestamp}|${provider?.person?.display}|${deletorRegistrationNumber?deletorRegistrationNumber:'NA'}|${prevCreator}|${creatorRegistrationNumber?creatorRegistrationNumber:'NA'}|${observation.obsDatetime.replace('+0000','Z')}` };
          });
        // }
      }

    }

    // if (this.diagnosisService.isSameDoctor()) {
    //   const uuid = this.followUp[i].uuid;
    //   this.diagnosisService.deleteObs(uuid)
    //     .subscribe(() => {
    //       this.followUp.splice(i, 1);
    //     });
    // }
  }

  getLang() {
    return localStorage.getItem("selectedLanguage");
  }

  getObj(obsdate, advice) {
    let value1 = {
      "ar": advice ? `${obsdate}, ملاحظة: ${advice}` : obsdate,
      "en": advice ? `${obsdate}, Remark: ${advice}` : obsdate
    }
    return JSON.stringify(value1);
  }

  getArabicDate(obs) {
    let valaue = obs.value
      .replace("January", "كانون الثاني")
      .replace("February", "شهر شباط")
      .replace("March", "شهر اذار")
      .replace("April", "أشهر نيسان")
      .replace("May", "شهر أيار")
      .replace("June", "شهر حزيران")
      .replace("July", "شهر تموز")
      .replace("August", "شهر أب")
      .replace("September", "شهر أيلول")
      .replace("October", "شهر تشرين الأول")
      .replace("November", "شهر تشرين الثاني")
      .replace("December", "شهر كانون الأول");
    obs.value = valaue;
    return obs;
  }

  followUpEvent(){
    for (let i = 0; i < this.tempFollowUp.length; i++) {
      this.service.postObs(this.tempFollowUp[i]).subscribe(response => {
          const user = getFromStorage("user");
          let obj = {
            uuid: response.uuid,
            value: response.value,
            obsDatetime: response.obsDatetime,
            creatorRegNo:`(${getFromStorage("registrationNumber")})`,
            creator: { uuid: user.uuid, person: user.person }
          }
          let obs1 = this.diagnosisService.getData(obj);
          this.followUp.push(localStorage.getItem('selectedLanguage') === 'ar' ? this.getArabicDate(obs1) : obs1);
          // this.followUp.push(this.diagnosisService.getData(obj));
        });
    }

    setTimeout(() => {
      this.tempFollowUpDisplay = [];
      this.tempFollowUp = [];
    }, 500);
  }

  tempDelete(i){    
    return this.tempFollowUpDisplay.splice(i, 1) && this.tempFollowUp.splice(i, 1);
  }

  ngOnDestroy() {
    this.eventsSubscription?.unsubscribe();
  }

  unSaveChanges() {
    return this.tempFollowUpDisplay.length > 0 && this.tempFollowUp.length > 0
  }
}
