import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { EncounterService } from 'src/app/services/encounter.service';
import { FormControl, FormGroup } from '@angular/forms';
import { DiagnosisService } from 'src/app/services/diagnosis.service';
import { Observable } from 'rxjs';
import {debounceTime, distinctUntilChanged, map} from 'rxjs/operators';

@Component({
  selector: 'app-prescribed-test',
  templateUrl: './prescribed-test.component.html',
  styleUrls: ['./prescribed-test.component.css']
})
export class PrescribedTestComponent implements OnInit {
tests: any = [];
conceptTest =  [];
encounterUuid: string;
patientId: string;
errorText: string;

testForm = new FormGroup({
  test: new FormControl('')
});

  constructor(private service: EncounterService,
              private diagnosisService: DiagnosisService,
              private route: ActivatedRoute) { }


      search = (text$: Observable<string>) =>
      text$.pipe(
      debounceTime(200),
      distinctUntilChanged(),
      map(term => term.length < 1 ? []
        : this.conceptTest.filter(v => v.toLowerCase().indexOf(term.toLowerCase()) > -1).slice(0, 10))
      )

  ngOnInit() {
    const testUuid = '98c5881f-b214-4597-83d4-509666e9a7c9';
    this.diagnosisService.concept(testUuid)
    .subscribe(res => {
      const result = res.answers;
      result.forEach(ans => {
        this.conceptTest.push(ans.display);
      });
    });
    this.patientId = this.route.snapshot.params['patient_id'];
    this.service.visitNote(this.patientId)
    .subscribe(response => {
      this.encounterUuid = response.results[0].uuid;
      this.service.vitals(this.encounterUuid)
      .subscribe(res => {
        const obs = res.obs;
        obs.forEach(observation => {
          const display = observation.display;
          if (display.match('REQUESTED TESTS') != null) {
            const msg = display.slice(16, display.length);
            this.tests.push({msg: msg, uuid: observation.uuid});
          }
        });
      });
    });
  }

  submit() {
    const date = new Date();
    const form = this.testForm.value;
    const value = form.test;
    if (!value) {
      this.errorText = 'Please enter text.';
    } else {
      const json = {
              concept: '23601d71-50e6-483f-968d-aeef3031346d',
              person: this.patientId,
              obsDatetime: date,
              value: value,
              encounter: this.encounterUuid
      };
      this.service.postObs(json)
      .subscribe(res => {
        this.tests.push({msg: value});
        this.errorText = '';
      });
    }
    }

    delete(i) {
      const uuid = this.tests[i].uuid;
      this.diagnosisService.deleteObs(uuid)
      .subscribe(res => {
        this.tests.splice(i, 1);
      });
    }
}

