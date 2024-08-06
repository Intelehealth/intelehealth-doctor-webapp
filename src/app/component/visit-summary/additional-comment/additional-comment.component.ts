import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { EncounterService } from 'src/app/services/encounter.service';
import { DiagnosisService } from '../../../services/diagnosis.service';
import { transition, trigger, style, animate, keyframes } from '@angular/animations';
declare var getEncounterUUID: any;

@Component({
  selector: 'app-additional-comment',
  templateUrl: './additional-comment.component.html',
  styleUrls: ['./additional-comment.component.css'],
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
export class AdditionalCommentComponent implements OnInit {
@Input() isManagerRole : boolean;
@Input() conceptId : string = '162169AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA';
@Input() title : string = 'Notes';
comment: any = [];
encounterUuid: string;
patientId: string;
visitUuid: string;
@Output() notesChange: EventEmitter<any> = new EventEmitter();

  commentForm = new FormGroup ({
    comment: new FormControl('', [Validators.required])
  });

  constructor(private service: EncounterService,
              private diagnosisService: DiagnosisService,
              private route: ActivatedRoute) { }

  ngOnInit() {
    this.visitUuid = this.route.snapshot.paramMap.get('visit_id');
    this.patientId = this.route.snapshot.params['patient_id'];
    this.diagnosisService.getObs(this.patientId, this.conceptId)
    .subscribe(response => {
      response.results.forEach(obs => {
        if (obs.encounter.visit.uuid === this.visitUuid) {
          this.comment.push(obs);
        }
        this.emitNotes();
      });
    });
  }

  Submit() {
    const date = new Date();
    const form = this.commentForm.value;
    const value = form.comment;
    if (this.diagnosisService.isSameDoctor()) {
      this.encounterUuid = getEncounterUUID();
      const json = {
        concept: this.conceptId,
        person: this.patientId,
        obsDatetime: date,
        value: value,
        encounter: this.encounterUuid
      };
      this.service.postObs(json)
      .subscribe(resp => {
      this.comment.push({uuid: resp.uuid, value: value});
      this.emitNotes();
    });
  }
}

  delete(i) {
    if (this.diagnosisService.isSameDoctor()) {
      const uuid = this.comment[i].uuid;
      this.diagnosisService.deleteObs(uuid)
      .subscribe(() => {
        this.comment.splice(i, 1);
        this.emitNotes();
      });
    }
  }

  emitNotes(){
    if(this.title === 'Notes'){
      this.notesChange.emit(this.comment);
    }
  }
}
