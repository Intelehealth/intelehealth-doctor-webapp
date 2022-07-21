import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import * as moment from 'moment';
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
    { "name": "10", 'value': null },
    { "name": "9", 'value': "≥ 2h" },
    { "name": "8", 'value': "≥ 2.5h" },
    { "name": "7", 'value': "≥ 3h" },
    { "name": "6", 'value': "≥ 5h" },
    { "name": "5", 'value': "≥ 6h" },
  ];
  labourThirdRows = [
    { "name": "5", 'value': null },
    { "name": "4", 'value': null },
    { "name": "3", 'value': null },
    { "name": "2", 'value': null },
    { "name": "1", 'value': null },
    { "name": "0", 'value': null },
  ];
  medicationRows = [
    { "name": "Oxytocin (U/L, drops/min)", 'value': "≤2, >5" },
    { "name": "Medicine", 'value': "≤2, >5" },
    { "name": "IV fluids", 'value': "<20, >60" }
  ];

  stage1Data: Array<epartogram> = [];
  filteredStage1: Array<epartogram> = [];
  stage2Data: Array<epartogram> = [];
  filteredStage2: Array<epartogram> = [];
  filteredStage2Col: Array<epartogram> = [];
  patientId: string;
  visitId: string;
  nurseMobNo: string;
  patientInfo = { name: null, parity: null, laborOnset: null, activeLaborDiagnosed: null, membraneRuptured: null, riskFactors: null, mobileNo: null };
  isVisitEnded: boolean = false;
  birthOutcome: string;
  birthtime: string;

  constructor(
    private route: ActivatedRoute,
    private visitService: VisitService,
    private dialogService: ConfirmDialogService,
    private encounterService: EncounterService) { }

  ngOnInit(): void {
    this.visitId = this.route.snapshot.paramMap.get("visit_id");
    this.patientId = this.route.snapshot.params["patient_id"];
    this.visitService.getVisit(this.visitId).subscribe((res) => {
      this.getDetails(res.patient.person);
      const providerAttribute = res.encounters[0]?.encounterProviders[0]?.provider?.attributes;
      if (providerAttribute?.length) {
        providerAttribute.forEach((attribute) => {
          if (attribute.display.match("whatsapp") != null) {
            this.nurseMobNo = attribute.value;
          }
        });
        if(!this.nurseMobNo){
          providerAttribute.forEach((attribute) => {
            if (attribute.display.match("phoneNumber") != null) {
              this.nurseMobNo = attribute.value;
            }
          });
        }
      }
      if (res.encounters.filter(vst => vst.display.includes('Visit Complete')).length > 0) {
        this.isVisitEnded = true;
        this.birthOutcome = res?.encounters.filter(vst => vst.display.includes('Visit Complete'))[0]?.obs[0]?.value;
        if (this.birthOutcome === 'Refer to other Hospital') {
          this.birthOutcome = 'RTOH';
        }
        if (this.birthOutcome === 'Self discharge against Medical Advice') {
          this.birthOutcome = 'DAMA';
        }
        this.birthtime =  moment(res?.encounters.filter(vst => vst.display.includes('Visit Complete'))[0]?.encounterDatetime).format("HH:mm");
      }
      this.getStage1Data(res.encounters);
      this.getStag2Data(res.encounters);
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
          setTimeout(() => window.location.reload(), 2000);
        }
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
        this.patientInfo["activeLaborDiagnosed"] = attri?.value.split(' ')[0];
      }
      if (attri.attributeType.display.match("Membrane Ruptured Timestamp")) {
        if (attri.value !== 'U') {
          let obj = { 'date': null, 'time': null };
          obj['date'] = attri?.value.split(' ')[0];
          obj['time'] = attri?.value.split(' ')[1];
          this.patientInfo["membraneRuptured"] = obj;
        } else {
          this.patientInfo["membraneRuptured"] = attri.value;
        }
      }
      if (attri.attributeType.display.match("Risk factors")) {
        this.patientInfo["riskFactors"] = attri.value;
      }
      if (attri.attributeType.display.match("Telephone Number")) {
        this.patientInfo["mobileNo"] = attri.value;
      }
    });
  }

  getStage1Data(encounters) {
    this.createStages(24, 'stage1');
    encounters.forEach(encounter => {
      if (encounter.display.includes('Stage1_Hour10')) {
        if (encounter.display.includes('Stage1_Hour10_1')) {
          this.getObsValue(encounter, 18, 'stage1Data');
        } else {
          this.getObsValue(encounter, 19, 'stage1Data');
        }
      } else if (encounter.display.includes('Stage1_Hour11')) {
        if (encounter.display.includes('Stage1_Hour11_1')) {
          this.getObsValue(encounter, 20, 'stage1Data');
        } else {
          this.getObsValue(encounter, 21, 'stage1Data');
        }
      } else if (encounter.display.includes('Stage1_Hour12')) {
        if (encounter.display.includes('Stage1_Hour12_1')) {
          this.getObsValue(encounter, 22, 'stage1Data');
        } else {
          this.getObsValue(encounter, 23, 'stage1Data');
        }
      } else if (encounter.display.includes('Stage1_Hour1')) {
        if (encounter.display.includes('Stage1_Hour1_1')) {
          this.getObsValue(encounter, 0, 'stage1Data');
        } else {
          this.getObsValue(encounter, 1, 'stage1Data');
        }
      } else if (encounter.display.includes('Stage1_Hour2')) {
        if (encounter.display.includes('Stage1_Hour2_1')) {
          this.getObsValue(encounter, 2, 'stage1Data');
        } else {
          this.getObsValue(encounter, 3, 'stage1Data');
        }
      } else if (encounter.display.includes('Stage1_Hour3')) {
        if (encounter.display.includes('Stage1_Hour3_1')) {
          this.getObsValue(encounter, 4, 'stage1Data');
        } else {
          this.getObsValue(encounter, 5, 'stage1Data');
        }
      } else if (encounter.display.includes('Stage1_Hour4')) {
        if (encounter.display.includes('Stage1_Hour4_1')) {
          this.getObsValue(encounter, 6, 'stage1Data');
        } else {
          this.getObsValue(encounter, 7, 'stage1Data');
        }
      } else if (encounter.display.includes('Stage1_Hour5')) {
        if (encounter.display.includes('Stage1_Hour5_1')) {
          this.getObsValue(encounter, 8, 'stage1Data');
        } else {
          this.getObsValue(encounter, 9, 'stage1Data');
        }
      } else if (encounter.display.includes('Stage1_Hour6')) {
        if (encounter.display.includes('Stage1_Hour6_1')) {
          this.getObsValue(encounter, 10, 'stage1Data');
        } else {
          this.getObsValue(encounter, 11, 'stage1Data');
        }
      } else if (encounter.display.includes('Stage1_Hour7')) {
        if (encounter.display.includes('Stage1_Hour7_1')) {
          this.getObsValue(encounter, 12, 'stage1Data');
        } else {
          this.getObsValue(encounter, 13, 'stage1Data');
        }
      } else if (encounter.display.includes('Stage1_Hour8')) {
        if (encounter.display.includes('Stage1_Hour8_1')) {
          this.getObsValue(encounter, 14, 'stage1Data');
        } else {
          this.getObsValue(encounter, 15, 'stage1Data');
        }
      } else if (encounter.display.includes('Stage1_Hour9')) {
        if (encounter.display.includes('Stage1_Hour9_1')) {
          this.getObsValue(encounter, 16, 'stage1Data');
        } else {
          this.getObsValue(encounter, 17, 'stage1Data');
        }
      }
    });
    this.filteredStage1 = this.stage1Data.filter(function (v, i) {
      return i % 2 == 0;
    });
  }

  getStag2Data(encounters) {
    this.createStages(12, 'stage2');
    encounters.forEach(encounter => {
      if (encounter.display.includes('Stage2_Hour1')) {
        if (encounter.display.includes('Stage2_Hour1_1')) {
          this.getObsValue(encounter, 0, 'stage2Data');
        } else if (encounter.display.includes('Stage2_Hour1_2')) {
          this.getObsValue(encounter, 1, 'stage2Data');
        } else if (encounter.display.includes('Stage2_Hour1_3')) {
          this.getObsValue(encounter, 2, 'stage2Data');
        } else if (encounter.display.includes('Stage2_Hour1_4')) {
          this.getObsValue(encounter, 3, 'stage2Data');
        }
      } else if (encounter.display.includes('Stage2_Hour2')) {
        if (encounter.display.includes('Stage2_Hour2_1')) {
          this.getObsValue(encounter, 4, 'stage2Data');
        } else if (encounter.display.includes('Stage2_Hour2_2')) {
          this.getObsValue(encounter, 5, 'stage2Data');
        } else if (encounter.display.includes('Stage2_Hour2_3')) {
          this.getObsValue(encounter, 6, 'stage2Data');
        } else if (encounter.display.includes('Stage2_Hour2_4')) {
          this.getObsValue(encounter, 7, 'stage2Data');
        }
      } else if (encounter.display.includes('Stage2_Hour3')) {
        if (encounter.display.includes('Stage2_Hour3_1')) {
          this.getObsValue(encounter, 8, 'stage2Data');
        } else if (encounter.display.includes('Stage2_Hour3_2')) {
          this.getObsValue(encounter, 9, 'stage2Data');
        } else if (encounter.display.includes('Stage2_Hour3_3')) {
          this.getObsValue(encounter, 10, 'stage2Data');
        } else if (encounter.display.includes('Stage2_Hour3_4')) {
          this.getObsValue(encounter, 11, 'stage2Data');
        }
      }
    });
    this.filteredStage2 = this.stage2Data.filter(function (v, i) {
      return i % 2 == 0;
    });

    this.filteredStage2Col = this.stage2Data.filter(function (v, i) {
      return i % 4 == 0;
    });

    for(let t of this.filteredStage2Col) {
      if(!t.time && this.isVisitEnded) {
        t['flag'] = true;
        t['birthTime']= this.birthtime;
        break;
      } else {
        t['flag'] = false;
      }
    }
  }

  print() {
    var tempTitle = document.title;
    document.title = "eLCG.pdf";
    window.print();
    document.title = tempTitle;
  }

  share(linkfor) {
    const text = encodeURIComponent(`Please find the link to download the case details -https://ezazi.intelehealth.org/intelehealth/index.html#/epartogram/${this.patientId}/${this.visitId}`);
    if (linkfor === "whatsapp") {
      return `https://wa.me/91${this.nurseMobNo}?text=${text}`;
    } else {
      return 'Please find the link to download the case details - ' + text;
    }
  }

  zoomin() {
    var Page = document.getElementById('epartogram');
    var zoom = parseInt(Page.style['zoom']) + 5 + '%'
    Page.style['zoom'] = zoom;
    var width = parseInt(Page.style['width']) + 5 + '%'
    Page.style['width'] = width;
    return false;
  }

  zoomout() {
    var Page = document.getElementById('epartogram');
    if(parseInt(Page.style['zoom']) == 100) return false;
    var zoom = parseInt(Page.style['zoom']) - 5 + '%'
    Page.style['zoom'] = zoom;
    var width = parseInt(Page.style['width']) - 5 + '%'
    Page.style['width'] = width;
    return false;
  }

  private createStages(column: number, type: string) {
    for (let i = 1; i <= column; i++) {
      type === 'stage1' ? this.stage1Data.push(new epartogram(i, null, null, null, null, null, null, 0, null, null, null, null,
        null, null, null, null, 0, null, null, undefined, null, null, null, null, null, null, null, null)) :
        this.stage2Data.push(new epartogram(i, null, null, null, null, null, null, 0, null, null, null, null,
          null, null, null, null, 0, null, null, undefined, null, null, null, null, null, null, null, null));
    }
  }

  private getObsValue(encounter, index, stageType) {
    this[stageType][index].time = moment(encounter.encounterDatetime).format("HH:mm");
    this[stageType][index].uuid = encounter.uuid;
    this[stageType][index].initals = this.getInitials(encounter.encounterProviders[0].display);
    encounter.obs.forEach(obs => {
      if (obs.display.includes('Companion')) {
        this[stageType][index].companion = this.setObs(obs);
      }
      if (obs.display.includes('Pain relief')) {
        this[stageType][index].painRelief = this.setObs(obs);
      }
      if (obs.display.includes('Oral Fluid')) {
        this[stageType][index].oralFluid = this.setObs(obs);
      }
      if (obs.display.includes('Posture')) {
        this[stageType][index].posture = this.setObs(obs);
      }
      if (obs.display.includes('Baseline FHR')) {
        this[stageType][index].baselineFHR = this.setObs(obs);
      }
      if (obs.display.includes('FHR Deceleration')) {
        this[stageType][index].fhrDeceleration = this.setObs(obs);
      }
      if (obs.display.includes('Amniotic fluid')) {
        this[stageType][index].amnioticfluid = this.setObs(obs);
      }
      if (obs.display.includes('Fetal position')) {
        this[stageType][index].fetalPosition = this.setObs(obs);
      }
      if (obs.display.includes('Caput')) {
        this[stageType][index].caput = this.setObs(obs);
      }
      if (obs.display.includes('Moulding')) {
        this[stageType][index].moulding = this.setObs(obs);
      }
      if (obs.display.includes('PULSE')) {
        this[stageType][index].pulse = this.setObs(obs);
      }
      if (obs.display.includes('Systolic BP')) {
        this[stageType][index].systolicBP = this.setObs(obs);
      }
      if (obs.display.includes('Diastolic BP')) {
        this[stageType][index].diastolicBP = this.setObs(obs);
      }
      if (obs.display.includes('TEMPERATURE (C)')) {
        this[stageType][index].temperature = this.setObs(obs);
      }
      if (obs.display.includes('Urine protein')) {
        this[stageType][index].urine = this.setObs(obs);
      }
      if (obs.display.includes('Contractions per 10 min')) {
        this[stageType][index].contractions = this.setObs(obs);
      }
      if (obs.display.includes('Duration of contraction')) {
        this[stageType][index].durationOfContraction = this.setObs(obs);
      }
      if (obs.display.includes('Cervix 0 cm, 1 cm, 2 cm, 3 cm, 4 cm, 5 cm')) {
        this[stageType][index].cervix = this.setObs(obs);
      }
      if (obs.display.includes('Descent 0-5')) {
        this[stageType][index].descent = this.setObs(obs);
      }
      if (obs.display.includes('Oxytocin U/l, Drops per min')) {
        this[stageType][index].oxytocin = obs.value;
      }
      if (obs.display.includes('Medicine')) {
        this[stageType][index].medicine = obs.value;
      }
      if (obs.display.includes('IV fluids')) {
        this[stageType][index].ivfluids = obs.value;
      }
      if (obs.display.includes('Assessment')) {
        this.setNotes(index, obs.value, 'assessment', stageType);
      }
      if (obs.display.includes('Additional Comments')) {
        this.setNotes(index, obs.value, 'plan', stageType);
      }
    });
  }

  private setObs(obs: any): Object {
    return {
      value: obs.value,
      colorFlag: obs.comment
    };
  }

  private setNotes(index: any, obsValue: any, type: string, stageType: string) {
    if (this[stageType][index][type] !== null) {
      this[stageType][index][type] = this[stageType][index][type].concat(';\n' + obsValue);
    } else {
      this[stageType][index][type] = obsValue;
    }
  }

  private getInitials(name) {
    const nurseName = name.split(":")[0];
    const fullName = nurseName.split(' ');
    const initials = fullName.shift().charAt(0) + fullName.pop().charAt(0);
    return initials.toUpperCase();
  }

}
