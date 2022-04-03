import { ImagesService } from 'src/app/services/images.service';
import { Component, Input, OnInit } from '@angular/core';
import { EncounterService } from 'src/app/services/encounter.service';
import { ActivatedRoute } from '@angular/router';
import { DiagnosisService } from 'src/app/services/diagnosis.service';
import { FormGroup, FormControl } from '@angular/forms';
import { transition, trigger, style, animate, keyframes } from '@angular/animations';
import { MatSnackBar } from '@angular/material/snack-bar';
import { v4 as uuidv4 } from 'uuid';
declare var getEncounterProviderUUID: any, getFromStorage: any, getEncounterUUID: any, checkReview: any;

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
  eyeDiagnosisList = ['Immature Cataract', 'Mature Cataract', 'Refractive Error', 'Pterygium', 'Normal Eye Exam'];
  // conceptDiagnosis = '537bb20d-d09d-4f88-930b-cc45c7d662df';
  conceptLeftEyeDiagnosis: String = '1796244d-e936-4ab8-ac8a-c9bcfa476570';
  conceptRightEyeDiagnosis: String = '58cae684-1509-4fd5-b256-5ca980ec6bb4';
  conceptLeftEyeDiagnosisReview1: String = 'd72f7295-f1e1-436f-bac4-5ad88b6dc6cb';
  conceptRightEyeDiagnosisReview1: String = 'f7d5d646-bb4e-4f26-970d-0df61b3b138f';
  conceptLeftEyeDiagnosisReview2: String = '7323ebb4-9ac2-4bd7-8ef5-3988d7bf6f7c';
  conceptRightEyeDiagnosisReview2: String = '7633430a-fef7-4d6b-ba47-238bafa68024';
  conceptCoordinatorLeftEyeDiagnosis: String = 'e91cda51-caed-4f95-8a94-97135b5a865d';
  conceptCoordinatorRightEyeDiagnosis: String = 'b30f2a76-e216-48cf-aa6d-d50e6cca917f';
  patientId: string;
  visitUuid: string;
  encounterUuid: string;
  showLeftEyeOtherInput: Boolean = false;
  showRightEyeOtherInput: Boolean = false;
  coordinator: Boolean = getFromStorage('coordinator') || false;
  @Input() showDetails;
  @Input() data;

  diagnosisConcept = [
    {concept: this.conceptLeftEyeDiagnosis, name: 'leftDiagnosis'},
    {concept: this.conceptRightEyeDiagnosis , name: 'rightDiagnosis'}
  ];

  diagnosisConceptReview1 = [
    {concept: this.conceptLeftEyeDiagnosisReview1, name: 'leftDiagnosis'},
    {concept: this.conceptRightEyeDiagnosisReview1 , name: 'rightDiagnosis'}
  ];

  diagnosisConceptReview2 = [
    {concept: this.conceptLeftEyeDiagnosisReview2, name: 'leftDiagnosis'},
    {concept: this.conceptRightEyeDiagnosisReview2 , name: 'rightDiagnosis'}
  ];

  rightConcept: string;

  diagnosisForm = new FormGroup({
    lefteye: new FormControl(''),
    righteye: new FormControl(''),
    leftEyeOtherValue: new FormControl(''),
    rightEyeOtherValue: new FormControl('')
  });

  constructor(private service: EncounterService,
    private imageService: ImagesService,
    private diagnosisService: DiagnosisService,
    private snackbar: MatSnackBar,
    private route: ActivatedRoute) { }

  ngOnInit() {
    this.visitUuid = this.route.snapshot.paramMap.get('visit_id');
    this.patientId = this.route.snapshot.params['patient_id'] || this.data.patientId;
    const reviewVisit = checkReview(this.visitUuid);
    this.rightConcept = reviewVisit?.reviewType === 1 ? 'diagnosisConceptReview1' : reviewVisit?.reviewType === 2 ? 'diagnosisConceptReview2' : 'diagnosisConcept';
    this[this.rightConcept].forEach(each => {
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
    const list = ['Inactive Corneal Opacity', 'Pseudophakia', 'Conjunctivitis',
          'Subconjunctival hemorrhage', 'Presbyopia',
          'Active Corneal Infection', 'Posterior Segment Screening',
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
    if (providerDetails && providerDetails.uuid === getEncounterProviderUUID() || this.showDetails) {
      this.encounterUuid = getEncounterUUID();
      let concept1 = side === 'right' ? this[this.rightConcept][1].concept : this[this.rightConcept][0].concept;
        // tslint:disable-next-line: max-line-length
      let concept2 = side === 'right' ? this.showDetails ? this.conceptCoordinatorRightEyeDiagnosis : this.conceptRightEyeDiagnosis : this.showDetails ? this.conceptCoordinatorLeftEyeDiagnosis : this.conceptLeftEyeDiagnosis;
      console.log('concept1', concept1)
      console.log('concept2',concept2)
      const json = {
        concept: concept1,
        person: this.patientId,
        obsDatetime: date,
        value: side === 'right' ? value.righteye : value.lefteye,
        encounter: this.encounterUuid
      };
      console.log(json)
      this.service.postObs(json)
        .subscribe(resp => {
          const allImages = getFromStorage('physicalImages');
          const filteredImage = allImages.filter(image => image.type === side);
          if (filteredImage.length) {
            const payload = {
              id: uuidv4(),
              diagnosis: json.value,
              created_by: providerDetails.person.display,
              images: []
            };
            filteredImage.forEach(im => {
              payload.images.push({
                ...im,
                diagnosis_id: payload.id
              });
            });
            this.imageService.saveDiagnosis(payload).subscribe(resposne => {console.log(resposne)});
          }
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
