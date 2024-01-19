import { Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatAccordion } from '@angular/material/expansion';
import { MatTableDataSource } from '@angular/material/table';
import { ActivatedRoute, Router } from '@angular/router';
import * as moment from 'moment';
import { CoreService } from 'src/app/services/core/core.service';
import { EncounterService } from 'src/app/services/encounter.service';
import { VisitService } from 'src/app/services/visit.service';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-epartogram',
  templateUrl: './epartogram.component.html',
  styleUrls: ['./epartogram.component.scss']
})
export class EpartogramComponent implements OnInit {

  pos = { top: 0, left: 0, x: 0, y: 0 };
  ele: any;
  mm: any;
  mu: any;
  provider: any;
  visit: any;
  patient: any;
  pinfo: any = {};
  nurseMobNo: string;
  birthOutcome: string;
  birthtime: string;
  visitCompleted: boolean = false;
  assessments: any[] = [];
  parameters: any[] = [
    {
      name: 'Companion',
      conceptName: 'Companion',
      stage1Count: 15,
      stage2Count: 5,
      alert: true
    },
    {
      name: 'Pain relief',
      conceptName: 'Pain relief',
      stage1Count: 15,
      stage2Count: 5,
      alert: true
    },
    {
      name: 'Oral Fluid',
      conceptName: 'Oral Fluid',
      stage1Count: 15,
      stage2Count: 5,
      alert: true
    },
    {
      name: 'Posture',
      conceptName: 'Posture',
      stage1Count: 15,
      stage2Count: 5,
      alert: true
    },
    {
      name: 'Baseline FHR',
      conceptName: 'Baseline FHR',
      stage1Count: 30,
      stage2Count: 20,
      alert: true
    },
    {
      name: 'FHR deceleration',
      conceptName: 'FHR Deceleration',
      stage1Count: 30,
      stage2Count: 20,
      alert: true
    },
    {
      name: 'Amniotic fluid',
      conceptName: 'Amniotic fluid',
      stage1Count: 15,
      stage2Count: 10,
      alert: true
    },
    {
      name: 'Fetal position',
      conceptName: 'Fetal position',
      stage1Count: 15,
      stage2Count: 10,
      alert: true
    },
    {
      name: 'Caput',
      conceptName: 'Caput',
      stage1Count: 15,
      stage2Count: 10,
      alert: true
    },
    {
      name: 'Moulding',
      conceptName: 'Moulding',
      stage1Count: 15,
      stage2Count: 10,
      alert: true
    },
    {
      name: 'Pulse',
      conceptName: 'PULSE',
      stage1Count: 15,
      stage2Count: 10,
      alert: true
    },
    {
      name: 'Systolic BP',
      conceptName: 'Systolic BP',
      stage1Count: 15,
      stage2Count: 10,
      alert: true
    },
    {
      name: 'Diastolic BP',
      conceptName: 'Diastolic BP',
      stage1Count: 15,
      stage2Count: 10,
      alert: true
    },
    {
      name: 'Temperature ℃',
      conceptName: 'TEMPERATURE (C)',
      stage1Count: 15,
      stage2Count: 10,
      alert: true
    },
    {
      name: 'Urine',
      conceptName: 'Urine protein',
      stage1Count: 15,
      stage2Count: 10,
      alert: true
    },
    {
      name: 'Contractions per 10 min',
      conceptName: 'Contractions per 10 min',
      stage1Count: 30,
      stage2Count: 20,
      alert: true
    },
    {
      name: 'Duration of contractions',
      conceptName: 'Duration of contraction',
      stage1Count: 30,
      stage2Count: 20,
      alert: true
    },
    {
      name: 'Cervix [Plot X]',
      conceptName: 'Cervix 0 cm, 1 cm, 2 cm, 3 cm, 4 cm, 5 cm',
      stage1Count: 15,
      stage2Count: 20,
      alert: true
    },
    {
      name: 'Descent [Plot O]',
      conceptName: 'Descent 0-5',
      stage1Count: 15,
      stage2Count: 20,
      alert: true
    },
    {
      name: 'Oxytocin (U/L, drops/min)',
      conceptName: 'Oxytocin U/l, Drops per min',
      stage1Count: 30,
      stage2Count: 20,
      alert: false
    },
    {
      name: 'Medicine',
      conceptName: 'Medicine',
      stage1Count: 15,
      stage2Count: 5,
      alert: false
    },
    {
      name: 'IV fluids',
      conceptName: 'IV fluids',
      stage1Count: 30,
      stage2Count: 20,
      alert: false
    },
    {
      name: 'ASSESSMENT',
      conceptName: 'Assessment',
      stage1Count: 30,
      stage2Count: 20,
      alert: false
    },
    {
      name: 'PLAN',
      conceptName: 'Additional Comments',
      stage1Count: 30,
      stage2Count: 20,
      alert: false
    },
    {
      name: 'Encounter Status',
      conceptName: 'Encounter status',
      stage1Count: 15,
      stage2Count: 5,
      alert: false
    },
    {
      name: 'Urine Acetone',
      conceptName: 'Urine acetone',
      stage1Count: 15,
      stage2Count: 10,
      alert: true
    },
    {
      id: 26,
      name: 'Medicine Prescribed',
      conceptName: 'Medicine Prescribed',
      stage1Count: 30,
      stage2Count: 20,
      alert: false
    },
    {
      id: 27,
      name: 'Oxytocin (U/L, drops/min) Prescribed',
      conceptName: 'Oxytocin U/l, Drops per min, Prescribed',
      stage1Count: 30,
      stage2Count: 20,
      alert: false
    },
    {
      id: 28,
      name: 'IV fluids Prescribed',
      conceptName: 'IV fluids Prescribed',
      stage1Count: 30,
      stage2Count: 20,
      alert: false
    }
  ];
  timeStage1: any[] = Array(15).fill(null);
  timeStage2: any[] = Array(5).fill(null);
  timeFullStage1: any[] = Array(30).fill(null);
  timeFullStage2: any[] = Array(20).fill(null);
  initialsStage1: string[] = Array(15).fill(null);
  initialsStage2: string[] = Array(5).fill(null);
  encuuid1: string[] = Array(15).fill(null);
  encuuid2: string[] = Array(5).fill(null);
  encuuid1Full: any[] = Array(30).fill(null);
  encuuid2Full: any[] = Array(20).fill(null);
  displayedColumns: string[] = ['timeAndStage', 'medicine', 'assessment', 'plan'];
  dataSource = new MatTableDataSource<any>();
  @ViewChild('assessmentPaginator') assessmentPaginator: MatPaginator;

