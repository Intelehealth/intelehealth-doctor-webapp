import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
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
patientId: string;
conceptComment = '162169AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA';

  commentForm = new FormGroup ({
    comment: new FormControl('', [Validators.required])
  });

  constructor(private service: EncounterService,
              private diagnosisService: DiagnosisService,
              private route: ActivatedRoute) { }

  ngOnInit() {
    this.patientId = this.route.snapshot.params['patient_id'];
    this.diagnosisService.getObs(this.patientId, this.conceptComment)
    .subscribe(response => {
      this.comment = response.results;
    });
  }

  Submit() {
    const date = new Date();
    const patientId = this.route.snapshot.params['patient_id'];
    const form = this.commentForm.value;
    const value = form.comment;
    this.service.visitNote(this.patientId)
        .subscribe(res => {
        this.encounterUuid = res.results[0].uuid;
    const json = {
      concept: this.conceptComment,
      person: patientId,
      obsDatetime: date,
      value: value,
      encounter: this.encounterUuid
    };
    this.service.postObs(json)
    .subscribe(resp => {
      this.comment.push({value: value});
      this.commentForm.reset();
    });
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
