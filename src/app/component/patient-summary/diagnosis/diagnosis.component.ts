import { Component, OnInit } from '@angular/core';
import { EncounterService } from 'src/app/services/encounter.service';
import { ActivatedRoute } from '@angular/router';
import { DiagnosisService } from 'src/app/services/diagnosis.service';
import { Validators, FormGroup, FormControl } from '@angular/forms';

@Component({
  selector: 'app-diagnosis',
  templateUrl: './diagnosis.component.html',
  styleUrls: ['./diagnosis.component.css']
})
export class DiagnosisComponent implements OnInit {
diagnosis: any = [];
conceptDiagnosis = '537bb20d-d09d-4f88-930b-cc45c7d662df';
patientId: string;
encounterUuid: string;

diagnosisForm = new FormGroup({
  text: new FormControl('', [Validators.required])
});

  constructor(private service: EncounterService,
              private diagnosisService: DiagnosisService,
              private route: ActivatedRoute) { }

  ngOnInit() {
    this.patientId = this.route.snapshot.params['patient_id'];
    this.diagnosisService.getObs(this.patientId, this.conceptDiagnosis)
    .subscribe(response => {
      this.diagnosis = response.results;
    });
  }

  onSubmit() {
    const date = new Date();
    const value = this.diagnosisForm.value;
    this.service.visitNote(this.patientId)
    .subscribe(res => {
    this.encounterUuid = res.results[0].uuid;
    const json = {
      concept: this.conceptDiagnosis,
      person: this.patientId,
      obsDatetime: date,
      value: value.text,
      encounter: this.encounterUuid
  };
  console.log(json);
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