  visitCompleteReason: string;
  outOfTimeReason: string;
  referTypeOtherReason: string;
  birthOutcomeOther: string;
  motherDeceased: string;
  motherDeceasedReason: string;
  apgar1: any;
  apgar5: any;
  birthWeight: any;
  babyStatus: any;
  babyGender: any;
  loginAttempt: number = 0;
  stage: number = 0;
  assessmentHistory: any[] = [];
  planHistory: any[] = [];
  medicationPrescribedHistory: any[] = [];
  oxytocinPrescribedHistory: any[] = [];
  ivPrescribedHistory: any[] = [];
  showAll = false;
  @ViewChild(MatAccordion) accordion: MatAccordion;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private visitService: VisitService,
    private authService: AuthService,
    private coreService: CoreService) { }

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    this.login(id);
    for (let x = 0; x < this.parameters.length; x++) {
      if (x == 20 || x == 22 || x == 23 || x == 26 || x == 27 || x == 28) {
        this.parameters[x]['stage1values'] = Array(this.parameters[x].stage1Count).fill([]);
        this.parameters[x]['stage2values'] = Array(this.parameters[x].stage2Count).fill([]);
      } else {
        this.parameters[x]['stage1values'] = Array(this.parameters[x].stage1Count).fill(null);
        this.parameters[x]['stage2values'] = Array(this.parameters[x].stage2Count).fill(null);
      }
    }
  }

  login(visituuid: string) {
    this.loginAttempt++;
    this.authService.loginExternal().subscribe((res: any) => {
      if (res.authenticated) {
        setTimeout(()=> {
          this.ele = document.getElementsByClassName('table-responsive')[0];
          if (this.ele) {
            this.ele.scrollTop = 0;
            this.ele.scrollLeft = 0;
            this.ele.addEventListener('mousedown', this.mouseDownHandler.bind(this));
          }
        }, 1000);
        this.getVisit(visituuid);
      }
    }, err => {
      if (this.loginAttempt < 3) this.login(visituuid);
    });
  }

  getVisit(uuid: string) {
    this.visitService.fetchVisitDetails(uuid).subscribe((visit: any) => {
      if (visit) {
        this.visit = visit;
        this.patient = visit?.patient;
        this.readPatientAttributes();
        this.readStageData();
      }
    });
  }

  readPatientAttributes() {
    for (let x = 0; x < this.patient?.attributes.length; x++) {
      this.pinfo[this.patient?.attributes[x]?.attributeType.display.replace(/ /g,'')] = this.patient?.attributes[x]?.value;
    }
    if (this.pinfo['ActiveLaborDiagnosed']) {
      this.pinfo['ActiveLaborDiagnosed'] = moment(this.pinfo['ActiveLaborDiagnosed'], 'DD/MM/YYYY hh:mm A').toISOString();
    }
    if (this.pinfo['MembraneRupturedTimestamp']) {
      (this.pinfo['MembraneRupturedTimestamp'] == 'U')? this.pinfo['MembraneRupturedTimestamp'] = 'U' : this.pinfo['MembraneRupturedTimestamp'] = moment(this.pinfo['MembraneRupturedTimestamp'], 'DD/MM/YYYY hh:mm A').toISOString();
    }
    this.pinfo['age'] = this.patient?.person.age;
    this.pinfo['birthdate'] = this.patient?.person.birthdate;
    this.pinfo['name'] = this.patient?.person.display;
    this.pinfo['gender'] = this.patient?.person.gender;
    this.pinfo['openMrsId'] = this.patient?.identifiers[0]?.identifier;
    const providerAttributes = this.visit.encounters[0]?.encounterProviders[0]?.provider?.attributes;
    if (providerAttributes?.length) {
      let attr = providerAttributes.find((o: any) => o.attributeType.display == 'whatsapp');
      if (attr) {
        this.nurseMobNo = attr.value
      } else {
        attr = providerAttributes.find((o: any) => o.attributeType.display == 'phoneNumber');
        if (attr) {
          this.nurseMobNo = attr.value;
        }
      }
    }
    const visitCompleteEnc = this.visit.encounters.find((o: any) => o.encounterType.display == 'Visit Complete');
    if (visitCompleteEnc) {
      this.visitCompleted = true;
      let outOfTimeIndex = visitCompleteEnc.obs.findIndex((o: any) => o.concept.display == 'OUT OF TIME');
      let referTypeIndex = visitCompleteEnc.obs.findIndex((o: any) => o.concept.display == 'Refer Type');
      if (outOfTimeIndex != -1) {
        this.visitCompleteReason = "Out Of Time";
        this.outOfTimeReason = visitCompleteEnc.obs[outOfTimeIndex].value;
      } else if (referTypeIndex != -1) {
        this.visitCompleteReason = visitCompleteEnc.obs[referTypeIndex].value;
        if (visitCompleteEnc.obs[referTypeIndex].value == 'Other') {
          this.referTypeOtherReason = visitCompleteEnc.obs.find((o: any) => o.concept.display == 'Refer Type Other')?.value;
        }
      } else {
        this.visitCompleteReason = "Newborn";
        this.birthOutcome = visitCompleteEnc.obs.find((o: any) => o.concept.display == 'Birth Outcome')?.value;
        if (this.birthOutcome == 'Other'||this.birthOutcome == 'OTHER') {
          this.birthOutcomeOther = visitCompleteEnc.obs.find((o: any) => o.concept.display == 'Birth Outcome Other')?.value;
        }
        this.motherDeceased = visitCompleteEnc.obs.find((o: any) => o.concept.display == 'MOTHER DECEASED NEW')?.value;
        if (this.motherDeceased == 'YES') {
          this.motherDeceasedReason = visitCompleteEnc.obs.find((o: any) => o.concept.display == 'MOTHER DECEASED REASON')?.value;
        }
      }

      this.apgar1 = visitCompleteEnc.obs.find((o: any) => o.concept.display == 'Apgar at 1 min')?.value;
      this.apgar5 = visitCompleteEnc.obs.find((o: any) => o.concept.display == 'Apgar at 5 min')?.value;
      this.birthWeight = visitCompleteEnc.obs.find((o: any) => o.concept.display == 'BirthWeight')?.value;
      this.babyStatus = visitCompleteEnc.obs.find((o: any) => o.concept.display == 'Baby status')?.value;
      this.babyGender = visitCompleteEnc.obs.find((o: any) => o.concept.display == 'Sex')?.value;

      setTimeout(() => {
        document.querySelector('#vcd').scrollIntoView();
      }, 500);
    }
  }

  readStageData() {
    const encs = this.visit.encounters.sort((a: any, b: any) => new Date(a.encounterDatetime).getTime() - new Date(b.encounterDatetime).getTime());
    for (const enc of encs) {
      if (enc.display.includes('Stage')) {
        const indices = enc.encounterType.display.replace('Stage', '').replace('Hour', '').split('_').map((val: any) => +val);
        const stageNo = indices[0];
        const stageHourNo = indices[1];
        const stageHourSecNo = indices[2];

        // Get timing and initials
        if (stageNo == 1 && stageHourNo <= 15) {

          if (stageNo > this.stage) this.stage = stageNo;
          if (!this.timeStage1[stageHourNo - 1]) this.timeStage1[stageHourNo - 1] = enc.encounterDatetime;
          this.timeFullStage1[((2 * (stageHourNo - 1)) + (stageHourSecNo - 1))] = enc.encounterDatetime;
          this.initialsStage1[stageHourNo - 1] = this.getInitials(enc.encounterProviders[0].provider.person.display);
          if (!this.encuuid1[stageHourNo - 1]) this.encuuid1[stageHourNo - 1] = enc.uuid;
          this.encuuid1Full[((2 * (stageHourNo - 1)) + (stageHourSecNo - 1))] = { enc_time: enc.encounterDatetime, enc_uuid: enc.uuid, stageNo, stageHourNo, stageHourSecNo };

        } else if (stageNo == 2 && stageHourNo <= 5) {

          if (stageNo > this.stage) this.stage = stageNo;
          if (!this.timeStage2[stageHourNo - 1]) this.timeStage2[stageHourNo - 1] = enc.encounterDatetime;
          this.timeFullStage2[((4 * (stageHourNo - 1)) + (stageHourSecNo - 1))] = enc.encounterDatetime;
          this.initialsStage2[stageHourNo - 1] = this.getInitials(enc.encounterProviders[0].provider.person.display);
          if (!this.encuuid2[stageHourNo - 1]) this.encuuid2[stageHourNo - 1] = enc.uuid;
          this.encuuid2Full[((4 * (stageHourNo - 1)) + (stageHourSecNo - 1))] = { enc_time: enc.encounterDatetime, enc_uuid: enc.uuid, stageNo, stageHourNo, stageHourSecNo };
        } else {
          continue;
        }

        // Read observations
        const observations = enc.obs.sort((a: any, b: any) => new Date(a.obsDatetime).getTime() - new Date(b.obsDatetime).getTime());
        if (observations.length) {
          for (const ob of observations) {
            const parameterIndex = this.parameters.findIndex((o: any) => o.conceptName == ob.concept.display);
            if (parameterIndex != -1) {
              const parameterValue = this.parameters.find((o: any) => o.conceptName == ob.concept.display);
              let valueIndex = -1;
              if (stageNo == 1) {
                (parameterValue.stage1Count == 15) ? (valueIndex = stageHourNo - 1) : (valueIndex = ((2 * (stageHourNo - 1)) + (stageHourSecNo - 1)));
              } else {
                switch (parameterValue.stage2Count) {
                  case 5:
                    valueIndex = stageHourNo - 1;
                    break;
                  case 10:
                    valueIndex = (stageHourSecNo == 1) ? ((2 * (stageHourNo - 1)) + (stageHourSecNo - 1)) : ((stageHourSecNo == 4) ? ((2 * (stageHourNo - 1)) + (stageHourSecNo - 3)) : ((2 * (stageHourNo - 1)) + (stageHourSecNo - 2)));
                    break;
                  default:
                    valueIndex = ((4 * (stageHourNo - 1)) + (stageHourSecNo - 1));
                    break;
                }
              }

              switch (parameterIndex) {
                case 20:
                case 22:
                case 23:
                case 26:
                  this.parameters[parameterIndex][`stage${stageNo}values`][valueIndex] = [...this.parameters[parameterIndex][`stage${stageNo}values`][valueIndex], { value: ob.value, uuid: ob.uuid, creator: ob.creator, obsDatetime: ob.obsDatetime, initial: this.getInitials(ob.creator?.person.display) }];
                  break;
                case 27:
                case 28:
                  this.parameters[parameterIndex][`stage${stageNo}values`][valueIndex] = [...this.parameters[parameterIndex][`stage${stageNo}values`][valueIndex], { value: ob.value.startsWith("{") ? JSON.parse(ob.value) : ob.value, uuid: ob.uuid, creator: ob.creator, obsDatetime: ob.obsDatetime, initial: this.getInitials(ob.creator?.person.display) }];
                  break;
                case 19:
                case 21:
                  // this.parameters[parameterIndex][`stage${stageNo}values`][valueIndex] = [...this.parameters[parameterIndex][`stage${stageNo}values`][valueIndex], { value: ob.value.startsWith("{") ? JSON.parse(ob.value) : ob.value, uuid: ob.uuid, creator: ob.creator, obsDatetime: ob.obsDatetime, initial: this.getInitials(ob.creator?.person.display) }];
                  this.parameters[parameterIndex][`stage${stageNo}values`][valueIndex] = { value: ob.value.startsWith("{") ? JSON.parse(ob.value) : ob.value, uuid: ob.uuid };
                  break;
                default:
                  this.parameters[parameterIndex][`stage${stageNo}values`][valueIndex] = (parameterValue.alert) ? { value: ob.value, comment: ob.comment, uuid: ob.uuid, creator: ob.creator } : { value: ob.value, uuid: ob.uuid, creator: ob.creator };
                  break;
              }
            }
          }
        }
      }
    }
    this.getPastData(22);
    this.getPastData(23);
    this.getPastData(26);
    this.getPastData(27);
    this.getPastData(28);
  }

  mouseDownHandler(e: any) {
    // Change the cursor and prevent user from selecting the text
    this.ele.style.cursor = 'grabbing';
    this.ele.style.userSelect = 'none';
    this.pos = {
        // The current scroll
        left: this.ele.scrollLeft,
        top: this.ele.scrollTop,
        // Get the current mouse position
        x: e.clientX,
        y: e.clientY,
    };

    if (!this.mm) {
      this.mm = this.mouseMoveHandler.bind(this);
    }
    if (!this.mu) {
        this.mu = this.mouseUpHandler.bind(this);
    }

    document.addEventListener('mousemove', this.mm, false);
    document.addEventListener('mouseup', this.mu, false);
  }

  mouseMoveHandler(e: any) {
    // How far the mouse has been moved
    const dx = e.clientX - this.pos.x;
    const dy = e.clientY - this.pos.y;

    // Scroll the element
    this.ele.scrollTop = this.pos.top - dy;
    this.ele.scrollLeft = this.pos.left - dx;
  }

  mouseUpHandler() {
    document.removeEventListener('mousemove', this.mm, false);
    document.removeEventListener('mouseup', this.mu, false);

    this.ele.style.cursor = 'grab';
    this.ele.style.removeProperty('user-select');
  }

  getInitials(name: string) {
    const fullName = name.split(' ');
    const initials = fullName.shift().charAt(0) + fullName.pop().charAt(0);
    return initials.toUpperCase();
  }

  checkIfFutureEncounterExists(futureStartIndex) {
    let flag = false;
    let t = this.timeStage1.concat(this.timeStage2);
    for (let x = futureStartIndex; x < t.length; x++) {
      if (t[x] != null) {
        flag = true;
        break;
      }
    }
    return flag;
  }

  getPatientIdentifier(identifierType: string) {
    let identifier = '';
    if (this.patient) {
      this.patient.identifiers.forEach((idf: any) => {
        if (idf.identifierType.display == identifierType) {
          identifier = idf.identifier;
        }
      });
    }
    return identifier;
  }

  getEncounterPlanData(stageNo: number, encounterNo: number) {
    let planData = [];
    let medicationData = [];
    let oxytocinData = [];
    let ivData = [];
    if (stageNo == 1) {
      planData = this.parameters[23].stage1values[2 * encounterNo].concat(this.parameters[23].stage1values[((2 * (encounterNo)) + 1)]).sort((a, b) => new Date(b.obsDatetime).getTime() - new Date(a.obsDatetime).getTime());
      medicationData = this.parameters[26].stage1values[2 * encounterNo].concat(this.parameters[26].stage1values[((2 * (encounterNo)) + 1)]).sort((a, b) => new Date(b.obsDatetime).getTime() - new Date(a.obsDatetime).getTime());
      oxytocinData = this.parameters[27].stage1values[2 * encounterNo].concat(this.parameters[27].stage1values[((2 * (encounterNo)) + 1)]).sort((a, b) => new Date(b.obsDatetime).getTime() - new Date(a.obsDatetime).getTime());
      ivData = this.parameters[28].stage1values[2 * encounterNo].concat(this.parameters[28].stage1values[((2 * (encounterNo)) + 1)]).sort((a, b) => new Date(b.obsDatetime).getTime() - new Date(a.obsDatetime).getTime());
    } else {
      planData = this.parameters[23].stage2values[4 * encounterNo].concat(this.parameters[23].stage2values[((4 * (encounterNo)) + 1)]).concat(this.parameters[23].stage2values[((4 * (encounterNo)) + 2)]).concat(this.parameters[23].stage2values[((4 * (encounterNo)) + 3)]).sort((a, b) => new Date(b.obsDatetime).getTime() - new Date(a.obsDatetime).getTime());
      medicationData = this.parameters[26].stage2values[4 * encounterNo].concat(this.parameters[26].stage2values[((4 * (encounterNo)) + 1)]).concat(this.parameters[26].stage2values[((4 * (encounterNo)) + 2)]).concat(this.parameters[26].stage2values[((4 * (encounterNo)) + 3)]).sort((a, b) => new Date(b.obsDatetime).getTime() - new Date(a.obsDatetime).getTime());
      oxytocinData = this.parameters[27].stage2values[4 * encounterNo].concat(this.parameters[27].stage2values[((4 * (encounterNo)) + 1)]).concat(this.parameters[27].stage2values[((4 * (encounterNo)) + 2)]).concat(this.parameters[27].stage2values[((4 * (encounterNo)) + 3)]).sort((a, b) => new Date(b.obsDatetime).getTime() - new Date(a.obsDatetime).getTime());
      ivData = this.parameters[28].stage2values[4 * encounterNo].concat(this.parameters[28].stage2values[((4 * (encounterNo)) + 1)]).concat(this.parameters[28].stage2values[((4 * (encounterNo)) + 2)]).concat(this.parameters[28].stage2values[((4 * (encounterNo)) + 3)]).sort((a, b) => new Date(b.obsDatetime).getTime() - new Date(a.obsDatetime).getTime());
    }
    return { stage: stageNo, hour: encounterNo + 1, planData: [...planData], medicationData: [...medicationData], oxytocinData: [...oxytocinData], ivData: [...ivData] };
  }

  getEncounterAssessmentData(stageNo: number, encounterNo: number) {
    let assessmentData = [];
    if (stageNo == 1) {
      assessmentData = this.parameters[22].stage1values[2 * encounterNo].concat(this.parameters[22].stage1values[((2 * (encounterNo)) + 1)]).sort((a, b) => new Date(b.obsDatetime).getTime() - new Date(a.obsDatetime).getTime());
    } else {
      assessmentData = this.parameters[22].stage2values[4 * encounterNo].concat(this.parameters[22].stage2values[((4 * (encounterNo)) + 1)]).concat(this.parameters[22].stage2values[((4 * (encounterNo)) + 2)]).concat(this.parameters[23].stage2values[((4 * (encounterNo)) + 3)]).sort((a, b) => new Date(b.obsDatetime).getTime() - new Date(a.obsDatetime).getTime());
    }
    return { stage: stageNo, hour: encounterNo + 1, assessmentData: [...assessmentData] };
  }

  viewPlan(stageNo: number, encounterNo: number) {
    this.coreService.openViewDetailPlanModal(this.getEncounterPlanData(stageNo, encounterNo)).subscribe(res => {});
  }

  viewAssessment(stageNo: number, encounterNo: number) {
    this.coreService.openViewDetailAssessmentModal(this.getEncounterAssessmentData(stageNo, encounterNo)).subscribe(res => {});
  }

  getPastData(index: number) {
    const historyData = this.parameters[index].stage1values.reduce((acc, item) => {
      return acc.concat(item);
    }, []).concat(this.parameters[index].stage2values.reduce((acc, item) => {
      return acc.concat(item);
    }, [])).sort((a, b) => new Date(b.obsDatetime).getTime() - new Date(a.obsDatetime).getTime());

    switch (index) {
      case 22:
        this.assessmentHistory = [...historyData];
        break;
      case 23:
        this.planHistory = [...historyData];
        break;
      case 26:
        this.medicationPrescribedHistory = [...historyData];
        break;
      case 27:
        this.oxytocinPrescribedHistory = [...historyData];
        break;
      case 28:
        this.ivPrescribedHistory = [...historyData];
        break;
      default:
        break;
    }
  }
}
