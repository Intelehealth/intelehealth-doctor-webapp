import { Component, Input, OnInit, ViewEncapsulation } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { EncounterService } from 'src/app/services/encounter.service';
import { DiagnosisService } from 'src/app/services/diagnosis.service';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Observable } from 'rxjs';
import { debounceTime, distinctUntilChanged, map } from 'rxjs/operators';
import { transition, trigger, style, animate, keyframes } from '@angular/animations';
import { TranslationService } from 'src/app/services/translation.service';
import * as moment from 'moment';
declare var getEncounterUUID: any, getFromStorage: any;

@Component({
  selector: 'app-advice',
  templateUrl: './advice.component.html',
  styleUrls: ['./advice.component.css'],
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
  ],
  encapsulation: ViewEncapsulation.None
})
export class AdviceComponent implements OnInit {
  @Input() isManagerRole : boolean;
  advice: any = [];
  advices: any = [];
  conceptAdvice = '67a050c1-35e5-451c-a4ab-fff9d57b0db1';
  encounterUuid: string;
  visitUuid: string;
  patientId: string;
  errorText: string;

  adviceForm = new FormGroup({
    advice: new FormControl('', [Validators.required])
  });

  constructor(private service: EncounterService,
    private diagnosisService: DiagnosisService,
    private translationService: TranslationService,
    private route: ActivatedRoute) { }

  search = (text$: Observable<string>) =>
    text$.pipe(
      debounceTime(200),
      distinctUntilChanged(),
      map(term => term.length < 1 ? []
        : this.advices.filter(v => v.toLowerCase().indexOf(term.toLowerCase()) > -1).sort(new Intl.Collator(localStorage.getItem("selectedLanguage"), { caseFirst: 'upper' } ).compare).slice(0, 10))
    )

  ngOnInit() {
    const adviceUuid = '0308000d-77a2-46e0-a6fa-a8c1dcbc3141';
    this.diagnosisService.concept(adviceUuid)
      .subscribe(res => {
        const result = res.answers;
        result.forEach(ans => {
          this.advices.push(this.translationService.getDropdownTranslation('advice', ans.display));
        });
      });
    this.visitUuid = this.route.snapshot.paramMap.get('visit_id');
    this.patientId = this.route.snapshot.params['patient_id'];
    this.diagnosisService.getObs(this.patientId, this.conceptAdvice)
      .subscribe(response => {
        response.results.forEach(obs => {
          if (obs.encounter && obs.encounter.visit.uuid === this.visitUuid) {
            if (!obs.value.includes('Start')) {
              this.advice.push(this.diagnosisService.getData(obs));
            }
          }
        });
      });
  }

  submit() {
    const date = new Date();
    const form = this.adviceForm.value;
    const value = form.advice;
    if (this.diagnosisService.isEncounterProvider()) {
      this.encounterUuid = getEncounterUUID();
      const json = {
        concept: this.conceptAdvice,
        person: this.patientId,
        obsDatetime: date,
        value: JSON.stringify(this.diagnosisService.getBody('advice', value)),
        encounter: this.encounterUuid
      };

      this.service.postObs(json)
        .subscribe(response => {
          let obj = {
            uuid : response.uuid,
            value: json.value,
            creator: { uuid: getFromStorage("user").uuid }
          }
          this.advice.push(this.diagnosisService.getData(obj));
        });
    }
  }

  delete(i) {
    if (this.diagnosisService.isEncounterProvider()) {
      const observation = this.advice[i];
      const uuid = observation.uuid;
      if (observation.comment) {
        console.log("Can't delete, already deleted")
      } else {
        if (observation.creator.uuid == getFromStorage("user").uuid) {
          this.diagnosisService.deleteObs(uuid)
          .subscribe(() => {
            this.advice.splice(i, 1);
          });
        } else {
          const provider = getFromStorage("provider");
          const deletedTimestamp = moment.utc().toISOString();
          this.diagnosisService.updateObs(uuid, { comment: `DELETED|${deletedTimestamp}|${provider?.person?.display}` })
          .subscribe(() => {
            this.advice[i] = {...this.advice[i], comment: `DELETED|${deletedTimestamp}|${provider?.person?.display}` };
          });
        }
      }
    }
    // if (this.diagnosisService.isSameDoctor()) {
    //   const uuid = this.advice[i].uuid;
    //   this.diagnosisService.deleteObs(uuid)
    //     .subscribe(() => {
    //       this.advice.splice(i, 1);
    //     });
    // }
  }

  getLang() {
    return localStorage.getItem("selectedLanguage");
   }
}
