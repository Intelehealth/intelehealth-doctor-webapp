import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { EncounterService } from 'src/app/services/encounter.service';
import { VisitService } from 'src/app/services/visit.service';
import { ConfirmDialogService } from '../reassign-speciality/confirm-dialog/confirm-dialog.service';
import { epartogram } from './epartogram'

@Component({
  selector: 'app-epartogram',
  templateUrl: './epartogram.component.html',
  styleUrls: ['./epartogram.component.css']
})
export class EpartogramComponent implements OnInit {
  conceptPlan = '162169AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA';
  conceptAssessment = '67a050c1-35e5-451c-a4ab-fff9d57b0db1';
  stag2TimeSlots = [
    { id: 1, value: "13:05" },
    { id: 2, value: "13:40" },
    { id: 3, value: null }
  ];
  titleRows = [
    { "name": "Companion", 'value': "N" },
    { "name": "Pain relief", 'value': "N" },
    { "name": "Oral fluid", 'value': "N" },
    { "name": "Posture", 'value': "SP" }
  ]
  babyTitleRows = [
    { "name": "Amniotic fluid", 'value': "M+++, B" },
    { "name": "Fetal position", 'value': "P, T" },
    { "name": "Caput", 'value': "+++" },
    { "name": "Moulding", 'value': "+++" }
  ];
  babyStag2TimeSlots = [
    { id: 1, value: 145 },
    { id: 2, value: 125 },
    { id: 3, value: 130 },
    { id: 4, value: 0 },
    { id: 5, value: 0 },
    { id: 6, value: 0 }
  ];
  womanTitleRows = [
    { "name": "Pulse", 'value': "<60, ≥120" },
    { "name": "Systolic BP", 'value': "<80, ≥140" },
    { "name": "Diastolic BP", 'value': "≥90" },
    { "name": "Temperature ℃", 'value': "<35.0,≥ 37.5" },
    { "name": "Urine", 'value': "P++, A++" }
  ];
  labourFirstRows = [
    { "name": "Contractions per 10 min", 'value': "≤2, >5" },
    { "name": "Duration of contractions", 'value': "<20, >60" }
  ];
  labourSecondRows = [
    { "name": 10, 'value': null },
    { "name": 9, 'value': "≥ 2h" },
    { "name": 8, 'value': "≥ 2.5h" },
    { "name": 7, 'value': "≥ 3h" },
    { "name": 6, 'value': "≥ 5h" },
    { "name": 5, 'value': "≥ 6h" },
  ];
  labourThirdRows = [
    { "name": 5, 'value': null },
    { "name": 4, 'value': null },
    { "name": 3, 'value': null },
    { "name": 2, 'value': null },
    { "name": 1, 'value': null },
    { "name": 0, 'value': null },
  ];
  medicationRows = [
    { "name": "Oxytocin (U/L, drops/min)", 'value': "≤2, >5" },
    { "name": "Medicine", 'value': "≤2, >5" },
    { "name": "IV fluids", 'value': "<20, >60" }
  ];

  stage1Data = [];
  filteredStage1 = [];
  doubleColStage2 = [];
  patientId: string;
  visitId: string;
  patientInfo = {name:null,parity:null, laborOnset:null, activeLaborDiagnosed:null,membraneRuptured:null,riskFactors:null };

  constructor(
    private route: ActivatedRoute,
    private visitService: VisitService,
    private dialogService: ConfirmDialogService,
    private encounterService: EncounterService) { }

  ngOnInit(): void {
    this.visitId = this.route.snapshot.paramMap.get("visit_id");
    this.patientId = this.route.snapshot.params["patient_id"];
    this.doubleColStage2 = this.babyStag2TimeSlots.concat(this.babyStag2TimeSlots);
    this.visitService.getVisit(this.visitId).subscribe((res) => {
      this.getDetails(res.patient.person);
      this.getStage1Data(res.encounters);
    });
  }

  submit(encounterUuid) {
    this.dialogService.openConfirmDialog("Save ASSESSMENT/PLAN")
      .afterClosed().subscribe(res => {
        if (res) {
          const date = new Date();
          const notes = res.value;
          if (notes.assessment) {
            const json = {
              concept: this.conceptAssessment,
              person: this.patientId,
              obsDatetime: date,
              value: notes.assessment,
              encounter: encounterUuid,
            };
            this.encounterService.postObs(json).subscribe((resp) => {
            });
          }
          if (notes.plan) {
            const json = {
              concept: this.conceptPlan,
              person: this.patientId,
              obsDatetime: date,
              value: notes.plan,
              encounter: encounterUuid,
            };
            this.encounterService.postObs(json).subscribe((resp) => {
            });
          }
        }
        setTimeout(() => window.location.reload(), 2000);
      });
  }

