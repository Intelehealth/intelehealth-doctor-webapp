import { animate, keyframes, style, transition, trigger } from '@angular/animations';
import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { DiagnosisService } from 'src/app/services/diagnosis.service';
import { EncounterService } from 'src/app/services/encounter.service';
declare var getEncounterUUID: any;

@Component({
  selector: 'app-diet-prescription',
  templateUrl: './diet-prescription.component.html',
  styleUrls: ['./diet-prescription.component.css'],
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
export class DietPrescriptionComponent implements OnInit {
  @Output() isDataPresent = new EventEmitter<boolean>();
  public value: any
  conceptId = '22d12b6c-eed6-44da-97cc-e73fbaf41e33';
  patientId = '';
  visitUuid = '';
  history = []

  constructor(
    private diagnosisService: DiagnosisService,
    private route: ActivatedRoute,
    private service: EncounterService,
  ) { }

  ngOnInit(): void {
    this.patientId = this.route.snapshot.params["patient_id"];
    this.visitUuid = this.route.snapshot.paramMap.get("visit_id");
    this.diagnosisService
      .getObs(this.patientId, this.conceptId)
      .subscribe((response) => {
        response.results.forEach((obs) => {
          if (obs.encounter.visit.uuid === this.visitUuid) {
            this.history.push(obs);
          }
        });
      });
  }


  get isInvalid() {
    return !this.value;
  }

  submit() {
    const json = {
      concept: this.conceptId,
      person: this.patientId,
      obsDatetime: new Date(),
      value: this.value,
      encounter: getEncounterUUID(),
    };
    this.service.postObs(json).subscribe((response) => {
      this.isDataPresent.emit(true);
      this.history.push({ uuid: response.uuid, value: this.value });
      this.value = '';
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
