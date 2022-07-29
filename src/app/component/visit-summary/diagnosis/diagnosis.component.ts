import { Component, OnInit } from "@angular/core";
import { EncounterService } from "src/app/services/encounter.service";
import { ActivatedRoute } from "@angular/router";
import { DiagnosisService } from "src/app/services/diagnosis.service";
import { Validators, FormGroup, FormControl } from "@angular/forms";
import {
  transition,
  trigger,
  style,
  animate,
  keyframes,
} from "@angular/animations";
import { MatSnackBar } from "@angular/material/snack-bar";
declare var getEncounterProviderUUID: any,
  getFromStorage: any,
  getEncounterUUID: any;

@Component({
  selector: "app-diagnosis",
  templateUrl: "./diagnosis.component.html",
  styleUrls: ["./diagnosis.component.css"],
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
export class DiagnosisComponent implements OnInit {
  diagnosis: any = [];
  diagnosisList = [];
  conceptDiagnosis = "537bb20d-d09d-4f88-930b-cc45c7d662df";
  patientId: string;
  visitUuid: string;
  encounterUuid: string;

  diagnosisForm = new FormGroup({
    text: new FormControl("", [Validators.required]),
    type: new FormControl("", [Validators.required]),
    confirm: new FormControl("", [Validators.required]),
  });

  constructor(
    private service: EncounterService,
    private diagnosisService: DiagnosisService,
    private snackbar: MatSnackBar,
    private route: ActivatedRoute
  ) { }

  ngOnInit() {
    this.visitUuid = this.route.snapshot.paramMap.get("visit_id");
    this.patientId = this.route.snapshot.params["patient_id"];
    this.diagnosisService
      .getObs(this.patientId, this.conceptDiagnosis)
      .subscribe((response) => {
        response.results.forEach((obs) => {
          if (obs.encounter.visit.uuid === this.visitUuid) {
            this.diagnosis.push(obs);
          }
        });
        this.checkDiagnosis();
      });
  }

  search(event) {
    this.diagnosisService
      .getDiagnosisList(event.target.value)
      .subscribe((response) => {
        this.diagnosisList = response;
      });
  }

  onSubmit() {
    const date = new Date();
    const value = this.diagnosisForm.value;
    const providerDetails = getFromStorage("provider");
    const providerUuid = providerDetails.uuid;
    if (this.diagnosisService.isSameDoctor()) {
      this.encounterUuid = getEncounterUUID();
      const json = {
        concept: this.conceptDiagnosis,
        person: this.patientId,
        obsDatetime: date,
        value: `${value.text}:${value.type} & ${value.confirm}`,
        encounter: this.encounterUuid,
      };
      this.service.postObs(json).subscribe((resp) => {
        this.diagnosisService.isVisitSummaryChanged = true;
        this.diagnosisList = [];
        this.diagnosis.push({ uuid: resp.uuid, value: json.value });
        this.checkDiagnosis();
      });
    }
  }

  checkDiagnosis() {
    if (this.diagnosis.length) {
      this.diagnosisService.diagnosisExists = true;
    } else {
      this.diagnosisService.diagnosisExists = false;
    }
    console.log('this.diagnosisService.diagnosisExists: ', this.diagnosisService.diagnosisExists);
  }

  delete(i) {
    if (this.diagnosisService.isSameDoctor()) {
      const uuid = this.diagnosis[i].uuid;
      this.diagnosisService.deleteObs(uuid).subscribe((res) => {
        this.diagnosis.splice(i, 1);
        this.checkDiagnosis();
      });
    }
  }
}