  getDetails(person) {
    this.patientInfo['name'] = person.display;
    person["attributes"].forEach((attri) => {
      if (attri.attributeType.display.match("Parity")) {
        this.patientInfo["parity"] = attri.value;
      }
      if (attri.attributeType.display.match("Labor Onset")) {
        this.patientInfo["laborOnset"] = attri.value;
      }
      if (attri.attributeType.display.match("Active Labor Diagnosed")) {
        this.patientInfo["activeLaborDiagnosed"] = attri.value;
      }
      if (attri.attributeType.display.match("Membrane Ruptured Timestamp")) {
        this.patientInfo["membraneRuptured"] = attri.value;
      }
      if (attri.attributeType.display.match("Risk factors")) {
        this.patientInfo["riskFactors"] = attri.value;
      }
    });
  }

  getStage1Data(encounters) {
    this.createStage1();
    encounters.forEach(encounter => {
      if (encounter.display.includes('Stage1_Hour1')) {
        if (encounter.display.includes('Stage1_Hour1_1')) {
          this.getObsValue(encounter, 0);
        } else {
          this.getObsValue(encounter, 1);
        }
      } else if (encounter.display.includes('Stage1_Hour2')) {
        if (encounter.display.includes('Stage1_Hour2_1')) {
          this.getObsValue(encounter, 2);
        } else {
          this.getObsValue(encounter, 3);
        }
      } else if (encounter.display.includes('Stage1_Hour3')) {
        if (encounter.display.includes('Stage1_Hour3_1')) {
          this.getObsValue(encounter, 4);
        } else {
          this.getObsValue(encounter, 5);
        }
      } else if (encounter.display.includes('Stage1_Hour4')) {
        if (encounter.display.includes('Stage1_Hour4_1')) {
          this.getObsValue(encounter, 6);
        } else {
          this.getObsValue(encounter, 7);
        }
      } else if (encounter.display.includes('Stage1_Hour5')) {
        if (encounter.display.includes('Stage1_Hour5_1')) {
          this.getObsValue(encounter, 8);
        } else {
          this.getObsValue(encounter, 9);
        }
      } else if (encounter.display.includes('Stage1_Hour6')) {
        if (encounter.display.includes('Stage1_Hour6_1')) {
          this.getObsValue(encounter, 10);
        } else {
          this.getObsValue(encounter, 11);
        }
      } else if (encounter.display.includes('Stage1_Hour7')) {
        if (encounter.display.includes('Stage1_Hour7_1')) {
          this.getObsValue(encounter, 12);
        } else {
          this.getObsValue(encounter, 13);
        }
      } else if (encounter.display.includes('Stage1_Hour8')) {
        if (encounter.display.includes('Stage1_Hour8_1')) {
          this.getObsValue(encounter, 14);
        } else {
          this.getObsValue(encounter, 15);
        }
      } else if (encounter.display.includes('Stage1_Hour9')) {
        if (encounter.display.includes('Stage1_Hour9_1')) {
          this.getObsValue(encounter, 16);
        } else {
          this.getObsValue(encounter, 17);
        }
      } else if (encounter.display.includes('Stage1_Hour10')) {
        if (encounter.display.includes('Stage1_Hour10_1')) {
          this.getObsValue(encounter, 18);
        } else {
          this.getObsValue(encounter, 19);
        }
      } else if (encounter.display.includes('Stage1_Hour11')) {
        if (encounter.display.includes('Stage1_Hour11_1')) {
          this.getObsValue(encounter, 20);
        } else {
          this.getObsValue(encounter, 21);
        }
      } else if (encounter.display.includes('Stage1_Hour12')) {
        if (encounter.display.includes('Stage1_Hour12_1')) {
          this.getObsValue(encounter, 22);
        } else {
          this.getObsValue(encounter, 23);
        }
      }
    });
    this.filteredStage1 = this.stage1Data.filter(function (v, i) {
      return i % 2 == 0;
    });
  }

