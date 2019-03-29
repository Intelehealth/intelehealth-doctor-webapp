import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { EncounterService } from 'src/app/services/encounter.service';
import { DiagnosisService } from './../../../services/diagnosis.service';

@Component({
  selector: 'app-additional-comment',
  templateUrl: './additional-comment.component.html',
  styleUrls: ['./additional-comment.component.css']
})
export class AdditionalCommentComponent implements OnInit {
comment: any = [];
encounterUuid: string;

  commentForm = new FormGroup ({
    comment: new FormControl('')
  });

  constructor(private service: EncounterService,
              private diagnosisService: DiagnosisService,
              private route: ActivatedRoute) { }

  ngOnInit() {
    const patientId = this.route.snapshot.params['patient_id'];
    this.service.visitNote(patientId)
    .subscribe(response => {
      this.encounterUuid = response.results[0].uuid;
      this.service.vitals(this.encounterUuid)
      .subscribe(res => {
        const obs = res.obs;
        obs.forEach(observation => {
          const display = observation.display;
          if (display.match('Additional Comments') != null) {
            const msg = display.slice(21, display.length);
            this.comment.push({msg: msg, uuid: observation.uuid});
          }
        });
      });
    });
  }

  Submit() {
    const date = new Date();
    const patientId = this.route.snapshot.params['patient_id'];
    const form = this.commentForm.value;
    const value = form.comment;
    const json = {
      concept: '162169AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
      person: patientId,
      obsDatetime: date,
      value: value,
      encounter: this.encounterUuid
    };
    this.service.postObs(json)
    .subscribe(res => {
      this.comment.push({msg: value});
    });
  }

  delete(i) {
    const uuid = this.comment[i].uuid;
    this.diagnosisService.deleteObs(uuid)
    .subscribe(res => {
      this.comment.splice(i, 1);
    });
  }

}
