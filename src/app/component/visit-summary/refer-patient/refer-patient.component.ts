import {
  animate,
  keyframes,
  style,
  transition,
  trigger,
} from "@angular/animations";
import { Component, Input, OnInit } from "@angular/core";
import { FormControl, FormGroup, Validators } from "@angular/forms";
import { ActivatedRoute } from "@angular/router";
import { DiagnosisService } from "src/app/services/diagnosis.service";
import { EncounterService } from "src/app/services/encounter.service";
declare var getEncounterUUID: any;

@Component({
  selector: "app-refer-patient",
  templateUrl: "./refer-patient.component.html",
  styleUrls: ["./refer-patient.component.css"],
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
export class ReferPatientComponent implements OnInit {
  referPatient: any = [];
  referPatients: any = [];
  conceptReferPatient = "5f0d1049-4fd6-497e-88c4-ae13a34ae241";
  encounterUuid: string;
  visitUuid: string;
  patientId: string;
  errorText: string;
  @Input() isReferPatient: boolean = false;

  referPatientForm = new FormGroup({
    referPatient: new FormControl("", [Validators.required]),
  });

  constructor(
    private service: EncounterService,
    private diagnosisService: DiagnosisService,
    private route: ActivatedRoute
  ) {}

  ngOnInit() {
    localStorage.removeItem("referPatient");
    const referPatientUuid = "0308000d-77a2-46e0-a6fa-a8c1dcbc3141";
    this.diagnosisService.concept(referPatientUuid).subscribe((res) => {
      const result = res.answers;
      result.forEach((ans) => {
        this.referPatients.push(ans.display);
      });
    });
    this.visitUuid = this.route.snapshot.paramMap.get("visit_id");
    this.patientId = this.route.snapshot.params["patient_id"];
    this.diagnosisService
      .getObs(this.patientId, this.conceptReferPatient)
      .subscribe((response) => {
        response.results.forEach((obs) => {
          if (obs.encounter && obs.encounter.visit.uuid === this.visitUuid) {
            if (!obs.value.includes("</a>")) {
              this.referPatient.push(obs);
              localStorage.referPatient = 1;
            }
          }
        });
      });
  }

  submit() {
    const date = new Date();
    const form = this.referPatientForm.value;
    const value = form.referPatient;
    if (this.diagnosisService.isSameDoctor()) {
      this.encounterUuid = getEncounterUUID();
      const json = {
        concept: this.conceptReferPatient,
        person: this.patientId,
        obsDatetime: date,
        value: value,
        encounter: this.encounterUuid,
      };
      this.service.postObs(json).subscribe((response) => {
        this.referPatient.push({ uuid: response.uuid, value: value });
        localStorage.referPatient = 1;
      });
    }
  }

  delete(i) {
    if (this.diagnosisService.isSameDoctor()) {
      const uuid = this.referPatient[i].uuid;
      this.diagnosisService.deleteObs(uuid).subscribe((res) => {
        this.referPatient.splice(i, 1);
        if (!this.referPatient.length) {
          localStorage.removeItem("referPatient");
        }
      });
    }
  }
}