  private createStage1() {
    for (let i = 1; i <= 24; i++) {
      this.stage1Data.push(new epartogram(i, null, null, null, null, null, null, 0, null, null, null, null,
        null, null, null, null, 0, null, null, undefined, null, null, null, null, null, null, null, null));
    }
  }

  private getObsValue(encounter, index) {
    this.stage1Data[index].time = encounter.encounterDatetime;
    this.stage1Data[index].uuid = encounter.uuid;
    this.stage1Data[index].initals = this.getInitials(encounter.encounterProviders[0].display);
    encounter.obs.forEach(obs => {
      if (obs.display.includes('Companion')) {
        this.stage1Data[index].companion = this.setObs(obs);
      }
      if (obs.display.includes('Pain relief')) {
        this.stage1Data[index].painRelief = this.setObs(obs);
      }
      if (obs.display.includes('Oral Fluid')) {
        this.stage1Data[index].oralFluid = this.setObs(obs);
      }
      if (obs.display.includes('Posture')) {
        this.stage1Data[index].posture = this.setObs(obs);
      }
      if (obs.display.includes('Baseline FHR')) {
        this.stage1Data[index].baselineFHR = this.setObs(obs);
      }
      if (obs.display.includes('FHR Deceleration')) {
        this.stage1Data[index].fhrDeceleration = this.setObs(obs);
      }
      if (obs.display.includes('Amniotic fluid')) {
        this.stage1Data[index].amnioticfluid = this.setObs(obs);
      }
      if (obs.display.includes('Fetal position')) {
        this.stage1Data[index].fetalPosition = this.setObs(obs);
      }
      if (obs.display.includes('Caput')) {
        this.stage1Data[index].caput = this.setObs(obs);
      }
      if (obs.display.includes('Moulding')) {
        this.stage1Data[index].moulding = this.setObs(obs);
      }
      if (obs.display.includes('PULSE')) {
        this.stage1Data[index].pulse = this.setObs(obs);
      }
      if (obs.display.includes('SYSTOLIC BLOOD PRESSURE')) {
        this.stage1Data[index].systolicBP = this.setObs(obs);
      }
      if (obs.display.includes('DIASTOLIC BLOOD PRESSURE')) {
        this.stage1Data[index].diastolicBP = this.setObs(obs);
      }
      if (obs.display.includes('TEMPERATURE (C)')) {
        this.stage1Data[index].temperature = this.setObs(obs);
      }
      if (obs.display.includes('Urine protein')) {
        this.stage1Data[index].urine = this.setObs(obs);
      }
      if (obs.display.includes('Contractions per 10 min')) {
        this.stage1Data[index].contractions = this.setObs(obs);
      }
      if (obs.display.includes('Duration of contraction')) {
        this.stage1Data[index].durationOfContraction = this.setObs(obs);
      }
      if (obs.display.includes('Cervix 0 cm, 1 cm, 2 cm, 3 cm, 4 cm, 5 cm')) {
        this.stage1Data[index].cervix = this.setObs(obs);
      }
      if (obs.display.includes('Descent 0-5')) {
        this.stage1Data[index].descent = this.setObs(obs);
      }
      if (obs.display.includes('Oxytocin U/l, Drops per min')) {
        this.stage1Data[index].oxytocin = obs.value;
      }
      if (obs.display.includes('Medicine')) {
        this.stage1Data[index].medicine = obs.value;
      }
      if (obs.display.includes('IV fluids')) {
        this.stage1Data[index].ivfluids = obs.value;
      }
      if (obs.display.includes('Assessment')) {
        this.setNotes(index, obs.value, 'assessment');
      }
      if (obs.display.includes('Additional Comments')) {
        this.setNotes(index, obs.value, 'plan');
      }
    });
  }

  private setObs(obs: any): Object {
    return {
      value: obs.value,
      colorFlag: "red"
    };
  }

  private setNotes(index: any, obsValue: any, type: string) {
    if (this.stage1Data[index][type] !== null) {
      this.stage1Data[index][type] = this.stage1Data[index][type].concat(' ' + obsValue);
    } else {
      this.stage1Data[index][type] = obsValue;
    }
  }

  private getInitials(name) {
    const nurseName = name.split(":")[0];
    const fullName = nurseName.split(' ');
    const initials = fullName.shift().charAt(0) + fullName.pop().charAt(0);
    return initials.toUpperCase();
  }

}
