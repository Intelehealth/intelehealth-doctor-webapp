import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { EncounterService } from 'src/app/services/encounter.service';
import { ActivatedRoute } from '@angular/router';
import { DiagnosisService } from 'src/app/services/diagnosis.service';
import { Validators, FormGroup, FormControl } from '@angular/forms';
import { transition, trigger, style, animate, keyframes } from '@angular/animations';
import { TranslateService } from '@ngx-translate/core';
import * as moment from 'moment';
import { MatSnackBar } from '@angular/material/snack-bar';
import { SessionService } from 'src/app/services/session.service';
import { Observable, Subscription } from 'rxjs';
declare var getEncounterUUID: any, getFromStorage: any;

@Component({
  selector: 'app-diagnosis',
  templateUrl: './diagnosis.component.html',
  styleUrls: ['./diagnosis.component.css'],
  animations: [
    trigger('moveInLeft', [
       transition('void=> *', [style({transform: 'translateX(300px)'}),
         animate(200, keyframes ([
          style({transform: 'translateX(300px)'}),
          style({transform: 'translateX(0)'})
           ]))]),
    transition('*=>void', [style({transform: 'translateX(0px)'}),
         animate(100, keyframes([
          style({transform: 'translateX(0px)'}),
          style({transform: 'translateX(300px)'})
        ]))])
     ])
 ]
})
export class DiagnosisComponent implements OnInit, OnDestroy {
@Input() isManagerRole : boolean;
@Input() visitCompleted: boolean;
diagnosis: any = [];
diagnosisList = [];
conceptDiagnosis = '537bb20d-d09d-4f88-930b-cc45c7d662df';
patientId: string;
visitUuid: string;
encounterUuid: string;

tempDiagnosis: any = [];
tempDiagnosisDisplay: any = [];
private eventsSubscription: Subscription;
@Input() events: Observable<void>;

diagnosisForm = new FormGroup({
  text: new FormControl('', [Validators.required]),
  type: new FormControl('', [Validators.required]),
  confirm: new FormControl('', [Validators.required])
});

  constructor(
    private service: EncounterService,
    private diagnosisService: DiagnosisService,
    private route: ActivatedRoute,
    private translationService: TranslateService,
    private snackbar: MatSnackBar,
    private sessionSvc:SessionService
  ) { }

  ngOnInit() {
    this.visitUuid = this.route.snapshot.paramMap.get('visit_id');
    this.patientId = this.route.snapshot.params['patient_id'];
    this.diagnosisService.getObs(this.patientId, this.conceptDiagnosis)
    .subscribe(response => {
      response.results.forEach(async (obs) => {
        if (obs.encounter.visit.uuid === this.visitUuid) {
          if (obs.comment) {
            const comment = obs.comment.split('|');
            obs.creatorRegNo = comment[5] != 'NA' ? `(${comment[5]})` : "(-)";
            obs.deletorRegNo = comment[3] != 'NA' ? `(${comment[3]})` : "(-)";
            this.diagnosis.push(this.diagnosisService.getData(obs));
          } else {
            obs.creatorRegNo = await this.sessionSvc.getRegNo(obs.creator.uuid);
            this.diagnosis.push(this.diagnosisService.getData(obs));
          }
        }
      });
    });
    this.eventsSubscription = this.events.subscribe(() => this.diagnosisEvent());
  }

  search(event) {
    this.diagnosisService.getDiagnosisList(event.target.value)
    .subscribe(response => {
      this.diagnosisList = response?.sort((a, b)=> {return a.name.localeCompare(b.name)});
    });
  }

  onSubmit() {
    const date = new Date();
    const value = this.diagnosisForm.value;
    if (this.diagnosis.filter(o => (localStorage.getItem('selectedLanguage') == 'en') ? o.value.toLowerCase() == `${value.text.toLowerCase()}:${value.type.toLowerCase()} & ${value.confirm.toLowerCase()}` && o.comment == null : o.value.toLowerCase().includes(value.text.toLowerCase()) && o.value.toLowerCase().includes((value.type == 'Primary')? 'أولي' : 'ثانوي') && o.value.toLowerCase().includes((value.confirm == 'Provisional')?'مؤقت':'مؤكد') && o.comment == null).length > 0) {
      this.translationService.get('messages.cantAdd').subscribe((res: string) => {
        this.snackbar.open(res,null, {duration: 4000,direction: this.txtDirection});
      });
      return;
    }
    if (this.diagnosisService.isEncounterProvider()) {
      this.encounterUuid = getEncounterUUID();
      this.diagnosisService.getTranslationData();
      setTimeout(() => {
        const json = {
          concept: this.conceptDiagnosis,
          person: this.patientId,
          obsDatetime: date,
          value:  this.getBody('diagnosis',value.text, value.type, value.confirm),
          encounter: this.encounterUuid
        };

        this.tempDiagnosis.push(json);
        const user = getFromStorage("user");
        this.tempDiagnosisDisplay.push(this.diagnosisService.getData({ value: json.value, obsDatetime: date, creatorRegNo:`(${getFromStorage("registrationNumber")})`, creator: { uuid: user.uuid, person: user.person } }));
        
        // this.service.postObs(json)
        // .subscribe(resp => {
        //   this.diagnosisList = [];
        //   const user = getFromStorage("user");
        //   let obj = {
        //     uuid : resp.uuid,
        //     value: json.value,
        //     obsDatetime: resp.obsDatetime,
        //     creatorRegNo:`(${getFromStorage("registrationNumber")})`,
        //     creator: { uuid: user.uuid, person: user.person }
        //   }
        //   this.diagnosis.push(this.diagnosisService.getData(obj));
        // });
      }, 1000);
    }
  }

