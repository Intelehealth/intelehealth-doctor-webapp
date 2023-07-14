import { Component, Input, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { EncounterService } from 'src/app/services/encounter.service';
import { DiagnosisService } from '../../../services/diagnosis.service';
import { transition, trigger, style, animate, keyframes } from '@angular/animations';
import * as moment from 'moment';
import { MatSnackBar } from '@angular/material/snack-bar';
declare var getEncounterUUID: any, getFromStorage: any;

@Component({
  selector: 'app-additional-comment',
  templateUrl: './additional-comment.component.html',
  styleUrls: ['./additional-comment.component.css'],
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
export class AdditionalCommentComponent implements OnInit {
@Input() isManagerRole : boolean;
@Input() visitCompleted: boolean;
comment: any = [];
encounterUuid: string;
patientId: string;
visitUuid: string;
conceptComment = '162169AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA';

  commentForm = new FormGroup ({
    comment: new FormControl('', [Validators.required])
  });

  constructor(private service: EncounterService,
              private diagnosisService: DiagnosisService,
              private route: ActivatedRoute,
              private snackbar: MatSnackBar) { }

  ngOnInit() {
    this.visitUuid = this.route.snapshot.paramMap.get('visit_id');
    this.patientId = this.route.snapshot.params['patient_id'];
    this.diagnosisService.getObs(this.patientId, this.conceptComment)
    .subscribe(response => {
      response.results.forEach(obs => {
        if (obs.encounter.visit.uuid === this.visitUuid) {
          this.diagnosisService.getUserByUuid(obs.creator.uuid).subscribe(user => {
            obs.creator.person = { ...user.person };
            this.comment.push(this.diagnosisService.getData(obs));
          });
        }
      });
    });
  }

  Submit() {
    const date = new Date();
    const form = this.commentForm.value;
    const value = form.comment;
    if (this.comment.filter(o => o.value.toLowerCase() == value.toLowerCase()).length > 0) {
      this.snackbar.open("Can't add, this entry already exists!", null, { duration: 4000 });
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
      this.service.postObs(json)
      .subscribe(resp => {
        const user = getFromStorage("user");
        this.comment.push({ uuid: resp.uuid, value: value, dateCreated: resp.obsDatetime, creator: { uuid: user.uuid, person: user.person  } });
      });
    }
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
          const registrationNumber = getFromStorage("registrationNumber");
          const deletedTimestamp = moment.utc().toISOString();
          this.diagnosisService.updateObs(uuid, { comment: `DELETED|${deletedTimestamp}|${provider?.person?.display}${registrationNumber?'|'+registrationNumber:'|NA'}` })
          .subscribe(() => {
            this.comment[i] = {...this.comment[i], comment: `DELETED|${deletedTimestamp}|${provider?.person?.display}${registrationNumber?'|'+registrationNumber:'|NA'}` };
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
}
