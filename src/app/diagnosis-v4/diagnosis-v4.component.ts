import { Component, Input, OnInit } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { DiagnosisService } from "../services/diagnosis.service";
import { EncounterService } from "../services/encounter.service";
declare var getEncounterUUID: any;

@Component({
  selector: "app-diagnosis-v4",
  templateUrl: "./diagnosis-v4.component.html",
  styleUrls: ["./diagnosis-v4.component.scss"],
})
export class DiagnosisV4Component implements OnInit {
  @Input() iconImg = "assets/svgs/diagnosis.svg";
  @Input() showToggle = true;
  @Input() readOnly = false;

  selectedOption: string;
  selectedType: string;
  selectedTypeSelect: string;
  selectedDig: string;
  isDiagnosisPresent: boolean=false;
  diagnosisList = ["Viral Flu"];
  conceptDiagnosis = '537bb20d-d09d-4f88-930b-cc45c7d662df';
  patientId: string;
  visitUuid: string;
  isCollapsed = false;
  diagnosisData = [
    "Do you have enough information for diagnosis?",
    "Select diagnosis",
    "Diagnosis type",
    "Select",
  ];

  constructor(private encounterService: EncounterService,
    private diagnosisService: DiagnosisService,
    private route: ActivatedRoute) { }

  ngOnInit(): void {
    this.visitUuid = this.route.snapshot.paramMap.get('visit_id');
    this.patientId = this.route.snapshot.params['patient_id'];
    this.diagnosisService.getObs(this.patientId, this.conceptDiagnosis)
      .subscribe(response => {
        response.results.forEach(obs => {
          if (obs.encounter.visit.uuid === this.visitUuid || this.readOnly === true) {
            this.setDiagnosis(obs);
            this.isDiagnosisPresent = true;
          }
        });
      });
  }

  search(event) {
    this.diagnosisService.getDiagnosisList(event.target.value)
      .subscribe(response => {
        this.diagnosisList = response;
      });
  }

  save() {
    const date = new Date();
    if (this.diagnosisService.isSameDoctor() && this.selectedDig) {
      let encounterUuid = getEncounterUUID();
      const json = {
        concept: this.conceptDiagnosis,
        person: this.patientId,
        obsDatetime: date,
        value: `${this.selectedDig}:${this.selectedType} & ${this.selectedTypeSelect}`,
        encounter: encounterUuid
      };
      this.encounterService.postObs(json)
        .subscribe(resp => {
          this.diagnosisList = [];
          this.setDiagnosis(json)
          this.isDiagnosisPresent = true;
        });
    }
  }

  private setDiagnosis(obs) {
    this.selectedDig = obs.value.split(":")[0];
    this.selectedOption = "Yes";
    let value = obs.value?.split(":")[1]?.split(" & ");
    this.selectedType = value[0];
    this.selectedTypeSelect = value[1];
  }

}
