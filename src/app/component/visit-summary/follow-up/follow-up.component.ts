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
export class FollowUpComponent implements OnInit {
  @Input() isManagerRole: boolean;
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
            let obs1 = this.diagnosisService.getData(obs);
            this.followUp.push(localStorage.getItem('selectedLanguage') === 'ar' ? this.getArabicDate(obs1) : obs1);
          }
        });
      });
    this.dateAdapter.setLocale(this.getLang());
  }

  Submit() {
    const date = new Date();
    const form = this.followForm.value;
    const obsdate = this.datepipe.transform(form.date, 'dd-MMMM-yyyy');
    const advice = form.advice;
    if (this.diagnosisService.isSameDoctor()) {
      this.encounterUuid = getEncounterUUID();
      const json = {
        concept: this.conceptFollow,
        person: this.patientId,
        obsDatetime: date,
        value: this.getObj(obsdate, advice),
        encounter: this.encounterUuid
      };
      this.service.postObs(json)
        .subscribe(resp => {
          let obj = {
            uuid: resp.uuid,
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
}
