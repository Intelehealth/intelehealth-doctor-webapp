import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { EncounterService } from 'src/app/services/encounter.service';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { DiagnosisService } from 'src/app/services/diagnosis.service';
import { Observable, Subscription } from 'rxjs';
import {debounceTime, distinctUntilChanged, map} from 'rxjs/operators';
import { transition, trigger, style, animate, keyframes } from '@angular/animations';
import { TranslationService } from 'src/app/services/translation.service';
import * as moment from 'moment';
import { MatSnackBar } from '@angular/material/snack-bar';
import { SessionService } from 'src/app/services/session.service';
import { TranslateService } from '@ngx-translate/core';
import { VisitService } from 'src/app/services/visit.service';
declare var getEncounterUUID: any, getFromStorage: any;

@Component({
  selector: 'app-prescribed-test',
  templateUrl: './prescribed-test.component.html',
  styleUrls: ['./prescribed-test.component.css'],
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
export class PrescribedTestComponent implements OnInit, OnDestroy {
  @Input() isManagerRole : boolean;
  @Input() visitCompleted: boolean;

  tests: any = [];
  test =  [];
  conceptTest = '23601d71-50e6-483f-968d-aeef3031346d';
  encounterUuid: string;
  patientId: string;
  visitUuid: string;
  errorText: string;
  medicineObs = [];
  medicineObsList = [];
  medicinesList = [];
  objectKeys = Object.keys;
  conceptMed = 'c38c0c50-2fd2-4ae3-b7ba-7dd25adca4ca';
  isShow: boolean[] = Array(this.medicineObsList.length).fill(false);

  tempTest: any = [];
  tempTestDisplay: any = [];
  private eventsSubscription: Subscription;
  @Input() events: Observable<void>;

  testForm = new FormGroup({
    test: new FormControl('', [Validators.required])
  });

  constructor(
    private service: EncounterService,
    private diagnosisService: DiagnosisService,
    private translationService: TranslationService,
    private route: ActivatedRoute,
    private snackbar: MatSnackBar,
    private sessionSvc:SessionService,
    private ngxTranslationService: TranslateService,
    public visitSvc: VisitService
  ) { }


  search = (text$: Observable<string>) =>
    text$.pipe(
      debounceTime(200),
      distinctUntilChanged(),
      map(term => term.length < 1 ? []
        : this.test.filter(v => v.toLowerCase().indexOf(term.toLowerCase()) > -1).sort(new Intl.Collator(localStorage.getItem("selectedLanguage"), { caseFirst: 'upper' } ).compare).slice(0, 10))
    )

  ngOnInit() {
    const testUuid = '98c5881f-b214-4597-83d4-509666e9a7c9';
    this.diagnosisService.concept(testUuid)
    .subscribe(res => {
      const result = res.answers;
      result.forEach(ans => {
        this.test.push(this.translationService.getDropdownTranslation('tests', ans.display));
      });
    });
    this.visitUuid = this.route.snapshot.paramMap.get('visit_id');
    this.patientId = this.route.snapshot.params['patient_id'];
    this.diagnosisService.getObs(this.patientId, this.conceptTest)
    .subscribe(response => {
      response.results.forEach(async obs => {
        if (obs.encounter.visit.uuid === this.visitUuid) {
          if (obs.comment) {
            const comment = obs.comment.split('|');
            obs.creatorRegNo = comment[5] != 'NA' ? `(${comment[5]})` : "(-)";
            obs.deletorRegNo = comment[3] != 'NA' ? `(${comment[3]})` : "(-)";
            this.tests.push(this.diagnosisService.getData(obs));
          } else {
            obs.creatorRegNo = await this.sessionSvc.getRegNo(obs.creator.uuid);
            this.tests.push(this.diagnosisService.getData(obs));
          }
        }
      });
      this.visitSvc.lockPrescribedTest.next();
    });

    this.visitSvc.fetchVisitDetails(this.visitUuid).subscribe(visitDetail => {
      visitDetail.encounters.filter((e) => {
        let medObs = {}
        if(e.display.includes("ENCOUNTER_TEST_COLLECT")){
          for(let i = 0; i < e.obs.length; i++){
            if(e.obs[i].display.includes("OBS_TEST_COLLECT")){              
              let obsData = JSON.parse(e.obs[i].value)
              medObs['medicationUuidList'] = obsData.medicationUuidList
              medObs['obsDatetime'] = e.obs[i].obsDatetime
              medObs['creator'] = {'collected' : e.obs[i].creator.display}
            }
          }
          this.medicineObs.push(medObs);
        }
        if(e.display.includes("ENCOUNTER_TEST_RECEIVE")){
          for(let i = 0; i < e.obs.length; i++){
            if(e.obs[i].display.includes("OBS_TEST_RECEIVE")){              
              let obsData = JSON.parse(e.obs[i].value)
              medObs['medicationUuidList'] = obsData.medicationUuidList
              medObs['obsDatetime'] = e.obs[i].obsDatetime
              medObs['creator'] = {'resulted' : e.obs[i].creator.display}
            }
          }
          this.medicineObs.push(medObs);
        }
        if(e.display.includes("Visit Note")){
          this.getMedicineList(e.obs,this.medicineObs);
        }
      });      
    });

    this.visitSvc.lockPrescribedTest.subscribe({
      next: () => {
        if(this.visitSvc?.prescribedTest && this.tests?.length){
          this.tests.forEach( tst => {
            if(Array.isArray(this.visitSvc.prescribedTest)){
              this.visitSvc.prescribedTest.forEach(tstData => {
                if (Array.isArray(tstData?.medicationUuidList) && !tst.disabled) {
                  tst.disabled = tstData?.medicationUuidList.includes(tst.uuid);
                }
              });
            }
          });
        }
      }
    });
    this.eventsSubscription = this.events?.subscribe(() => this.testEvent());
  }

  ngOnDestroy() {
    this.visitSvc.lockPrescribedTest.unsubscribe();
    this.eventsSubscription?.unsubscribe();
  }

  submit() {
    const date = new Date();
    const form = this.testForm.value;
    const value = form.test;
    if (this.tests.filter(o => o.value.toLowerCase() == value.toLowerCase() && o.comment == null).length > 0) {
      this.ngxTranslationService.get('messages.cantAdd').subscribe((res: string) => {
        this.snackbar.open(res,null, {duration: 4000,direction: this.txtDirection});
      });
      return;
    }
    if (this.diagnosisService.isEncounterProvider()) {
      this.encounterUuid = getEncounterUUID();
      this.diagnosisService.getTranslationData();
      setTimeout(() => {
        const json = {
          concept: this.conceptTest,
          person: this.patientId,
          obsDatetime: date,
          value: JSON.stringify(this.diagnosisService.getBody('tests', value)),
          encounter: this.encounterUuid
        };

        this.tempTest.push(json);
        const user = getFromStorage("user");
        this.tempTestDisplay.push({ value: value, obsDatetime: date, creatorRegNo:`(${getFromStorage("registrationNumber")})`, creator: { uuid: user.uuid, person: user.person }});
  
        // this.service.postObs(json)
        // .subscribe(resp => {
        //   const user = getFromStorage("user");
        //   let obj = {
        //     uuid : resp.uuid,
        //     value: json.value,
        //     obsDatetime: resp.obsDatetime,
        //     creatorRegNo:`(${getFromStorage("registrationNumber")})`,
        //     creator: { uuid: user.uuid, person: user.person }
        //   }
        //   this.tests.push(this.diagnosisService.getData(obj));
        // });
      }, 1000);
    }
  }

  get txtDirection() {
    return localStorage.getItem("selectedLanguage") === 'ar' ? "rtl" : "ltr";
  }

  delete(i) {

    if (this.diagnosisService.isEncounterProvider()) {
      const observation = this.tests[i];
      const uuid = observation.uuid;
      if (observation.comment) {
        console.log("Can't delete, already deleted")
      } else {
        // if (observation.creator.uuid == getFromStorage("user").uuid) {
        //   this.diagnosisService.deleteObs(uuid)
        //   .subscribe(() => {
        //     this.tests.splice(i, 1);
        //   });
        // } else {
          const provider = getFromStorage("provider");
          const deletorRegistrationNumber = getFromStorage("registrationNumber");
          const creatorRegistrationNumber = observation.creatorRegNo.replace('(', "").replace(')', "");
          const deletedTimestamp = moment.utc().toISOString();
          const prevCreator = observation?.creator?.person?.display;
          this.diagnosisService.updateObs(uuid, { comment: `DELETED|${deletedTimestamp}|${provider?.person?.display}|${deletorRegistrationNumber?deletorRegistrationNumber:'NA'}|${prevCreator}|${creatorRegistrationNumber?creatorRegistrationNumber:'NA'}|${observation.obsDatetime.replace('+0000','Z')}` })
          .subscribe(() => {
            this.tests[i] = {...this.tests[i], comment: `DELETED|${deletedTimestamp}|${provider?.person?.display}|${deletorRegistrationNumber?deletorRegistrationNumber:'NA'}|${prevCreator}|${creatorRegistrationNumber?creatorRegistrationNumber:'NA'}|${observation.obsDatetime.replace('+0000','Z')}` };
          });
        // }
      }
    }

    // if (this.diagnosisService.isSameDoctor()) {
    //   const uuid = this.tests[i].uuid;
    //                                                                                                                                                                    this.diagnosisService.deleteObs(uuid)
    //   .subscribe(() => {
    //     this.tests.splice(i, 1);
    //   });
    // }
  }

  getLang() {
    return localStorage.getItem("selectedLanguage");
  }

  getMedicineList(obs:any, arr:any){
    for(let j = 0; j < obs.length; j++){
      let disAdminObs = {};
      let obsArr = [];
      if(obs[j].display.includes("REQUESTED TESTS")){
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
  }

  toggleShow(index: number): void {
    this.isShow[index] = !this.isShow[index];
  }

  testEvent(){
    for (let i = 0; i < this.tempTest.length; i++) {
      this.service.postObs(this.tempTest[i]).subscribe(response => {
        const user = getFromStorage("user");
        const obj = {
          uuid : response.uuid,
          value: response.value,
          obsDatetime: response.obsDatetime,
          creatorRegNo:`(${getFromStorage("registrationNumber")})`,
          creator: { uuid: user.uuid, person: user.person }
        }
        this.tests.push(this.diagnosisService.getData(obj));
      });
    }

    setTimeout(() => {
      this.tempTestDisplay = [];
      this.tempTest = [];
    }, 500);
  }

  tempDelete(i){    
    return this.tempTestDisplay.splice(i, 1) && this.tempTest.splice(i, 1);
  }

  unSaveChanges() {
    return this.tempTestDisplay.length > 0 && this.tempTest.length > 0;
  }
}

