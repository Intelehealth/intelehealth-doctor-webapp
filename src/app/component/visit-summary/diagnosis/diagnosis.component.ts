import { Component, OnInit } from '@angular/core';
import { EncounterService } from 'src/app/services/encounter.service';
import { ActivatedRoute } from '@angular/router';
import { DiagnosisService } from 'src/app/services/diagnosis.service';
import { Validators, FormGroup, FormControl } from '@angular/forms';
import { transition, trigger, style, animate, keyframes } from '@angular/animations';
import { MatSnackBar } from '@angular/material/snack-bar';
declare var getEncounterProviderUUID: any, getFromStorage: any, getEncounterUUID: any;

@Component({
  selector: 'app-diagnosis',
  templateUrl: './diagnosis.component.html',
  styleUrls: ['./diagnosis.component.css'],
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
export class DiagnosisComponent implements OnInit {
  leftDiagnosis: any = [];
  rightDiagnosis: any = [];
  diagnosisList = [];
  eyeDiagnosisList = ['Immature Cataract', 'Mature Cataract', 'Refractive Error', 'Pterygium', 'Normal'];
  // conceptDiagnosis = '537bb20d-d09d-4f88-930b-cc45c7d662df';
  conceptLeftEyeDiagnosis: String = '1796244d-e936-4ab8-ac8a-c9bcfa476570';
  conceptRightEyeDiagnosis: String = '58cae684-1509-4fd5-b256-5ca980ec6bb4';
  patientId: string;
  visitUuid: string;
  encounterUuid: string;
  showLeftEyeOtherInput: Boolean = false;
  showRightEyeOtherInput: Boolean = false;

  diagnosisForm = new FormGroup({
    lefteye: new FormControl(''),
    righteye: new FormControl(''),
    leftEyeOtherValue: new FormControl(''),
    rightEyeOtherValue: new FormControl('')
  });

  constructor(private service: EncounterService,
    private diagnosisService: DiagnosisService,
    private snackbar: MatSnackBar,
    private route: ActivatedRoute) { }

  ngOnInit() {
    this.visitUuid = this.route.snapshot.paramMap.get('visit_id');
    this.patientId = this.route.snapshot.params['patient_id'];
    [
      {concept: this.conceptLeftEyeDiagnosis, name: 'leftDiagnosis'},
      {concept: this.conceptRightEyeDiagnosis , name: 'rightDiagnosis'}
    ].forEach(each => {
      this.diagnosisService.getObs(this.patientId, each.concept)
      .subscribe(response => {
        response.results.forEach(obs => {
          if (obs.encounter.visit.uuid === this.visitUuid) {
            this[each.name].push(obs);
          }
        });
      });
    });
  }

  search(event) {
    const searchedTerm = event?.target?.value.toLowerCase();
    const list = ['Early Cataract', 'Nasal Pterygium', 'Corneal opacity', 'Pseudophakia', 'Conjunctivitis',
          'Subconjunctival hemorrhage', 'Infectious Keratitis/ Corneal infection', 'Presbyopia',
          'Corneal infection', 'Adherent Leucoma', 'Glaucoma Screening', 'Diabetic Retinopathy Screening',
          'Posterior Segment Screening', 'Cannot be assessed'];
    this.diagnosisList = list.filter(eye => eye.toLowerCase().includes(searchedTerm));
    // this.diagnosisService.getDiagnosisList(event.target.value)
    //   .subscribe(response => {
    //     this.diagnosisList = response;
    //   });
  }

  onChangeHandler = (type) => {
    if (type === 'right') {
      this.showRightEyeOtherInput = true;
    } else if (type === 'hideLeft') {
      this.showLeftEyeOtherInput = false;
    } else if (type === 'hideRight') {
        this.showRightEyeOtherInput = false;
    } else {
      this.showLeftEyeOtherInput = true;
    }
  }

  onSubmit(side) {
    const date = new Date();
    const value = this.diagnosisForm.value;
    value.lefteye = value.lefteye === 'Other' ? value.leftEyeOtherValue : value.lefteye;
    value.righteye = value.righteye === 'Other' ? value.rightEyeOtherValue : value.righteye;
    const providerDetails = getFromStorage('provider');
    const providerUuid = providerDetails.uuid;
    if (providerDetails && providerUuid === getEncounterProviderUUID()) {
      this.encounterUuid = getEncounterUUID();
      const json = {
        concept: side === 'right' ? this.conceptRightEyeDiagnosis : this.conceptLeftEyeDiagnosis,
        person: this.patientId,
        obsDatetime: date,
        value: side === 'right' ? value.righteye : value.lefteye,
        encounter: this.encounterUuid
      };
      this.service.postObs(json)
        .subscribe(resp => {
          this.diagnosisList = [];
          this[side === 'right' ? 'rightDiagnosis' : 'leftDiagnosis'].push({ uuid: resp.uuid, value: json.value });
        });
    } else { this.snackbar.open('Another doctor is viewing this case', null, { duration: 4000 }); }
  }

  delete(side, i) {
    const uuid = this[side === 'right' ? 'rightDiagnosis' : 'leftDiagnosis'][i].uuid;
    this.diagnosisService.deleteObs(uuid)
      .subscribe(res => {
        this[side === 'right' ? 'rightDiagnosis' : 'leftDiagnosis'].splice(i, 1);
      });
  }
}
