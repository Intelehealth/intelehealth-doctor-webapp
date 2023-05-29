import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { ActivatedRoute, Router } from '@angular/router';
import * as moment from 'moment';
import { PanZoomAPI, PanZoomConfig } from 'ngx-panzoom';
import { Subscription } from 'rxjs';
import { PageTitleService } from 'src/app/core/page-title/page-title.service';
import { ChatBoxComponent } from 'src/app/modal-components/chat-box/chat-box.component';
import { VideoCallComponent } from 'src/app/modal-components/video-call/video-call.component';
import { CoreService } from 'src/app/services/core/core.service';
import { EncounterService } from 'src/app/services/encounter.service';
import { VisitService } from 'src/app/services/visit.service';

@Component({
  selector: 'app-partogram',
  templateUrl: './partogram.component.html',
  styleUrls: ['./partogram.component.scss']
})
export class PartogramComponent implements OnInit, OnDestroy {

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
      stage1Count: 12,
      stage2Count: 3,
      alert: true
    },
    {
      name: 'Pain relief',
      conceptName: 'Pain relief',
      stage1Count: 12,
      stage2Count: 3,
      alert: true
    },
    {
      name: 'Oral Fluid',
      conceptName: 'Oral Fluid',
      stage1Count: 12,
      stage2Count: 3,
      alert: true
    },
    {
      name: 'Posture',
      conceptName: 'Posture',
      stage1Count: 12,
      stage2Count: 3,
      alert: true
    },
    {
      name: 'Baseline FHR',
      conceptName: 'Baseline FHR',
      stage1Count: 24,
      stage2Count: 12,
      alert: true
    },
    {
      name: 'FHR deceleration',
      conceptName: 'FHR Deceleration',
      stage1Count: 24,
      stage2Count: 12,
      alert: true
    },
    {
      name: 'Amniotic fluid',
      conceptName: 'Amniotic fluid',
      stage1Count: 12,
      stage2Count: 6,
      alert: true
    },
    {
      name: 'Fetal position',
      conceptName: 'Fetal position',
      stage1Count: 12,
      stage2Count: 6,
      alert: true
    },
    {
      name: 'Caput',
      conceptName: 'Caput',
      stage1Count: 12,
      stage2Count: 6,
      alert: true
    },
    {
      name: 'Moulding',
      conceptName: 'Moulding',
      stage1Count: 12,
      stage2Count: 6,
      alert: true
    },
    {
      name: 'Pulse',
      conceptName: 'PULSE',
      stage1Count: 12,
      stage2Count: 6,
      alert: true
    },
    {
      name: 'Systolic BP',
      conceptName: 'Systolic BP',
      stage1Count: 12,
      stage2Count: 6,
      alert: true
    },
    {
      name: 'Diastolic BP',
      conceptName: 'Diastolic BP',
      stage1Count: 12,
      stage2Count: 6,
      alert: true
    },
    {
      name: 'Temperature ℃',
      conceptName: 'TEMPERATURE (C)',
      stage1Count: 12,
      stage2Count: 6,
      alert: true
    },
    {
      name: 'Urine',
      conceptName: 'Urine protein',
      stage1Count: 12,
      stage2Count: 6,
      alert: true
    },
    {
      name: 'Contractions per 10 min',
      conceptName: 'Contractions per 10 min',
      stage1Count: 24,
      stage2Count: 12,
      alert: true
    },
    {
      name: 'Duration of contractions',
      conceptName: 'Duration of contraction',
      stage1Count: 24,
      stage2Count: 12,
      alert: true
    },
    {
      name: 'Cervix [Plot X]',
      conceptName: 'Cervix 0 cm, 1 cm, 2 cm, 3 cm, 4 cm, 5 cm',
      stage1Count: 12,
      stage2Count: 12,
      alert: true
    },
    {
      name: 'Descent [Plot O]',
      conceptName: 'Descent 0-5',
      stage1Count: 12,
      stage2Count: 6,
      alert: true
    },
    {
      name: 'Oxytocin (U/L, drops/min)',
      conceptName: 'Oxytocin U/l, Drops per min',
      stage1Count: 12,
      stage2Count: 3,
      alert: false
    },
    {
      name: 'Medicine',
      conceptName: 'Medicine',
      stage1Count: 12,
      stage2Count: 3,
      alert: false
    },
    {
      name: 'IV fluids',
      conceptName: 'IV fluids',
      stage1Count: 12,
      stage2Count: 3,
      alert: false
    },
    {
      name: 'ASSESSMENT',
      conceptName: 'Assessment',
      stage1Count: 12,
      stage2Count: 3,
      alert: false
    },
    {
      name: 'PLAN',
      conceptName: 'Additional Comments',
      stage1Count: 12,
      stage2Count: 3,
      alert: false
    },
  ];
  timeStage1: any[] = Array(12).fill(null);
  timeStage2: any[] = Array(3).fill(null);
  initialsStage1: string[] = Array(12).fill(null);
  initialsStage2: string[] = Array(3).fill(null);
  encuuid1: string[] = Array(12).fill(null);
  encuuid2: string[] = Array(3).fill(null);
  displayedColumns: string[] = ['timeAndStage', 'medicine', 'assessment', 'plan'];
  dataSource = new MatTableDataSource<any>();
  @ViewChild('assessmentPaginator') assessmentPaginator: MatPaginator;
  conceptPlan = '162169AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA';
  conceptAssessment = '67a050c1-35e5-451c-a4ab-fff9d57b0db1';
  conceptMedicine = 'c38c0c50-2fd2-4ae3-b7ba-7dd25adca4ca';
  dialogRef1: MatDialogRef<ChatBoxComponent>;
  dialogRef2: MatDialogRef<VideoCallComponent>;

  panZoomConfig: PanZoomConfig = new PanZoomConfig({
    zoomOnMouseWheel: false,
    zoomOnDoubleClick: false,
    scalePerZoomLevel: 1.5,
    freeMouseWheel: false,
    invertMouseWheel: true
  });
  private panZoomAPI: PanZoomAPI;
  private apiSubscription: Subscription;
  private zoomLevel: number = 2;

  constructor(
    private pageTitleService: PageTitleService,
    private route: ActivatedRoute,
    private router: Router,
    private visitService: VisitService,
    private coreService: CoreService,
    private encounterService: EncounterService
  ) { }

  ngOnDestroy(): void {
    this.apiSubscription.unsubscribe();
  }

  zoomIn() {
    if (this.zoomLevel < 4) {
      this.zoomLevel++;
      this.panZoomAPI.changeZoomLevel(this.zoomLevel, { x: 0, y: 0 });
      this.panZoomAPI.centerX();
    }
  }

  zoomOut() {
    if (this.zoomLevel > 0) {
      this.zoomLevel--;
      this.panZoomAPI.changeZoomLevel(this.zoomLevel, { x: 0, y: 0 });
      this.panZoomAPI.centerX();
    }
  }

  zoomReset() {
    this.zoomLevel = 2;
    this.panZoomAPI.resetView();
  }

  ngOnInit(): void {
    this.apiSubscription = this.panZoomConfig.api.subscribe( (api: PanZoomAPI) => this.panZoomAPI = api );
    this.pageTitleService.setTitle({ title: '', imgUrl: '' });
    const id = this.route.snapshot.paramMap.get('id');
    this.provider = JSON.parse(localStorage.getItem("provider"));
    setTimeout(()=> {
      this.ele = document.getElementsByClassName('table-responsive')[0];
      if (this.ele) {
        this.ele.scrollTop = 0;
        this.ele.scrollLeft = 0;
        this.ele.addEventListener('mousedown', this.mouseDownHandler.bind(this));
      }
    }, 1000);
    this.getVisit(id);
  }

  getVisit(uuid: string) {
    this.visitService.fetchVisitDetails(uuid).subscribe((visit: any) => {
      if (visit) {
        this.visit = visit;
        this.patient = visit?.patient;
        // console.log(visit);
        this.readPatientAttributes();
        this.readStageData();
      }
    }, (error: any) => {
      this.router.navigate(['/dashboard']);
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
      visitCompleteEnc.obs.forEach((obs: any) => {
        if (obs.display.includes('Birth Outcome')) {
          this.birthOutcome = obs.value;
        }
        if (obs.display.includes('Refer to other Hospital')) {
          this.birthOutcome = 'RTOH';
        }
        if (obs.display.includes('Self discharge against Medical Advice')) {
          this.birthOutcome = 'DAMA';
        }
        this.birthtime = moment(visitCompleteEnc.encounterDatetime).format("HH:mm A");
      });
    }

    // console.log(this.pinfo);
    // console.log(this.nurseMobNo);
    // console.log(this.birthOutcome);
    // console.log(this.birthtime);
  }

  readStageData() {
    for (let x = 0; x < this.parameters.length; x++) {
      if (x == 20) {
        this.parameters[x]['stage1values'] = Array(this.parameters[x].stage1Count).fill([]);
        this.parameters[x]['stage2values'] = Array(this.parameters[x].stage2Count).fill([]);
      } else {
        this.parameters[x]['stage1values'] = Array(this.parameters[x].stage1Count).fill(null);
        this.parameters[x]['stage2values'] = Array(this.parameters[x].stage2Count).fill(null);
      }
    }

    const encs = this.visit.encounters;
    for (let x = 0; x < encs.length; x++) {
      if (encs[x].display.includes('Stage')) {
        if (!localStorage.patientVisitProvider) localStorage.setItem('patientVisitProvider', JSON.stringify(encs[x].encounterProviders[0]));
        let indices = encs[x].encounterType.display.replace('Stage','').replace('Hour','').split('_').map((val)=> +val);
        // Get timing and initials
        if (indices[0] == 1 && indices[1] <= 12) {
          this.timeStage1[indices[1]-1] = encs[x].encounterDatetime;
          this.initialsStage1[indices[1]-1] = this.getInitials(encs[x].encounterProviders[0].provider.person.display);
          this.encuuid1[indices[1]-1] = encs[x].uuid;
        } else if (indices[0] == 2 && indices[1] <= 3) {
          this.timeStage2[indices[1]-1] = encs[x].encounterDatetime;
          this.initialsStage2[indices[1]-1] = this.getInitials(encs[x].encounterProviders[0].provider.person.display);
          this.encuuid2[indices[1]-1] = encs[x].uuid;
        } else {
          continue;
        }
        // Read observations
        if (encs[x].obs.length) {
          for (let y = 0; y < encs[x].obs.length; y++) {
            let parameterIndex = this.parameters.findIndex((o: any) => o.conceptName == encs[x].obs[y].concept.display);
            if (parameterIndex != -1) {
              let parameterValue = this.parameters.find((o: any) => o.conceptName == encs[x].obs[y].concept.display);
              let valueIndex = -1;
              if (indices[0] == 1) {
                (parameterValue.stage1Count == 12)? valueIndex = indices[1]-1 : valueIndex = ((2*(indices[1]-1))+(indices[2]-1));
              } else {
                if (parameterValue.stage2Count == 3) {
                  valueIndex = valueIndex = indices[1]-1;
                } else if(parameterValue.stage2Count == 6) {
                  valueIndex = (indices[2] == 1) ? ((2*(indices[1]-1))+(indices[2]-1)) : ((2*(indices[1]-1))+(indices[2]-2));
                } else {
                  valueIndex = ((4*(indices[1]-1))+(indices[2]-1));
                }
              }
              if (parameterIndex == 20) {
                this.parameters[parameterIndex][`stage${indices[0]}values`][valueIndex] = [...this.parameters[parameterIndex][`stage${indices[0]}values`][valueIndex] ,{ value: encs[x].obs[y].value, uuid: encs[x].obs[y].uuid }];
              } else {
                this.parameters[parameterIndex][`stage${indices[0]}values`][valueIndex] = (parameterValue.alert) ? { value: encs[x].obs[y].value, comment: encs[x].obs[y].comment, uuid: encs[x].obs[y].uuid } : { value: encs[x].obs[y].value, uuid: encs[x].obs[y].uuid };
              }
            }
          }
        }
      }
    }
    // console.log(this.parameters);
    // console.log(this.timeStage1, this.timeStage2);
    // console.log(this.initialsStage1, this.initialsStage2);

    this.getAssessments();
  }

  getAssessments() {
    this.assessments = [];
    for (let d = 0; d < 12; d++) {
      if (this.parameters[20].stage1values[d].length||this.parameters[22].stage1values[d]||this.parameters[23].stage1values[d]) {
        this.assessments.push({
          time: this.timeStage1[d],
          stage: 1,
          medicine: this.parameters[20].stage1values[d],
          assessment: this.parameters[22].stage1values[d]?.value,
          plan: this.parameters[23].stage1values[d]?.value
        });
      }
    }

    for (let d = 0; d < 3; d++) {
      if (this.parameters[20].stage2values[d].length||this.parameters[22].stage2values[d]||this.parameters[23].stage2values[d]) {
        this.assessments.push({
          time: this.timeStage2[d],
          stage: 2,
          medicine: this.parameters[20].stage2values[d],
          assessment: this.parameters[22].stage2values[d]?.value,
          plan: this.parameters[23].stage2values[d]?.value
        });
      }
    }

    this.dataSource = new MatTableDataSource(this.assessments);
    this.dataSource.paginator = this.assessmentPaginator;
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

  addAssessmentAndPlan(stage: number, index: number) {
    this.coreService.openAddAssessmentAndPlanModal(null).subscribe(res => {
      if (res) {
        console.log(res);
        if (res.assessment) {
          this.encounterService.postObs({
            concept: this.conceptAssessment,
            person: this.visit.patient.uuid,
            obsDatetime: new Date(),
            value: res.assessment,
            encounter: (stage == 1) ? this.encuuid1[index] : this.encuuid2[index],
          }).subscribe((result: any) => {
            (stage == 1) ? this.parameters[22].stage1values[index] = { value: res.assessment, uuid: result.uuid } : this.parameters[22].stage2values[index] = { value: res.assessment, uuid: result.uuid };
          });
        }

        if (res.plan) {
          this.encounterService.postObs({
            concept: this.conceptPlan,
            person: this.visit.patient.uuid,
            obsDatetime: new Date(),
            value: res.plan,
            encounter: (stage == 1) ? this.encuuid1[index] : this.encuuid2[index],
          }).subscribe((result: any) => {
            (stage == 1) ? this.parameters[23].stage1values[index] = { value: res.plan, uuid: result.uuid } : this.parameters[23].stage2values[index] = { value: res.plan, uuid: result.uuid };
          });
        }

        if (res.medicines.length) {
          res.medicines.forEach((m: any) => {
            this.encounterService.postObs({
              concept: this.conceptMedicine,
              person: this.visit.patient.uuid,
              obsDatetime: new Date(),
              value: `${m.medicineName} | ${m.strength} | ${m.dosage} | ${m.duration} | ${m.typeOfMedicine} | ${m.routeOfMedicine}`,
              encounter: (stage == 1) ? this.encuuid1[index] : this.encuuid2[index],
            }).subscribe((result: any) => {
              (stage == 1) ? this.parameters[20].stage1values[index] = [...this.parameters[20].stage1values[index], { value: `${m.medicineName} | ${m.strength} | ${m.dosage} | ${m.duration} | ${m.typeOfMedicine} | ${m.routeOfMedicine}`, uuid: result.uuid }] : this.parameters[20].stage2values[index] = [...this.parameters[20].stage2values[index], { value: `${m.medicineName} | ${m.strength} | ${m.dosage} | ${m.duration} | ${m.typeOfMedicine} | ${m.routeOfMedicine}`, uuid: result.uuid }];
            });
          });
        }

        setTimeout(() => {
          this.getAssessments();
        }, 5000);
      }
    });
  }

  editAssessmentAndPlan(stage: number, index: number) {
    this.coreService.openAddAssessmentAndPlanModal({
      assessment: (stage == 1) ? this.parameters[22].stage1values[index].value : this.parameters[22].stage2values[index].value,
      plan: (stage == 1) ? this.parameters[23].stage1values[index].value : this.parameters[23].stage2values[index].value,
      medicines: (stage == 1) ? this.parameters[20].stage1values[index] : this.parameters[20].stage2values[index]
    }).subscribe(res => {
      if (res) {
        // console.log(res);
        if (res.assessment) {
          this.encounterService.updateObs((stage == 1) ? this.parameters[22].stage1values[index].uuid : this.parameters[22].stage2values[index].uuid, { value: res.assessment }).subscribe((result: any) => {
            (stage == 1) ? this.parameters[22].stage1values[index].value = res.assessment: this.parameters[22].stage2values[index].value = res.assessment;
          });
        } else {
          if (stage == 1) {
            if (this.parameters[22].stage1values[index].uuid) {
              this.encounterService.deleteObs(this.parameters[22].stage1values[index].uuid).subscribe((result: any) => {
                this.parameters[22].stage1values[index].value = null;
              });
            }
          } else {
            if (this.parameters[22].stage2values[index].uuid) {
              this.encounterService.deleteObs(this.parameters[22].stage2values[index].uuid).subscribe((result: any) => {
                this.parameters[22].stage2values[index].value = null;
              });
            }
          }
        }

        if (res.plan) {
          this.encounterService.updateObs((stage == 1) ? this.parameters[23].stage1values[index].uuid : this.parameters[23].stage2values[index].uuid, { value: res.plan }).subscribe((result: any) => {
            (stage == 1) ? this.parameters[23].stage1values[index].value = res.plan: this.parameters[23].stage2values[index].value = res.plan;
          });
        } else {
          if (stage == 1) {
            if (this.parameters[22].stage1values[index].uuid) {
              this.encounterService.deleteObs(this.parameters[22].stage1values[index].uuid).subscribe((result: any) => {
                this.parameters[22].stage1values[index].value = null;
              });
            }
          } else {
            if (this.parameters[22].stage2values[index].uuid) {
              this.encounterService.deleteObs(this.parameters[22].stage2values[index].uuid).subscribe((result: any) => {
                this.parameters[22].stage2values[index].value = null;
              });
            }
          }
        }

        if (res.medicines.length) {
          res.medicines.forEach((m: any) => {
            if (m.id) {
              if (m.isDeleted) {
                this.encounterService.deleteObs(m.id).subscribe((result: any) => {
                  // console.log(result);
                });
              } else {
                this.encounterService.updateObs(m.id, { value: `${m.medicineName} | ${m.strength} | ${m.dosage} | ${m.duration} | ${m.typeOfMedicine} | ${m.routeOfMedicine}` }).subscribe((result: any) => {
                  // console.log(result);
                });
              }
            } else {
              if (!m.isDeleted) {
                this.encounterService.postObs({
                  concept: this.conceptMedicine,
                  person: this.visit.patient.uuid,
                  obsDatetime: new Date(),
                  value: `${m.medicineName} | ${m.strength} | ${m.dosage} | ${m.duration} | ${m.typeOfMedicine} | ${m.routeOfMedicine}`,
                  encounter: (stage == 1) ? this.encuuid1[index] : this.encuuid2[index],
                }).subscribe((result: any) => {
                  // console.log(result);
                  m.id = result.uuid;
                  // (stage == 1) ? this.parameters[20].stage1values[index] = [...this.parameters[20].stage1values[index], { value: `${m.medicineName} | ${m.strength} | ${m.dosage} | ${m.duration} | ${m.typeOfMedicine} | ${m.routeOfMedicine}`, uuid: result.uuid }] : this.parameters[20].stage2values[index] = [...this.parameters[20].stage2values[index], { value: `${m.medicineName} | ${m.strength} | ${m.dosage} | ${m.duration} | ${m.typeOfMedicine} | ${m.routeOfMedicine}`, uuid: result.uuid }];
                });
              }
            }
          });
        }

        setTimeout(() => {
          let med = [];
          for (let x = 0; x < res.medicines.length; x++) {
            if (!res.medicines[x].isDeleted) {
              med.push({ uuid: res.medicines[x].id, value: `${res.medicines[x].medicineName} | ${res.medicines[x].strength} | ${res.medicines[x].dosage} | ${res.medicines[x].duration} | ${res.medicines[x].typeOfMedicine} | ${res.medicines[x].routeOfMedicine}` });
            }
          }
          // console.log(med);
          if (stage == 1) {
            this.parameters[20].stage1values[index] = [...med];
          } else {
            this.parameters[20].stage2values[index] = [...med];
          }
          this.getAssessments();
        }, 5000);
      }
    });
  }

  startCall() {
    if (this.dialogRef2) {
      this.dialogRef2.close();
      return;
    };
    this.dialogRef2 = this.coreService.openVideoCallModal({
      patientId: this.visit.patient.uuid,
      visitId: this.visit.uuid,
      connectToDrId: this.userId,
      patientName: this.patient.person.display,
      patientPersonUuid: this.patient.person.uuid,
      patientOpenMrsId: this.patient.identifiers[0].identifier,
      initiator: 'dr'
    });

    this.dialogRef2.afterClosed().subscribe((res: any) => {
      this.dialogRef2 = undefined;
    });
  }

  startChat() {
    if (this.dialogRef1) {
      this.dialogRef1.close();
      return;
    };
    this.dialogRef1 = this.coreService.openChatBoxModal({
      patientId: this.visit.patient.uuid,
      visitId: this.visit.uuid,
      patientName: this.patient.person.display,
      patientPersonUuid: this.patient.person.uuid,
      patientOpenMrsId: this.patient.identifiers[0].identifier
    });

    this.dialogRef1.afterClosed().subscribe((res: any) => {
      this.dialogRef1 = undefined;
    });
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

  get userId() {
    return JSON.parse(localStorage.user).uuid;
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

}
