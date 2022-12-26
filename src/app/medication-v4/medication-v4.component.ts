import { Component, Input, OnInit } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { DiagnosisService } from "../services/diagnosis.service";
import { EncounterService } from "../services/encounter.service";
import medicines from './medicines';
declare var getEncounterUUID: any;

@Component({
  selector: "app-medication-v4",
  templateUrl: "./medication-v4.component.html",
  styleUrls: ["./medication-v4.component.scss"],
})
export class MedicationV4Component implements OnInit {
  @Input() iconImg = "assets/svgs/medication.svg";
  @Input() readOnly = false;
  @Input() showToggle = true;

  showAddMore = false;
  isCollapsed = false;

  conceptMed = 'c38c0c50-2fd2-4ae3-b7ba-7dd25adca4ca';
  patientId: string;
  visitUuid: string;

  selectedDrugName: string;
  drugNameList = [];

  selectedStrength: string;
  strengthList = ["5 Mg", "10 Mg", "50 Mg", "75 Mg", "100 Mg", "500 Mg", "1000 Mg"];

  selectedDays: string;
  daysList = ["7", "14", "20", "25"];

  selectedTiming: string;
  timingList = ["1 - 0 - 1", "1 - 1 - 0", "0 - 1 - 1"];

  selectedRemark:string;
  instruction: string;

  headers = [
    {
      name: "Drug Name",
      type: "string",
      key: "drug",
    },
    { name: "Strength", type: "string", key: "strength" },
    { name: "No. of days", type: "string", key: "days" },
    { name: "Timing", type: "string", key: "timing" },
    {
      name: "Remark",
      type: "remark",
      key: "remark",
    },
  ];

  data = [];
  instructions=[];

  constructor(   private route: ActivatedRoute, private diagnosisService: DiagnosisService,
    private encounterService: EncounterService) { }

  ngOnInit(): void {
    this.drugNameList = this.drugNameList.concat(medicines);
    this.visitUuid = this.route.snapshot.paramMap.get('visit_id');
    this.patientId = this.route.snapshot.params['patient_id'];
    this.diagnosisService.getObs(this.patientId, this.conceptMed)
      .subscribe(response => {
        response.results.forEach(obs => {
          if (obs.encounter.visit.uuid === this.visitUuid) {
            if(obs.value.includes(":")) {
              this.data.push(this.getObsData(obs));
            } else {
              this.instructions.push(obs);
            }
           
          }
        });
      });
     this.setDefaultValues();
  }

  save() {
    const date = new Date();
    if (this.diagnosisService.isSameDoctor()) {
    var insertValue = `${this.selectedDrugName}:${this.selectedStrength}:${this.selectedDays}:${this.selectedTiming}:${this.selectedRemark}`;
      let encounterUuid = getEncounterUUID();
      const json = {
        concept: this.conceptMed,
        person: this.patientId,
        obsDatetime: date,
        value: insertValue,
        encounter: encounterUuid
      };
      this.encounterService.postObs(json)
        .subscribe(response => {
          this.data.push(this.getObsData({ uuid: response.uuid, value: insertValue }));
          this.setDefaultValues();
        });
    }
  }

  delete(i) {
    if (this.diagnosisService.isSameDoctor()) {
      const uuid = this.data[i].uuid;
      this.diagnosisService.deleteObs(uuid)
        .subscribe(() => {
          this.data.splice(i, 1);
        });
    }
  }

  saveInstruction() {
    const date = new Date();
    if (this.diagnosisService.isSameDoctor()) {
    var instruction = this.instruction;
      let encounterUuid = getEncounterUUID();
      const json = {
        concept: this.conceptMed,
        person: this.patientId,
        obsDatetime: date,
        value: instruction,
        encounter: encounterUuid
      };
      this.encounterService.postObs(json)
        .subscribe(response => {
          this.instructions.push({ uuid: response.uuid, value: instruction });
        });
    }
  }

  deleteInstruction(i) {
    if (this.diagnosisService.isSameDoctor()) {
      const uuid = this.instructions[i].uuid;
      this.diagnosisService.deleteObs(uuid)
        .subscribe(() => {
          this.instructions.splice(i, 1);
        });
    }
  }
  private getObsData(obs) {
    let value = obs.value?.split(":");
    return {
      drug: value[0],
      strength: value[1],
      days: value[2],
      timing: value[3],
      remark: value[4],
      uuid: obs.uuid
    }
  }

  private setDefaultValues() {
    this.selectedDrugName = this.drugNameList[0];
    this.selectedStrength = this.strengthList[0];
    this.selectedTiming = this.timingList[0];
    this.selectedDays = this.daysList[0];
    this.selectedRemark = "";
  }

}
