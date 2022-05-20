import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { EncounterService } from 'src/app/services/encounter.service';
import { VisitService } from 'src/app/services/visit.service';
import { ConfirmDialogService } from '../reassign-speciality/confirm-dialog/confirm-dialog.service';

@Component({
  selector: 'app-epartogram',
  templateUrl: './epartogram.component.html',
  styleUrls: ['./epartogram.component.css']
})
export class EpartogramComponent implements OnInit {
  conceptPlan = '162169AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA';
  conceptAssessment = '67a050c1-35e5-451c-a4ab-fff9d57b0db1';
  timeSlots = [
    { id: 1, value: "5:00" },
    { id: 2, value: "6:00" },
    { id: 3, value: "7:00" },
    { id: 4, value: "8:00" },
    { id: 5, value: "9:00" },
    { id: 6, value: "10:00" },
    { id: 7, value: "11:00" },
    { id: 8, value: "12:00" },
    { id: 9, value: "13:00" },
    { id: 10, value: null },
    { id: 11, value: null },
    { id: 12, value: null },
  ];
  stag2TimeSlots = [
    { id: 1, value: "13:05" },
    { id: 2, value: "13:40" },
    { id: 3, value: null }
  ];

  supportiveCare = [
    { id: 1, value: "N" },
    { id: 2, value: "Y" },
    { id: 3, value: "N" },
    { id: 4, value: "N" },
    { id: 5, value: "Y" },
    { id: 6, value: "Y" },
    { id: 7, value: "Y" },
    { id: 8, value: "Y" },
    { id: 9, value: null },
    { id: 10, value: null },
    { id: 11, value: null },
    { id: 12, value: null },
  ];

  timeRows = [
    { "name": "Time", 'value': "N" },
    { "name": "Hours", 'value': "N" },
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

  doubleColStage1 = [];
  doubleColStage2 = [];
  patientId: string;
  visitId: string;
  patientInfo = {};

  constructor(
    private route: ActivatedRoute,
    private visitService: VisitService,
    private dialogService: ConfirmDialogService,
    private encounterService: EncounterService) { }

  ngOnInit(): void {
    this.visitId = this.route.snapshot.paramMap.get("visit_id");
    this.patientId = this.route.snapshot.params["patient_id"];
    this.doubleColStage1 = this.supportiveCare.concat(this.supportiveCare);
    this.doubleColStage2 = this.babyStag2TimeSlots.concat(this.babyStag2TimeSlots);
    this.visitService.getVisit(this.visitId).subscribe((res) => {
      this.patientInfo = this.getDetails(res.patient.person);
    });
  }

  submit() {
    this.dialogService.openConfirmDialog("Save ASSESSMENT/PLAN")
      .afterClosed().subscribe(res => {
        if (res) {
          const date = new Date();
          const notes = res.value;
          // this.encounterUuid = getEncounterUUID();
          if (notes.assessment) {
            const json = {
              concept: this.conceptAssessment,
              person: this.patientId,
              obsDatetime: date,
              value: notes.assessment,
              //  encounter: this.encounterUuid,
            };
            console.log("assessment", json)
            // this.encounterService.postObs(json).subscribe((resp) => {
            // });      
          }
          if (notes.plan) {
            const json = {
              concept: this.conceptPlan,
              person: this.patientId,
              obsDatetime: date,
              value: notes.plan,
              //  encounter: this.encounterUuid,
            };
            console.log("plan", json)
            // this.encounterService.postObs(json).subscribe((resp) => {
            // });   
          }
        }
      });
  }

  getDetails(person) {
    let obj = {};
    obj['name'] = person.display;
    person["attributes"].forEach((attri) => {
      if (attri.attributeType.display.match("Parity")) {
        obj["parity"] = attri.value;
      }
      if (attri.attributeType.display.match("Labor Onset")) {
        obj["laborOnset"] = attri.value;
      }
      if (attri.attributeType.display.match("Active Labor Diagnosed")) {
        obj["activeLaborDiagnosed"] = attri.value;
      }
      if (attri.attributeType.display.match("Membrane Ruptured Timestamp")) {
        obj["membraneRuptured"] = attri.value;
      }
      if (attri.attributeType.display.match("Risk factors")) {
        obj["riskFactors"] = attri.value;
      }
    });
    return obj;
  }
}
