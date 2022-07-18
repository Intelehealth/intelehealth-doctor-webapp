import { animate, keyframes, style, transition, trigger } from '@angular/animations';
import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { DiagnosisService } from 'src/app/services/diagnosis.service';
import { EncounterService } from 'src/app/services/encounter.service';
declare var getEncounterUUID: any;

@Component({
  selector: 'app-weight-history',
  templateUrl: './weight-history.component.html',
  styleUrls: ['./weight-history.component.css'],
  animations: [
    trigger("moveInLeft", [
      transition("void=> *", [
        style({ transform: "translateX(300px)" }),
        animate(
          200,
          keyframes([
            style({ transform: "translateX(300px)" }),
            style({ transform: "translateX(0)" }),
          ])
        ),
      ]),
      transition("*=>void", [
        style({ transform: "translateX(0px)" }),
        animate(
          100,
          keyframes([
            style({ transform: "translateX(0px)" }),
            style({ transform: "translateX(300px)" }),
          ])
        ),
      ]),
    ]),
  ],
})
export class WeightHistoryComponent implements OnInit {
  @Output() isDataPresent = new EventEmitter<boolean>();
  weightHistoryConcept = '51133d22-8b1b-44ea-8147-cd8ab4b6a6e1';
  historyTypes = ['Weight Gain', 'Weight Loss'];
  patientId = '';
  visitUuid = '';
  history = []
  otherText = '';

  historyForm = new FormGroup({
    text: new FormControl("", [Validators.required]),
  });

  constructor(
    private diagnosisService: DiagnosisService,
    private route: ActivatedRoute,
    private service: EncounterService,
  ) { }

  ngOnInit(): void {
    this.patientId = this.route.snapshot.params["patient_id"];
    this.visitUuid = this.route.snapshot.paramMap.get("visit_id");
    this.diagnosisService
      .getObs(this.patientId, this.weightHistoryConcept)
      .subscribe((response) => {
        response.results.forEach((obs) => {
          if (obs.encounter.visit.uuid === this.visitUuid) {
            this.history.push(obs);
            this.setValue(obs.value);
          }
        });
      });
  }

  setValue(val) {
    const splitted = val.split(':');
    if (splitted.length > 1) {
      this.historyForm.controls.text.setValue(splitted[0]);
      this.otherText = splitted[1];
    } else {
      this.historyForm.controls.text.setValue(val);
    }
  }


  get isInvalid() {
    return !this.value.text;
  }

  get value() {
    return this.historyForm.value;
  }

  submit() {
    this.history.forEach((hist, idx) => {
      this.delete(idx);
    });
    const json = {
      concept: this.weightHistoryConcept,
      person: this.patientId,
      obsDatetime: new Date(),
      value: this.otherText ? `${this.value.text}:${this.otherText}` : this.value.text,
      encounter: getEncounterUUID(),
    };
    this.service.postObs(json).subscribe((response) => {
      this.isDataPresent.emit(true);
      this.history.push({ uuid: response.uuid, value: this.value.text });
      this.setValue(this.value.text);
    });
  }

  delete(i) {
    if (this.diagnosisService.isSameDoctor()) {
      const uuid = this.history[i].uuid;
      this.diagnosisService.deleteObs(uuid).subscribe((res) => {
        this.history.splice(i, 1);
        if (this.history.length === 0) {
          this.isDataPresent.emit(false);
        }
      });
    }
  }

}
