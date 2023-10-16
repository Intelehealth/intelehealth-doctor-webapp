import { Component, Input, OnInit } from '@angular/core';
import { EncounterService } from 'src/app/services/encounter.service';
import { ActivatedRoute } from '@angular/router';
import { debounceTime, distinctUntilChanged, map } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { DiagnosisService } from '../../../services/diagnosis.service';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { transition, trigger, style, animate, keyframes } from '@angular/animations';
import medicines from '../prescribed-medication/medicines';
import { TranslationService } from 'src/app/services/translation.service';
import * as moment from 'moment';
import { SessionService } from 'src/app/services/session.service';

declare var getEncounterUUID: any, getFromStorage: any;

@Component({
  selector: 'app-administer',
  templateUrl: './administer.component.html',
  styleUrls: ['./administer.component.css'],
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
export class AdministerComponent implements OnInit {

  meds: any = [];
  add = false;
  patientId: string;
  visitUuid: string;
  conceptMed = 'c38c0c50-2fd2-4ae3-b7ba-7dd25adca4ca';

  constructor(
    private diagnosisService: DiagnosisService,
    private route: ActivatedRoute,
    private sessionSvc: SessionService,
  ) { }
  ngOnInit() {
    // this.visitUuid = this.route.snapshot.paramMap.get('visit_id');
    // this.patientId = this.route.snapshot.params['patient_id'];
    // this.diagnosisService.getObs(this.patientId, this.conceptMed).subscribe(response => {
    //   response.results.forEach(async obs => {
    //     if (obs.encounter.visit.uuid === this.visitUuid) {
    //       if (obs.comment) {
    //         const comment = obs.comment.split('|');
    //         obs.creatorRegNo = comment[5] != 'NA' ? `(${comment[5]})` : "(-)";
    //         obs.deletorRegNo = comment[3] != 'NA' ? `(${comment[3]})` : "(-)";
    //         this.meds.push(this.diagnosisService.getData(obs));
    //       } else {
    //         obs.creatorRegNo = await this.sessionSvc.getRegNo(obs.creator.uuid);
    //         this.meds.push(this.diagnosisService.getData(obs));
    //       }
    //     }
    //   });
    // });
    // console.log(this.meds,"Meds");
    
  }

  get txtDirection() {
    return localStorage.getItem("selectedLanguage") === 'ar' ? "rtl" : "ltr";
  }

  getLang() {
    return localStorage.getItem("selectedLanguage");
   }
}
