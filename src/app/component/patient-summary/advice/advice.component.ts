import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { EncounterService } from 'src/app/services/encounter.service';
import { DiagnosisService } from 'src/app/services/diagnosis.service';
import { FormControl, FormGroup } from '@angular/forms';
import { Observable } from 'rxjs';
import {debounceTime, distinctUntilChanged, map} from 'rxjs/operators';

@Component({
  selector: 'app-advice',
  templateUrl: './advice.component.html',
  styleUrls: ['./advice.component.css']
})
export class AdviceComponent implements OnInit {
advice: any = [];
conceptAdvice = [];
encounterUuid: string;
patientId: string;
errorText: string;

adviceForm = new FormGroup({
  advice: new FormControl('')
});

  constructor(private service: EncounterService,
              private diagnosisService: DiagnosisService,
              private route: ActivatedRoute) { }

    search = (text$: Observable<string>) =>
    text$.pipe(
      debounceTime(200),
      distinctUntilChanged(),
      map(term => term.length < 1 ? []
        : this.conceptAdvice.filter(v => v.toLowerCase().indexOf(term.toLowerCase()) > -1).slice(0, 10))
    )

  ngOnInit() {
    const adviceUuid = '0308000d-77a2-46e0-a6fa-a8c1dcbc3141';
    this.diagnosisService.concept(adviceUuid)
    .subscribe(res => {
      const result = res.answers;
      result.forEach(ans => {
        this.conceptAdvice.push(ans.display);
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
          if (display.match('MEDICAL ADVICE') != null) {
            const msg = display.slice(16, display.length);
            this.advice.push({msg: msg, uuid: observation.uuid});
          }
        });
      });
    });
  }

  submit() {
    const date = new Date();
    const form = this.adviceForm.value;
    const value = form.advice;
    if (!value) {
      this.errorText = 'Please enter text.';
    } else {
    const json = {
      concept: '67a050c1-35e5-451c-a4ab-fff9d57b0db1',
            person: this.patientId,
            obsDatetime: date,
            value: value,
            encounter: this.encounterUuid
    };
    this.service.postObs(json)
    .subscribe(res => {
      this.advice.push({msg: value});
      this.errorText = '';
    });
  }
}

  delete(i) {
    const uuid = this.advice[i].uuid;
    this.diagnosisService.deleteObs(uuid)
    .subscribe(res => {
      this.advice.splice(i, 1);
    });
  }
}

