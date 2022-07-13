import { animate, keyframes, style, transition, trigger } from '@angular/animations';
import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { DiagnosisService } from 'src/app/services/diagnosis.service';
import { EncounterService } from 'src/app/services/encounter.service';
declare var getEncounterUUID: any;

@Component({
  selector: 'app-diet-type',
  templateUrl: './diet-type.component.html',
  styleUrls: ['./diet-type.component.css'],
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
export class DietTypeComponent implements OnInit {
  @Output() isDataPresent = new EventEmitter<boolean>();
  public dietType: any;
  otherText;
  dietTypeConcept = '7ef63395-4c40-47e2-981c-7adf1647cca0';
  patientId = '';
  visitUuid = '';
  dietTypes = [
    'Mixed',
    'Vegeterian',
    'Non Vegeterian',
    'Lactoveg (Milk+Veg)',
    'Non Vegeterian',
    'Ovo Lacto Veg (Egg + Milk + Veg)',
    'Other(Enter Text)',
  ]
  diets = [];

  constructor(
    private diagnosisService: DiagnosisService,
    private route: ActivatedRoute,
    private service: EncounterService,
  ) { }

  ngOnInit(): void {
    this.patientId = this.route.snapshot.params["patient_id"];
    this.visitUuid = this.route.snapshot.paramMap.get("visit_id");
    this.diagnosisService
      .getObs(this.patientId, this.dietTypeConcept)
      .subscribe((response) => {
        response.results.forEach((obs) => {
          if (obs.encounter.visit.uuid === this.visitUuid) {
            this.diets.push(obs);
          }
        });
      });
  }

  get value() {
    return this.dietType === this.dietTypes[6] ? this.otherText : this.dietType
  }

  submit() {
    console.log(this.value);
    const json = {
      concept: this.dietTypeConcept,
      person: this.patientId,
      obsDatetime: new Date(),
      value: this.value,
      encounter: getEncounterUUID(),
    };
    this.service.postObs(json).subscribe((response) => {
      this.isDataPresent.emit(true);
      this.diets.push({ uuid: response.uuid, value: this.value });
      this.dietType = '';
      this.otherText = '';
    });
  }

  get isInvalid() {
    return !this.value;
  }

  delete(i) {
    if (this.diagnosisService.isSameDoctor()) {
      const uuid = this.diets[i].uuid;
      this.diagnosisService.deleteObs(uuid).subscribe((res) => {
        this.diets.splice(i, 1);
        if (this.diets.length === 0) {
          this.isDataPresent.emit(false);
        }
      });
    }
  }

}
