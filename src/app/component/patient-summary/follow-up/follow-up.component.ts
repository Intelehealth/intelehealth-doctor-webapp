import { Component, OnInit } from '@angular/core';
import { EncounterService } from 'src/app/services/encounter.service';
import { ActivatedRoute } from '@angular/router';
import { FormGroup, FormControl } from '@angular/forms';
import { DiagnosisService } from 'src/app/services/diagnosis.service';

@Component({
  selector: 'app-follow-up',
  templateUrl: './follow-up.component.html',
  styleUrls: ['./follow-up.component.css']
})
export class FollowUpComponent implements OnInit {
followUp: any = [];
encounterUuid: string;
patientId: string;
errorText: string;

followForm = new FormGroup({
  date: new FormControl(''),
  advice: new FormControl('')
});

  constructor(private service: EncounterService,
              private diagnosisService: DiagnosisService,
              private route: ActivatedRoute) { }

  ngOnInit() {
    this.patientId = this.route.snapshot.params['patient_id'];
    this.service.visitNote(this.patientId)
    .subscribe(response => {
      this.encounterUuid = response.results[0].uuid;
      this.service.vitals(this.encounterUuid)
      .subscribe(res => {
        const obs = res.obs;
        obs.forEach(observation => {
          const display = observation.display;
          if (display.match('Follow up visit') != null) {
            const msg = display.slice(16, display.length);
            this.followUp.push({msg: msg, uuid: observation.uuid});
          }
        });
      });
    });
  }

  Submit() {
    const date = new Date();
    const form = this.followForm.value;
    const obsdate = form.date;
    const advice = form.advice;
    if (!obsdate || !advice) {
      this.errorText = 'Please enter text.';
    } else {
    const json = {
      concept: 'e8caffd6-5d22-41c4-8d6a-bc31a44d0c86',
      person: this.patientId,
      obsDatetime: date,
      value: `${obsdate}, Advice: ${advice}`,
      encounter: this.encounterUuid
      };
      this.service.postObs(json)
      .subscribe(res => {
        this.followUp.push({msg: json.value});
        this.errorText = '';
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
