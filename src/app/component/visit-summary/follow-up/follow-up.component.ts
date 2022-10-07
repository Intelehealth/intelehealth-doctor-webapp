import { Component, Input, OnInit } from '@angular/core';
import { EncounterService } from 'src/app/services/encounter.service';
import { ActivatedRoute } from '@angular/router';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { DiagnosisService } from 'src/app/services/diagnosis.service';
import { transition, trigger, style, animate, keyframes } from '@angular/animations';
import * as moment from 'moment';
import { DateAdapter } from '@angular/material/core';
import { DatePipe } from '@angular/common';
declare var getEncounterUUID: any;

@Component({
  selector: 'app-follow-up',
  templateUrl: './follow-up.component.html',
  styleUrls: ['./follow-up.component.css'],
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
export class FollowUpComponent implements OnInit {
@Input() isManagerRole : boolean;
minDate = new Date();
followUp: any = [];
conceptFollow = 'e8caffd6-5d22-41c4-8d6a-bc31a44d0c86';
encounterUuid: string;
patientId: string;
visitUuid: string;
errorText: string;

followForm = new FormGroup({
  date: new FormControl('', [Validators.required]),
  advice: new FormControl('')
});

  constructor(private service: EncounterService,
              private diagnosisService: DiagnosisService,
              private route: ActivatedRoute,
              private datepipe: DatePipe,
              private dateAdapter: DateAdapter<any>) { }

  ngOnInit() {
    this.visitUuid = this.route.snapshot.paramMap.get('visit_id');
    this.patientId = this.route.snapshot.params['patient_id'];
    this.diagnosisService.getObs(this.patientId, this.conceptFollow)
    .subscribe(response => {
      response.results.forEach(obs => {
        if (obs.encounter.visit.uuid === this.visitUuid) {
          this.followUp.push(this.diagnosisService.getData(obs));
        }
      });
    });
    this.dateAdapter.setLocale(this.getLang());
  }

  Submit() {
    const date = new Date();
    const form = this.followForm.value;
    const obsdate = this.datepipe.transform(form.date, 'dd-MM-yyyy');
    const advice = form.advice;
    if (this.diagnosisService.isSameDoctor()) {
      this.encounterUuid = getEncounterUUID();
      const json = {
        concept: this.conceptFollow,
        person: this.patientId,
        obsDatetime: date,
        value: this.getObj(obsdate,advice),
        encounter: this.encounterUuid
      };
      this.service.postObs(json)
      .subscribe(resp => {
        let obj = {
          uuid : resp.uuid,
          value: json.value
        }
        this.followUp.push(this.diagnosisService.getData(obj));
      });
    }
  }

  delete(i) {
    if (this.diagnosisService.isSameDoctor()) {
      const uuid = this.followUp[i].uuid;
      this.diagnosisService.deleteObs(uuid)
      .subscribe(() => {
        this.followUp.splice(i, 1);
      });
    } 
  }

  getLang() {
    return localStorage.getItem("selectedLanguage");
   } 

  getObj(obsdate, advice) {
    let value1 = {
      "ar": localStorage.getItem('selectedLanguage') === 'ar' ?  (advice ? `${obsdate}, ملاحظة: ${advice}` : obsdate) 
      :  `${obsdate}, ملاحظة: غير متوفر  `,
      "en": localStorage.getItem('selectedLanguage') === 'en' ?  (advice ? `${obsdate}, Remark: ${advice}` : obsdate) 
      :  `${obsdate}, Remark: NA`
    }
    return JSON.stringify(value1);
   } 
}
