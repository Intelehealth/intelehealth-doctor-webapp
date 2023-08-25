import { Component, OnInit } from "@angular/core";
import { EncounterService } from "src/app/services/encounter.service";
import { ActivatedRoute } from "@angular/router";
import { DiagnosisService } from "src/app/services/diagnosis.service";
import { Validators, UntypedFormGroup, UntypedFormControl } from "@angular/forms";
import {
  transition,
  trigger,
  style,
  animate,
  keyframes,
} from "@angular/animations";
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

  diagnosisForm = new UntypedFormGroup({
    text: new UntypedFormControl("", [Validators.required]),
    type: new UntypedFormControl("", [Validators.required]),
    confirm: new UntypedFormControl("", [Validators.required]),
  });

  constructor(
    private service: EncounterService,
    private diagnosisService: DiagnosisService,
    private route: ActivatedRoute
  ) { }

  ngOnInit() {
    this.visitUuid = this.route.snapshot.paramMap.get("visit_id");
    this.patientId = this.route.snapshot.params["patient_id"];
    let visitNoteProvider = getFromStorage('visitNoteProvider');
    const obs = Array.isArray(visitNoteProvider.obs) ? visitNoteProvider.obs : [];
    const obsData = obs.filter(a => a.display.match("TELEMEDICINE DIAGNOSIS"));
    obsData.forEach(obs => {
      this.diagnosis.push({ uuid: obs.uuid, value: obs.value });
    });
    this.checkDiagnosis();
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
