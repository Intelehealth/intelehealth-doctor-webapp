import { Component, OnInit } from '@angular/core';
import { EncounterService } from 'src/app/services/encounter.service';
import { ActivatedRoute } from '@angular/router';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { DiagnosisService } from 'src/app/services/diagnosis.service';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-follow-up',
  templateUrl: './follow-up.component.html',
  styleUrls: ['./follow-up.component.css']
})
export class FollowUpComponent implements OnInit {
followUp: any = [];
conceptFollow = 'e8caffd6-5d22-41c4-8d6a-bc31a44d0c86';
encounterUuid: string;
patientId: string;
errorText: string;

followForm = new FormGroup({
  date: new FormControl('', [Validators.required]),
  advice: new FormControl('')
});

  constructor(private service: EncounterService,
              private diagnosisService: DiagnosisService,
              private route: ActivatedRoute,
              private datepipe: DatePipe) { }

  ngOnInit() {
    this.patientId = this.route.snapshot.params['patient_id'];
    this.diagnosisService.getObs(this.patientId, this.conceptFollow)
    .subscribe(response => {
      this.followUp = response.results;
    });
  }

  Submit() {
    const date = new Date();
    const form = this.followForm.value;
    const obsdate = this.datepipe.transform(form.date, 'dd-MM-yyyy');
    const advice = form.advice;
    if (!obsdate || !advice) {
      this.errorText = 'Please enter text.';
    } else {
    this.service.visitNote(this.patientId)
      .subscribe(res => {
      this.encounterUuid = res.results[0].uuid;
    const json = {
      concept: this.conceptFollow,
      person: this.patientId,
      obsDatetime: date,
      value: `${obsdate}, Advice: ${advice}`,
      encounter: this.encounterUuid
      };
      this.service.postObs(json)
      .subscribe(resp => {
        this.followUp.push({value: json.value});
        this.errorText = '';
        this.followForm.reset();
      });
    });
    }
  }

  delete(i) {
    const uuid = this.followUp[i].uuid;
    this.diagnosisService.deleteObs(uuid)
    .subscribe(res => {
      this.followUp.splice(i, 1);
    });
  }

}
