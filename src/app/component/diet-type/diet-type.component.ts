import { animate, keyframes, style, transition, trigger } from '@angular/animations';
import { Component, OnInit, Output } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { EventEmitter } from 'protractor';
import { DiagnosisService } from 'src/app/services/diagnosis.service';

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
  @Output() isDataPresent = new EventEmitter();
  public dietType: any;
  otherText;
  dietTypeConcept = '44a97181-bb50-4e97-b4e6-7bd5be0c1bdc';
  patientId = '';
  visitUuid = '';
  dietTypes = [
    'Mixed',
    'Vegeterian',
    'Non Vegeterian',
    'Lactoveg (Milk+Veg)',
    'Non Vegeterian',
    'Other(Enter Text)',
    'Ovo Lacto Veg (Egg + Milk + Veg)',
  ]
  diets = [];

  constructor(
    private diagnosisService: DiagnosisService,
    private route: ActivatedRoute

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
    return this.dietType === this.dietTypes[5] ? this.otherText : this.dietType
  }

  submit() {
    console.log(this.value);
  }

  get isInvalid() {
    return !this.value
  }

  delete(i) {
    if (this.diagnosisService.isSameDoctor()) {
      const uuid = this.diets[i].uuid;
      this.diagnosisService.deleteObs(uuid).subscribe((res) => {
        this.diets.splice(i, 1);
        if (this.diets.length === 0) {
          this.isDataPresent.emit('');
        }
      });
    }
  }

}
