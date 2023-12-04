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
import { TranslateService } from '@ngx-translate/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { VisitService } from 'src/app/services/visit.service';
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
  @Input() isManagerRole: boolean;
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
  medicineObs = [];
  medicineObsList = [];
  medicinesList = [];
  isShow = [];
  objectKeys = Object.keys;
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
    private sessionSvc: SessionService,
    private ngxTranslationService: TranslateService,
    public visitSvc: VisitService,
    private snackbar: MatSnackBar
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
          this.conceptDose.push(this.translationService.getDropdownTranslation('units', ans.display));
        });
      });
    const frequency = '9847b24f-8434-4ade-8978-157184c435d2';
    this.diagnosisService.concept(frequency)
      .subscribe(res => {
        const result = res.setMembers;
        result.forEach(ans => {
          this.conceptfrequency.push(this.translationService.getDropdownTranslation('frequency', ans.display));
        });
      });
    const RouteOfAdministration = '162394AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA';
    this.diagnosisService.concept(RouteOfAdministration)
      .subscribe(res => {
        const result = res.setMembers;
        result.forEach(ans => {
          this.conceptAdministration.push(this.translationService.getDropdownTranslation('route', ans.display));
        });
      });
    const conceptDurationUnit = '1732AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA';
    this.diagnosisService.concept(conceptDurationUnit)
      .subscribe(res => {
        const result = res.setMembers;
        result.forEach(ans => {
          this.conceptDurationUnit.push(this.translationService.getDropdownTranslation('durationUnit', ans.display));
        });
      });
    this.visitUuid = this.route.snapshot.paramMap.get('visit_id');
    this.patientId = this.route.snapshot.params['patient_id'];
    // this.meds = this.medicines
    this.diagnosisService.getObs(this.patientId, this.conceptMed).subscribe(response => {
      response.results.forEach(async obs => {
        if (obs.encounter.visit.uuid === this.visitUuid) {
          if (obs.comment) {
            const comment = obs.comment.split('|');
            obs.creatorRegNo = comment[5] != 'NA' ? `(${comment[5]})` : "(-)";
            obs.deletorRegNo = comment[3] != 'NA' ? `(${comment[3]})` : "(-)";
            this.meds.push(this.diagnosisService.getData(obs));
          } else {
            obs.creatorRegNo = await this.sessionSvc.getRegNo(obs.creator.uuid);
            this.meds.push(this.diagnosisService.getData(obs));
          }
        }
      });
      this.visitSvc.lockMedicineAidOrder.next();
    });

    this.visitSvc.fetchVisitDetails(this.visitUuid).subscribe(visitDetail => {
      visitDetail.encounters.filter((e) => {
        let medObs = {}
        if(e.display.includes("DISPENSE")){
          for(let i = 0; i < e.obs.length; i++){
            if(e.obs[i].display.includes("DISPENSE_MEDICATION")){              
              let obsData = JSON.parse(e.obs[i].value)
              medObs['medicationUuidList'] = obsData.medicationUuidList
              medObs['obsDatetime'] = e.obs[i].obsDatetime
              medObs['creator'] = {'dispensed' : e.obs[i].creator.display}
            }
          }
          this.medicineObs.push(medObs);
        }
        if(e.display.includes("ADMINISTER")){
          for(let i = 0; i < e.obs.length; i++){
            if(e.obs[i].display.includes("ADMINISTER_MEDICATION")){              
              let obsData = JSON.parse(e.obs[i].value)
              medObs['medicationUuidList'] = obsData.medicationUuidList
              medObs['obsDatetime'] = e.obs[i].obsDatetime
              medObs['creator'] = {'administered' : e.obs[i].creator.display}
            }
          }
          this.medicineObs.push(medObs);
        }
        if(e.display.includes("Visit Note")){
          this.getMedicineList(e.obs,this.medicineObs);
        }
      });      
    });

    this.visitSvc.lockMedicineAidOrder.subscribe({
      next: () => {
        if (this.visitSvc?.dispense?.length && this.meds?.length) {
          this.meds.forEach(med => {
            if (Array.isArray(this.visitSvc.dispense)) {
              this.visitSvc.dispense.forEach(dispense => {
                if (Array.isArray(dispense?.medicationUuidList) && !med.disabled) {
                  med.disabled = dispense.medicationUuidList.includes(med.uuid);
                }
              });
            }
          });
        }
      }
    });
  }

  ngOnDestroy() {
    this.visitSvc.lockMedicineAidOrder.unsubscribe();
  }

  onSubmit() {
    const date = new Date();
    const value = this.medForm.value;
    let insertValue;
    this.diagnosisService.getTranslationData();
    setTimeout(() => {
      if (localStorage.getItem('selectedLanguage') === 'ar') {
        insertValue = {
          "ar": `${value.med} (${value.dose} ${value.unit})\n ${value.amount} ${value.unitType} ${value.frequency}`,
          "en": `${value.med} (${value.dose} ${this.diagnosisService.getTranslationValue('units', value.unit)})\n ${value.amount} ${this.diagnosisService.getTranslationValue('units', value.unitType)} ${this.diagnosisService.getTranslationValue('frequency', value.frequency)}`,
        }
        if (value.route) {
          insertValue["ar"] = `${insertValue["ar"]} (${value.route})`;
          insertValue["en"] = `${insertValue["en"]} (${this.diagnosisService.getTranslationValue('route', value.route)})`;
        }
        if (value.reason) {
          insertValue["ar"] = `${insertValue["ar"]} ${value.reason}`;
          insertValue["en"] = `${insertValue["en"]} ${value.reason}`;
        }
        insertValue["ar"] = `${insertValue["ar"]} لاجل ${value.duration} ${value.durationUnit}`;
        insertValue["en"] = `${insertValue["en"]} for ${value.duration} ${this.diagnosisService.getTranslationValue('units', value.unitType)} ${this.diagnosisService.getTranslationValue('durationUnit', value.durationUnit)}`;
        if (value.additional) {
          insertValue["ar"] = `${insertValue["ar"]} ${value.additional}`;
          insertValue["en"] = `${insertValue["en"]} ${value.additional}`;
        }
      } else {
        insertValue = {
          "en": `${value.med} (${value.dose} ${value.unit})\n ${value.amount} ${value.unitType} ${value.frequency}`,
          "ar": `${value.med} (${value.dose} ${this.diagnosisService.getTranslationValue('units', value.unit)})\n ${value.amount} ${this.diagnosisService.getTranslationValue('units', value.unitType)} ${this.diagnosisService.getTranslationValue('frequency', value.frequency)}`,
        }
        if (value.route) {
          insertValue["en"] = `${insertValue["en"]} (${value.route})`;
          insertValue["ar"] = `${insertValue["ar"]} (${this.diagnosisService.getTranslationValue('route', value.route)})`;
        }
        if (value.reason) {
          insertValue["en"] = `${insertValue["en"]} ${value.reason}`;
          insertValue["ar"] = `${insertValue["ar"]} ${value.reason}`;
        }
        insertValue["en"] = `${insertValue["en"]} for ${value.duration} ${value.durationUnit}`;
        insertValue["ar"] = `${insertValue["ar"]} لاجل ${value.duration} ${this.diagnosisService.getTranslationValue('units', value.unitType)} ${this.diagnosisService.getTranslationValue('durationUnit', value.durationUnit)}`;

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
        let flag = 0;
        if (localStorage.getItem('selectedLanguage') === 'ar') {
          for (let m = 0; m < this.meds.length; m++) {
            if (this.meds[m].value == insertValue['ar'] && this.meds[m].comment == null) {
              flag = 1;
              break;
            }
          }
        } else {
          for (let m = 0; m < this.meds.length; m++) {
            if (this.meds[m].value == insertValue['en'] && this.meds[m].comment == null) {
              flag = 1;
              break;
            }
          }
        }
        if (flag == 1) {
          this.ngxTranslationService.get('messages.cantAdd').subscribe((res: string) => {
            this.snackbar.open(res, null, { duration: 4000, direction: this.txtDirection });
          });
          return;
        }
        this.service.postObs(json)
          .subscribe(response => {
            const user = getFromStorage("user");
            this.meds.push(this.diagnosisService.getData({ uuid: response.uuid, value: json.value, obsDatetime: response.obsDatetime, creatorRegNo: `(${getFromStorage("registrationNumber")})`, creator: { uuid: user.uuid, person: user.person } }));
            this.add = false;
          });
      }
    }, 500);

  }

  get txtDirection() {
    return localStorage.getItem("selectedLanguage") === 'ar' ? "rtl" : "ltr";
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
        const deletorRegistrationNumber = getFromStorage("registrationNumber");
        const creatorRegistrationNumber = observation.creatorRegNo.replace('(', "").replace(')', "");
        const deletedTimestamp = moment.utc().toISOString();
        const prevCreator = observation?.creator?.person?.display;
        this.diagnosisService.updateObs(uuid, { comment: `DELETED|${deletedTimestamp}|${provider?.person?.display}|${deletorRegistrationNumber ? deletorRegistrationNumber : 'NA'}|${prevCreator}|${creatorRegistrationNumber ? creatorRegistrationNumber : 'NA'}|${observation.obsDatetime.replace('+0000', 'Z')}` })
          .subscribe(() => {
            this.meds[i] = { ...this.meds[i], comment: `DELETED|${deletedTimestamp}|${provider?.person?.display}|${deletorRegistrationNumber ? deletorRegistrationNumber : 'NA'}|${prevCreator}|${creatorRegistrationNumber ? creatorRegistrationNumber : 'NA'}|${observation.obsDatetime.replace('+0000', 'Z')}` };
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

  getMedicineList(obs:any, arr:any){
    for(let j = 0; j < obs.length; j++){
      let disAdminObs = {};
      let obsArr = [];
      if(obs[j].display.includes("JSV MEDICATIONS")){
        this.diagnosisService.getData(obs[j]);
        for(let x = 0; x < arr.length; x++){
          if(arr[x].medicationUuidList){
            let obsMeds = {};
            for(let y = 0; y < arr[x].medicationUuidList.length; y++){
              if(arr[x].medicationUuidList[y] === obs[j].uuid){ 
                obsMeds[obs[j].value] = [arr[x].creator, arr[x].obsDatetime];
                this.medicinesList.push(obsMeds);
              }                    
            }
          }
        }
        for(let i = 0; i < this.medicinesList.length; i++){
          if(this.objectKeys(this.medicinesList[i]).includes(obs[j].value)){            
            obsArr.push(this.medicinesList[i][obs[j].value]);
          }
        }
        disAdminObs[obs[j].value] = obsArr
        this.medicineObsList.push(disAdminObs);
      }
    }
    console.log(this.medicineObsList,"final OBSSSS");
  }

  toggleShow(index: number): void {
    this.isShow = Array(this.medicineObsList.length).fill(false);
    this.isShow[index] = !this.isShow[index];
  }
}