  get txtDirection() {
    return localStorage.getItem("selectedLanguage") === 'ar' ? "rtl" : "ltr";
  }

  getBody(element: string, elementName: string, type, confirm) {
    let vl = this.diagnosisService.getBody(element,elementName);
    let value;
    if (localStorage.getItem('selectedLanguage') === 'ar') {
      value = {
        "ar": `${elementName}:${(type == 'Primary')? 'أولي' : 'ثانوي'} & ${(confirm == 'Provisional')?'مؤقت':'مؤكد'}`,
        "en": `${vl.en}:${type} & ${confirm}`
      }
    } else {
      value = {
        "ar": `${vl.ar}:${(type == 'Primary')? 'أولي' : 'ثانوي'} & ${(confirm == 'Provisional')?'مؤقت':'مؤكد'}`,
        "en": `${elementName}:${type} & ${confirm}`,
      }
    }
    return JSON.stringify(value);
  }

  delete(i) {
    if (this.diagnosisService.isEncounterProvider()) {
      const observation = this.diagnosis[i];
      const uuid = observation.uuid;
      if (observation.comment) {
        console.log("Can't delete, already deleted")
      } else {
        // if (observation.creator.uuid == getFromStorage("user").uuid) {
        //   this.diagnosisService.deleteObs(uuid)
        //   .subscribe(() => {
        //     this.diagnosis.splice(i, 1);
        //   });
        // } else {
          const provider = getFromStorage("provider");
          const deletorRegistrationNumber = getFromStorage("registrationNumber");
          const creatorRegistrationNumber = observation.creatorRegNo.replace('(', "").replace(')', "");
          const deletedTimestamp = moment.utc().toISOString();
          const prevCreator = observation?.creator?.person?.display;
          this.diagnosisService.updateObs(uuid, { comment: `DELETED|${deletedTimestamp}|${provider?.person?.display}|${deletorRegistrationNumber?deletorRegistrationNumber:'NA'}|${prevCreator}|${creatorRegistrationNumber?creatorRegistrationNumber:'NA'}|${observation.obsDatetime.replace('+0000','Z')}` })
          .subscribe(() => {
            this.diagnosis[i] = {...this.diagnosis[i], comment: `DELETED|${deletedTimestamp}|${provider?.person?.display}|${deletorRegistrationNumber?deletorRegistrationNumber:'NA'}|${prevCreator}|${creatorRegistrationNumber?creatorRegistrationNumber:'NA'}|${observation.obsDatetime.replace('+0000','Z')}` };
          });
        // }
      }
    }
    // if (this.diagnosisService.isSameDoctor()) {
    //   const uuid = this.diagnosis[i].uuid;
    //   this.diagnosisService.deleteObs(uuid)
    //   .subscribe(res => {
    //     this.diagnosis.splice(i, 1);
    //   });
    // }
  }

  getLang() {
    return localStorage.getItem("selectedLanguage");
  }

  diagnosisEvent(){
    for (let i = 0; i < this.tempDiagnosis.length; i++) {
      this.service.postObs(this.tempDiagnosis[i]).subscribe(response => {
        this.diagnosisList = [];
        const user = getFromStorage("user");
        let obj = {
          uuid : response.uuid,
          value: response.value,
          obsDatetime: response.obsDatetime,
          creatorRegNo:`(${getFromStorage("registrationNumber")})`,
          creator: { uuid: user.uuid, person: user.person }
        }
        this.diagnosis.push(this.diagnosisService.getData(obj));
      });
    }

    setTimeout(() => {
      this.tempDiagnosisDisplay = [];
      this.tempDiagnosis = [];
    }, 500);
  }

  tempDelete(i){    
    return this.tempDiagnosisDisplay.splice(i, 1) && this.tempDiagnosis.splice(i, 1);
  }

  ngOnDestroy() {
    this.eventsSubscription.unsubscribe();
  }

  unSaveChanges() {    
    return this.tempDiagnosisDisplay.length > 0 && this.tempDiagnosis.length > 0;
  }
}
