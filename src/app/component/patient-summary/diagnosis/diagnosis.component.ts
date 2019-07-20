import { VisitService } from 'src/app/services/visit.service';
import { Component, OnInit } from '@angular/core';
import { EncounterService } from 'src/app/services/encounter.service';
import { ActivatedRoute } from '@angular/router';
import { DiagnosisService } from 'src/app/services/diagnosis.service';
import { Validators, FormGroup, FormControl } from '@angular/forms';
import { transition, trigger, style, animate, keyframes } from '@angular/animations';

@Component({
  selector: 'app-diagnosis',
  templateUrl: './diagnosis.component.html',
  styleUrls: ['./diagnosis.component.css'],
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
export class DiagnosisComponent implements OnInit {
diagnosis: any = [];
conceptDiagnosis = '537bb20d-d09d-4f88-930b-cc45c7d662df';
patientId: string;
visitUuid: string;
encounterUuid: string;

diagnosisForm = new FormGroup({
  text: new FormControl('', [Validators.required]),
  type: new FormControl('', [Validators.required]),
  confirm: new FormControl('', [Validators.required])
});

  constructor(private service: EncounterService,
              private visitService: VisitService,
              private diagnosisService: DiagnosisService,
              private route: ActivatedRoute) { }

  ngOnInit() {
    this.visitUuid = this.route.snapshot.paramMap.get('visit_id');
    this.patientId = this.route.snapshot.params['patient_id'];
    this.diagnosisService.getObs(this.patientId, this.conceptDiagnosis)
    .subscribe(response => {
      response.results.forEach(obs => {
        if (obs.encounter.visit.uuid === this.visitUuid) {
          this.diagnosis.push(obs);
        }
      });
    });
  }

  onSubmit() {
    const date = new Date();
    const value = this.diagnosisForm.value;
    this.visitService.fetchVisitDetails(this.visitUuid)
    .subscribe(visitDetails => {
      visitDetails.encounters.forEach(encounter => {
        if (encounter.display.match('Visit Note') !== null) {
          this.encounterUuid = encounter.uuid;
          const json = {
            concept: this.conceptDiagnosis,
            person: this.patientId,
            obsDatetime: date,
            value: `${value.text}:${value.type} & ${value.confirm}`,
            encounter: this.encounterUuid
        };
        this.service.postObs(json)
        .subscribe(resp => {
          this.diagnosis.push({value: json.value});
          Object.keys(this.diagnosisForm.controls).forEach(controlName => {
            this.diagnosisForm.controls[controlName].reset();
            this.diagnosisForm.controls[controlName].setErrors(null);
          });
      });
        }
      });
});
}

  delete(i) {
    const uuid = this.diagnosis[i].uuid;
    this.diagnosisService.deleteObs(uuid)
    .subscribe(res => {
      this.diagnosis.splice(i, 1);
    });
  }
}
