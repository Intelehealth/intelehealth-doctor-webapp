import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { EncounterService } from 'src/app/services/encounter.service';
import { DiagnosisService } from '../../../services/diagnosis.service';
import { transition, trigger, style, animate, keyframes } from '@angular/animations';
import * as moment from 'moment';
import { MatSnackBar } from '@angular/material/snack-bar';
import { SessionService } from 'src/app/services/session.service';
import { TranslateService } from '@ngx-translate/core';
import { Observable, Subscription } from 'rxjs';
declare var getEncounterUUID: any, getFromStorage: any;

@Component({
  selector: 'app-additional-comment',
  templateUrl: './additional-comment.component.html',
  styleUrls: ['./additional-comment.component.css'],
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
export class AdditionalCommentComponent implements OnInit, OnDestroy {
  @Input() isManagerRole: boolean;
  @Input() visitCompleted: boolean;
  comment: any = [];
  encounterUuid: string;
  patientId: string;
  visitUuid: string;
  conceptComment = '162169AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA';

  tempComment: any = [];
  tempCommentDisplay: any = [];
  private eventsSubscription: Subscription;
  @Input() events: Observable<void>;

  commentForm = new FormGroup({
    comment: new FormControl('', [Validators.required])
  });

  constructor(private service: EncounterService,
    private diagnosisService: DiagnosisService,
    private route: ActivatedRoute,
    private snackbar: MatSnackBar,
    private sessionSvc: SessionService,
    private translationService: TranslateService
  ) { }

  ngOnInit() {
    this.visitUuid = this.route.snapshot.paramMap.get('visit_id');
    this.patientId = this.route.snapshot.params['patient_id'];
    this.diagnosisService.getObs(this.patientId, this.conceptComment)
      .subscribe(response => {
        response.results.forEach(async obs => {
          if (obs.encounter.visit.uuid === this.visitUuid) {
            if (obs.comment) {
              const comment = obs.comment.split('|');
              obs.creatorRegNo = comment[5] != 'NA' ? `(${comment[5]})` : "(-)";
              obs.deletorRegNo = comment[3] != 'NA' ? `(${comment[3]})` : "(-)";
              this.comment.push(this.diagnosisService.getData(obs));
            } else {
              obs.creatorRegNo = await this.sessionSvc.getRegNo(obs.creator.uuid);
              this.comment.push(this.diagnosisService.getData(obs));
            }
          }
        });
      });
      this.eventsSubscription = this.events?.subscribe(() => this.commentEvent());
  }

  Submit() {
    const date = new Date();
    const form = this.commentForm.value;
    const value = form.comment;
    if (this.comment.filter(o => o.value.toLowerCase() == value.toLowerCase() && o.comment == null).length > 0) {
      this.translationService.get('messages.cantAdd').subscribe((res: string) => {
        this.snackbar.open(res,null, {duration: 4000,direction: this.txtDirection});
      });
      return;
    }
    if (this.diagnosisService.isEncounterProvider()) {
      this.encounterUuid = getEncounterUUID();
      const json = {
        concept: this.conceptComment,
        person: this.patientId,
        obsDatetime: date,
        value: this.getObj(value),
        encounter: this.encounterUuid
      };

      this.tempComment.push(json);
      const user = getFromStorage("user");
      this.tempCommentDisplay.push(this.diagnosisService.getData({ value: value, obsDatetime: date, creatorRegNo:`(${getFromStorage("registrationNumber")})`, creator: { uuid: user.uuid, person: user.person } }));
      
      // this.service.postObs(json)
      //   .subscribe(resp => {
      //     const user = getFromStorage("user");
      //     this.comment.push({ uuid: resp.uuid, value: value, obsDatetime: resp.obsDatetime, creatorRegNo:`(${getFromStorage("registrationNumber")})`, creator: { uuid: user.uuid, person: user.person } });
      //   });
    }
  }

  get txtDirection() {
    return localStorage.getItem("selectedLanguage") === 'ar' ? "rtl" : "ltr";
  }

  delete(i) {
    if (this.diagnosisService.isEncounterProvider()) {
      const observation = this.comment[i];
      const uuid = observation.uuid;
      if (observation.comment) {
        console.log("Can't delete, already deleted");
      } else {
        // if (observation.creator.uuid == getFromStorage("user").uuid) {
        //   this.diagnosisService.deleteObs(uuid)
        //   .subscribe(() => {
        //     this.comment.splice(i, 1);
        //   });
        // } else {
        const provider = getFromStorage("provider");
        const deletorRegistrationNumber = getFromStorage("registrationNumber");
        const creatorRegistrationNumber = observation.creatorRegNo.replace('(', "").replace(')', "");
        const deletedTimestamp = moment.utc().toISOString();
        const prevCreator = observation?.creator?.person?.display;
        this.diagnosisService.updateObs(uuid, { comment: `DELETED|${deletedTimestamp}|${provider?.person?.display}|${deletorRegistrationNumber?deletorRegistrationNumber:'NA'}|${prevCreator}|${creatorRegistrationNumber?creatorRegistrationNumber:'NA'}|${observation.obsDatetime.replace('+0000','Z')}` })
          .subscribe(() => {
            this.comment[i] = { ...this.comment[i], comment: `DELETED|${deletedTimestamp}|${provider?.person?.display}|${deletorRegistrationNumber?deletorRegistrationNumber:'NA'}|${prevCreator}|${creatorRegistrationNumber?creatorRegistrationNumber:'NA'}|${observation.obsDatetime.replace('+0000','Z')}` };
          });
        // }
      }
    }

    // if (this.diagnosisService.isSameDoctor()) {
    //   const uuid = this.comment[i].uuid;
    //   this.diagnosisService.deleteObs(uuid)
    //   .subscribe(() => {
    //     this.comment.splice(i, 1);
    //   });
    // }
  }

  getLang() {
    return localStorage.getItem("selectedLanguage");
  }

  getObj(value) {
    let value1 = {
      // "ar": localStorage.getItem('selectedLanguage') === 'ar' ?  value: "غير متوفر",
      // "en": localStorage.getItem('selectedLanguage') === 'en' ? value : "NA"
      "ar": value,
      "en": value
    }
    return JSON.stringify(value1);
  }

  commentEvent(){
    for (let i = 0; i < this.tempComment.length; i++) {
      this.service.postObs(this.tempComment[i]).subscribe(response => {
        const user = getFromStorage("user");
        let obj = {
          comment:null,
          uuid: response.uuid, 
          value: response.value, 
          obsDatetime: response.obsDatetime, 
          creatorRegNo:`(${getFromStorage("registrationNumber")})`, 
          creator: { uuid: user.uuid, person: user.person } 
        }
        this.comment.push(this.diagnosisService.getData(obj));
      });
    }

    setTimeout(() => {
      this.tempCommentDisplay = [];
      this.tempComment = [];
    }, 500);
  }

  getTempCommentLength(): number {
    let isNoteAdded = false;
    for (let i = 0; i < this.comment.length; i++) {
      if(this.comment[i]?.comment === null){
        isNoteAdded = true;
      }
    }
    return this.tempComment.length || isNoteAdded;
  }

  tempDelete(i){    
    return this.tempCommentDisplay.splice(i, 1) && this.tempComment.splice(i, 1);
  }

  ngOnDestroy() {
    this.eventsSubscription?.unsubscribe();
  }

  unSaveChanges() {
    return this.tempCommentDisplay.length > 0 && this.tempComment.length > 0
  }
}
