import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { EncounterService } from 'src/app/services/encounter.service';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { DiagnosisService } from 'src/app/services/diagnosis.service';
import { Observable } from 'rxjs';
import {debounceTime, distinctUntilChanged, map} from 'rxjs/operators';
import { transition, trigger, style, animate, keyframes } from '@angular/animations';
import { VisitService } from 'src/app/services/visit.service';

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
export class PrescribedTestComponent implements OnInit {
tests: any = [];
test =  [];
conceptTest = '23601d71-50e6-483f-968d-aeef3031346d';
encounterUuid: string;
patientId: string;
visitUuid: string;
errorText: string;

testForm = new FormGroup({
  test: new FormControl('', [Validators.required])
});

  constructor(private service: EncounterService,
              private visitService: VisitService,
              private diagnosisService: DiagnosisService,
              private route: ActivatedRoute) { }


      search = (text$: Observable<string>) =>
      text$.pipe(
      debounceTime(200),
      distinctUntilChanged(),
      map(term => term.length < 1 ? []
        : this.test.filter(v => v.toLowerCase().indexOf(term.toLowerCase()) > -1).slice(0, 10))
      )

  ngOnInit() {
    const testUuid = '98c5881f-b214-4597-83d4-509666e9a7c9';
    this.diagnosisService.concept(testUuid)
    .subscribe(res => {
      const result = res.answers;
      result.forEach(ans => {
        this.test.push(ans.display);
      });
    });
    this.visitUuid = this.route.snapshot.paramMap.get('visit_id');
    this.patientId = this.route.snapshot.params['patient_id'];
    this.diagnosisService.getObs(this.patientId, this.conceptTest)
    .subscribe(response => {
      response.results.forEach(obs => {
        if (obs.encounter.visit.uuid === this.visitUuid) {
          this.tests.push(obs);
        }
      });
    });
  }

  submit() {
    const date = new Date();
    const form = this.testForm.value;
    const value = form.test;
    this.visitService.fetchVisitDetails(this.visitUuid)
    .subscribe(visitDetails => {
      visitDetails.encounters.forEach(encounter => {
      if (encounter.display.match('Visit Note') !== null) {
      this.encounterUuid = encounter.uuid;
      const json = {
              concept: this.conceptTest,
              person: this.patientId,
              obsDatetime: date,
              value: value,
              encounter: this.encounterUuid
      };
      this.service.postObs(json)
      .subscribe(resp => {
        this.tests.push({value: value});
      });
    }
  });
  });
}

    delete(i) {
      const uuid = this.tests[i].uuid;
      this.diagnosisService.deleteObs(uuid)
      .subscribe(res => {
        this.tests.splice(i, 1);
      });
    }
}

