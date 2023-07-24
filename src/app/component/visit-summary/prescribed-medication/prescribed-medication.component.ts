import { Component, Input, OnInit } from '@angular/core';
import { EncounterService } from 'src/app/services/encounter.service';
import { ActivatedRoute } from '@angular/router';
import { debounceTime, distinctUntilChanged, map } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { DiagnosisService } from '../../../services/diagnosis.service';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { transition, trigger, style, animate, keyframes } from '@angular/animations';
import medicines from './medicines';
import { TranslationService } from 'src/app/services/translation.service';
import * as moment from 'moment';
import { SessionService } from 'src/app/services/session.service';
declare var getEncounterUUID: any, getFromStorage: any;

@Component({
  selector: 'app-prescribed-medication',
  templateUrl: './prescribed-medication.component.html',
  styleUrls: ['./prescribed-medication.component.css'],
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
export class PrescribedMedicationComponent implements OnInit {
  @Input() isManagerRole : boolean;
  @Input() visitCompleted: boolean;
  meds: any = [];
  add = false;
  encounterUuid: string;
  patientId: string;
  visitUuid: string;
  conceptPrescription = [];
  conceptDose = [];
  conceptfrequency = [];
  conceptAdministration = [];
  conceptDurationUnit = [];
  conceptMed = 'c38c0c50-2fd2-4ae3-b7ba-7dd25adca4ca';


  medForm = new FormGroup({
    med: new FormControl('', [Validators.required]),
    dose: new FormControl('', Validators.min(0)),
    unit: new FormControl('', [Validators.required]),
    amount: new FormControl('', Validators.min(1)),
    unitType: new FormControl('', [Validators.required]),
    frequency: new FormControl('', [Validators.required]),
    route: new FormControl(''),
    reason: new FormControl(''),
    duration: new FormControl('', Validators.min(1)),
    durationUnit: new FormControl('', [Validators.required]),
    additional: new FormControl('')
  });

  constructor(private service: EncounterService,
    private diagnosisService: DiagnosisService,
    private route: ActivatedRoute,
    private translationService: TranslationService,
    private sessionSvc: SessionService
) { }

  searchPrescription = (text$: Observable<string>) =>
    text$.pipe(
      debounceTime(200),
      distinctUntilChanged(),
      map(term => term.length < 1 ? []
        : this.conceptPrescription.filter(v => v.toLowerCase().indexOf(term.toLowerCase()) > -1).sort(new Intl.Collator(localStorage.getItem("selectedLanguage"), { caseFirst: 'upper' }).compare).slice(0, 10))
    )

  searchFrequency = (text$: Observable<string>) =>
    text$.pipe(
      debounceTime(200),
      distinctUntilChanged(),
      map(term => term.length < 1 ? []
        : this.conceptfrequency.filter(v => v.toLowerCase().indexOf(term.toLowerCase()) > -1).sort(new Intl.Collator(localStorage.getItem("selectedLanguage"), { caseFirst: 'upper' }).compare).slice(0, 10))
    )

  searchAdministration = (text$: Observable<string>) =>
    text$.pipe(
      debounceTime(200),
      distinctUntilChanged(),
      map(term => term.length < 1 ? []
        : this.conceptAdministration.filter(v => v.toLowerCase().indexOf(term.toLowerCase()) > -1).sort(new Intl.Collator(localStorage.getItem("selectedLanguage"), { caseFirst: 'upper' }).compare).slice(0, 10))
    )

  searchDose = (text$: Observable<string>) =>
    text$.pipe(
      debounceTime(200),
      distinctUntilChanged(),
      map(term => term.length < 1 ? []
        : this.conceptDose.filter(v => v.toLowerCase().indexOf(term.toLowerCase()) > -1).sort(new Intl.Collator(localStorage.getItem("selectedLanguage"), { caseFirst: 'upper' }).compare).slice(0, 10))
    )

  durationUnit = (text$: Observable<string>) =>
    text$.pipe(
      debounceTime(200),
      distinctUntilChanged(),
      map(term => term.length < 1 ? []
        : this.conceptDurationUnit.filter(v => v.toLowerCase().indexOf(term.toLowerCase()) > -1).sort(new Intl.Collator(localStorage.getItem("selectedLanguage"), { caseFirst: 'upper' }).compare).slice(0, 10))
    )

  ngOnInit() {
    const prescriptionUuid = 'c25ea0e9-6522-417f-97ec-6e4b7a615254';
    // this.diagnosisService.concept(prescriptionUuid)
    // .subscribe(res => {
    //   const result = res.answers;
    //   console.log('result:>>>>>>>>>>>>>>> ', result);
    //   result.forEach(ans => {
    //     this.conceptPrescription.push(ans.display);
    //   });
    // });
    medicines.forEach(med => {
      this.conceptPrescription.push(this.translationService.getDropdownTranslation('medicines', med));
    });
    //this.conceptPrescription = this.conceptPrescription.concat(medicines)
    const doseUnit = '162384AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA';
    this.diagnosisService.concept(doseUnit)
      .subscribe(res => {
        const result = res.setMembers;
        result.forEach(ans => {
          this.conceptDose.push(this.translationService.getDropdownTranslation('units',ans.display));
        });
      });
    const frequency = '9847b24f-8434-4ade-8978-157184c435d2';
    this.diagnosisService.concept(frequency)
      .subscribe(res => {
        const result = res.setMembers;
        result.forEach(ans => {
          this.conceptfrequency.push(this.translationService.getDropdownTranslation('frequency',ans.display));
        });
      });
    const RouteOfAdministration = '162394AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA';
    this.diagnosisService.concept(RouteOfAdministration)
      .subscribe(res => {
        const result = res.setMembers;
        result.forEach(ans => {
          this.conceptAdministration.push(this.translationService.getDropdownTranslation('route',ans.display));
        });
      });
    const conceptDurationUnit = '1732AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA';
    this.diagnosisService.concept(conceptDurationUnit)
      .subscribe(res => {
        const result = res.setMembers;
        result.forEach(ans => {
          this.conceptDurationUnit.push(this.translationService.getDropdownTranslation('durationUnit',ans.display));
        });
      });
    this.visitUuid = this.route.snapshot.paramMap.get('visit_id');
    this.patientId = this.route.snapshot.params['patient_id'];
    // this.meds = this.medicines
    this.diagnosisService.getObs(this.patientId, this.conceptMed)
      .subscribe(response => {
        response.results.forEach(obs => {
          if (obs.encounter.visit.uuid === this.visitUuid) {
            this.sessionSvc.provider(obs.creator.uuid).subscribe(user => {
              obs.creator.regNo = '(-)';
              const attributes = Array.isArray(user?.results?.[0]?.attributes) ? user?.results?.[0]?.attributes : [];
              const exist = attributes.find(atr => atr?.attributeType?.display === "registrationNumber");
              if (exist) {
                obs.creator.regNo = `(${exist?.value})`;
              }
              this.meds.push(this.diagnosisService.getData(obs));
            });
          }
        });
      });
  }

  onSubmit() {
    const date = new Date();
    const value = this.medForm.value;
    let insertValue;
    this.diagnosisService.getTranslationData();
    setTimeout(() => {
      if (localStorage.getItem('selectedLanguage') === 'ar') {
        insertValue = {
          "ar": `${value.med}: ${value.dose} ${value.unit}, ${value.amount} ${value.unitType} ${value.frequency}`,
          "en": `${value.med}: ${value.dose} ${this.diagnosisService.getTranslationValue('units', value.unit)}, ${value.amount} ${this.diagnosisService.getTranslationValue('units', value.unitType)} ${this.diagnosisService.getTranslationValue('frequency', value.frequency)}`,
        }
        if (value.route) {
          insertValue["ar"] = `${insertValue["ar"]} (${value.route})`;
          insertValue["en"] = `${insertValue["en"]} (${this.diagnosisService.getTranslationValue('route', value.route)})`;
        }
        if (value.reason) {
          insertValue["ar"] =  `${insertValue["ar"]} ${value.reason}`;
          insertValue["en"] =  `${insertValue["en"]} ${value.reason}`;
        }
        insertValue["ar"] =  `${insertValue["ar"]} لاجل ${value.duration} ${value.durationUnit}`;
        insertValue["en"] =  `${insertValue["en"]} for ${value.duration} ${this.diagnosisService.getTranslationValue('units', value.unitType)} ${this.diagnosisService.getTranslationValue('durationUnit', value.durationUnit)}`;
        if (value.additional) {
          insertValue["ar"] = `${insertValue["ar"]} ${value.additional}`;
          insertValue["en"] =`${insertValue["en"]} ${value.additional}`;
        }
      } else {
        insertValue = {
          "en": `${value.med}: ${value.dose} ${value.unit}, ${value.amount} ${value.unitType} ${value.frequency}`,
          "ar": `${value.med}: ${value.dose} ${this.diagnosisService.getTranslationValue('units', value.unit)}, ${value.amount} ${this.diagnosisService.getTranslationValue('units', value.unitType)} ${this.diagnosisService.getTranslationValue('frequency', value.frequency)}`,
        }
        if (value.route) {
          insertValue["en"] = `${insertValue["en"]} (${value.route})`;
          insertValue["ar"] = `${insertValue["ar"]} (${this.diagnosisService.getTranslationValue('route', value.route)})`;
        }
        if (value.reason) {
          insertValue["en"] =  `${insertValue["en"]} ${value.reason}`;
          insertValue["ar"] =  `${insertValue["ar"]} ${value.reason}`;
        }
        insertValue["en"] =  `${insertValue["en"]} for ${value.duration} ${value.durationUnit}`;
        insertValue["ar"] =  `${insertValue["ar"]} لاجل ${value.duration} ${this.diagnosisService.getTranslationValue('units', value.unitType)} ${this.diagnosisService.getTranslationValue('durationUnit', value.durationUnit)}`;

        if (value.additional) {
          insertValue["en"] = `${insertValue["en"]} ${value.additional}`;
          insertValue["ar"] = `${insertValue["ar"]} ${value.additional}`;
        }
      }
      if (this.diagnosisService.isEncounterProvider()) {
        this.encounterUuid = getEncounterUUID();
        const json = {
          concept: this.conceptMed,
          person: this.patientId,
          obsDatetime: date,
          value: JSON.stringify(insertValue),
          encounter: this.encounterUuid
        };
        this.service.postObs(json)
          .subscribe(response => {
            const user = getFromStorage("user");
            this.meds.push(this.diagnosisService.getData({ uuid: response.uuid, value: json.value, obsDatetime: response.obsDatetime, creator: { uuid: user.uuid, person: user.person,regNo:`(${getFromStorage("registrationNumber")})` } }));
            this.add = false;
          });
      }
    }, 500);

  }

  delete(i) {
    if (this.diagnosisService.isEncounterProvider()) {
      const observation = this.meds[i];
      const uuid = observation.uuid;
      if (observation.comment) {
        console.log("Can't delete, already deleted")
      } else {
        // if (observation.creator.uuid == getFromStorage("user").uuid) {
        //   this.diagnosisService.deleteObs(uuid)
        //   .subscribe(() => {
        //     this.meds.splice(i, 1);
        //   });
        // } else {
          const provider = getFromStorage("provider");
          const registrationNumber = getFromStorage("registrationNumber");
          const deletedTimestamp = moment.utc().toISOString();
          this.diagnosisService.updateObs(uuid, { comment: `DELETED|${deletedTimestamp}|${provider?.person?.display}${registrationNumber?'|'+registrationNumber:'|NA'}` })
          .subscribe(() => {
            this.meds[i] = {...this.meds[i], comment: `DELETED|${deletedTimestamp}|${provider?.person?.display}${registrationNumber?'|'+registrationNumber:'|NA'}` };
          });
        // }
      }
    }
    // if (this.diagnosisService.isSameDoctor()) {
    //   const uuid = this.meds[i].uuid;
    //   this.diagnosisService.deleteObs(uuid)
    //     .subscribe(() => {
    //       this.meds.splice(i, 1);
    //     });
    // }
  }

  getLang() {
    return localStorage.getItem("selectedLanguage");
   }
}
