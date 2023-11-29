import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { ActivatedRoute, Router } from '@angular/router';
import * as moment from 'moment';
import { PanZoomAPI, PanZoomConfig } from 'ngx-panzoom';
import { ToastrService } from 'ngx-toastr';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { Subscription } from 'rxjs';
import { PageTitleService } from 'src/app/core/page-title/page-title.service';
import { ChatBoxComponent } from 'src/app/modal-components/chat-box/chat-box.component';
import { VideoCallComponent } from 'src/app/modal-components/video-call/video-call.component';
import { CoreService } from 'src/app/services/core/core.service';
import { EncounterService } from 'src/app/services/encounter.service';
import { SocketService } from 'src/app/services/socket.service';
import { VisitService } from 'src/app/services/visit.service';
import { WebrtcService } from 'src/app/services/webrtc.service';
declare const saveToStorage, getFromStorage;

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
      id: 0,
      name: 'Companion',
      conceptName: 'Companion',
      stage1Count: 15,
      stage2Count: 5,
      alert: true
    },
    {
      id: 1,
      name: 'Pain relief',
      conceptName: 'Pain relief',
      stage1Count: 15,
      stage2Count: 5,
      alert: true
    },
    {
      id: 2,
      name: 'Oral Fluid',
      conceptName: 'Oral Fluid',
      stage1Count: 15,
      stage2Count: 5,
      alert: true
    },
    {
      id: 3,
      name: 'Posture',
      conceptName: 'Posture',
      stage1Count: 15,
      stage2Count: 5,
      alert: true
    },
    {
      id: 4,
      name: 'Baseline FHR',
      conceptName: 'Baseline FHR',
      stage1Count: 30,
      stage2Count: 20,
      alert: true
    },
    {
      id: 5,
      name: 'FHR deceleration',
      conceptName: 'FHR Deceleration',
      stage1Count: 30,
      stage2Count: 20,
      alert: true
    },
    {
      id: 6,
      name: 'Amniotic fluid',
      conceptName: 'Amniotic fluid',
      stage1Count: 15,
      stage2Count: 10,
      alert: true
    },
    {
      id: 7,
      name: 'Fetal position',
      conceptName: 'Fetal position',
      stage1Count: 15,
      stage2Count: 10,
      alert: true
    },
    {
      id: 8,
      name: 'Caput',
      conceptName: 'Caput',
      stage1Count: 15,
      stage2Count: 10,
      alert: true
    },
    {
      id: 9,
      name: 'Moulding',
      conceptName: 'Moulding',
      stage1Count: 15,
      stage2Count: 10,
      alert: true
    },
    {
      id: 10,
      name: 'Pulse',
      conceptName: 'PULSE',
      stage1Count: 15,
      stage2Count: 10,
      alert: true
    },
    {
      id: 11,
      name: 'Systolic BP',
      conceptName: 'Systolic BP',
      stage1Count: 15,
      stage2Count: 10,
      alert: true
    },
    {
      id: 12,
      name: 'Diastolic BP',
      conceptName: 'Diastolic BP',
      stage1Count: 15,
      stage2Count: 10,
      alert: true
    },
    {
      id: 13,
      name: 'Temperature ℃',
      conceptName: 'TEMPERATURE (C)',
      stage1Count: 15,
      stage2Count: 10,
      alert: true
    },
    {
      id: 14,
      name: 'Urine protein',
      conceptName: 'Urine protein',
      stage1Count: 15,
      stage2Count: 10,
      alert: true
    },
    {
      id: 15,
      name: 'Contractions per 10 min',
      conceptName: 'Contractions per 10 min',
      stage1Count: 30,
      stage2Count: 20,
      alert: true
    },
    {
      id: 16,
      name: 'Duration of contractions',
      conceptName: 'Duration of contraction',
      stage1Count: 30,
      stage2Count: 20,
      alert: true
    },
    {
      id: 17,
      name: 'Cervix [Plot X]',
      conceptName: 'Cervix 0 cm, 1 cm, 2 cm, 3 cm, 4 cm, 5 cm',
      stage1Count: 15,
      stage2Count: 20,
      alert: true
    },
    {
      id: 18,
      name: 'Descent [Plot O]',
      conceptName: 'Descent 0-5',
      stage1Count: 15,
      stage2Count: 10,
      alert: true
    },
    {
      id: 19,
      name: 'Oxytocin (U/L, drops/min)',
      conceptName: 'Oxytocin U/l, Drops per min',
      stage1Count: 15,
      stage2Count: 5,
      alert: false
    },
    {
      id: 20,
      name: 'Medicine',
      conceptName: 'Medicine',
      stage1Count: 15,
      stage2Count: 5,
      alert: false
    },
    {
      id: 21,
      name: 'IV fluids',
      conceptName: 'IV fluids',
      stage1Count: 15,
      stage2Count: 5,
      alert: false
    },
    {
      id: 22,
      name: 'ASSESSMENT',
      conceptName: 'Assessment',
      stage1Count: 15,
      stage2Count: 5,
      alert: false
    },
    {
      id: 23,
      name: 'PLAN',
      conceptName: 'Additional Comments',
      stage1Count: 15,
      stage2Count: 5,
      alert: false
    },
    {
      id: 24,
      name: 'Encounter Status',
      conceptName: 'Encounter status',
      stage1Count: 15,
      stage2Count: 5,
      alert: false
    },
    {
      id: 25,
      name: 'Urine Acetone',
      conceptName: 'Urine acetone',
      stage1Count: 15,
      stage2Count: 10,
      alert: true
    }
  ];
  timeStage1: any[] = Array(15).fill(null);
  timeStage2: any[] = Array(5).fill(null);
  initialsStage1: string[] = Array(15).fill(null);
  initialsStage2: string[] = Array(5).fill(null);
  encuuid1: string[] = Array(15).fill(null);
  encuuid2: string[] = Array(5).fill(null);
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

  constructor(
    private pageTitleService: PageTitleService,
    private route: ActivatedRoute,
    private router: Router,
    private visitService: VisitService,
    private coreService: CoreService,
    private encounterService: EncounterService,
    private socketSvc: SocketService,
    private toastr: ToastrService,
    private webrtcSvc: WebrtcService,
    private ngxUiLoaderService: NgxUiLoaderService
  ) { }

  ngOnDestroy(): void {
    this.apiSubscription.unsubscribe();
    try {
      if (this.dialogRef1) {
        this.dialogRef1.close();
      };
    } catch (error) { }
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
    this.apiSubscription = this.panZoomConfig.api.subscribe((api: PanZoomAPI) => this.panZoomAPI = api);
    this.pageTitleService.setTitle({ title: '', imgUrl: '' });
    const id = this.route.snapshot.paramMap.get('id');
    this.provider = getFromStorage('provider');
    setTimeout(() => {
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
    this.ngxUiLoaderService.start();
    this.visitService.fetchVisitDetails(uuid).subscribe((visit: any) => {
      if (visit) {
        this.ngxUiLoaderService.stop();
        this.visit = visit;
        this.patient = visit?.patient;
        this.readPatientAttributes();
        this.readStageData();
        this.readVisitHolder();
        this.updateSeen();
      }
    }, (error: any) => {
      this.ngxUiLoaderService.stop();
      this.router.navigate(['/dashboard']);
    });
  }

  readVisitHolder() {
    if (Array.isArray(this.visit?.attributes)) {
      const visitHolder = this.visit.attributes.find(va => va?.attributeType?.display === 'Visit Holder');
      this.webrtcSvc.visitHolderId = visitHolder?.value;
    }
  }

  updateSeen() {
    if (Array.isArray(this.visit?.attributes)) {
      const visitSeenBy = this.visit.attributes.find(va => va?.attributeType?.display === 'Visit Read');
      if (visitSeenBy) {
        if (!visitSeenBy?.value.includes(this.userId.split('-')[0])) {
          const json = {
            attributeType: '2e4b62a5-aa71-43e2-abc9-f4a777697b19',
            value: visitSeenBy?.value.concat(`,${this.userId.split('-')[0]}`)
          }
          this.visitService.updateAttribute(this.visit.uuid, visitSeenBy?.uuid, json).subscribe(r => {
            // console.log(r);
          });
        }
      } else {
        const json = {
          attributeType: '2e4b62a5-aa71-43e2-abc9-f4a777697b19',
          value: this.userId.split('-')[0]
        }
        this.visitService.postAttribute(this.visit.uuid, json).subscribe(r => {
          // console.log(r);
        });
      }
    }
  }

  readPatientAttributes() {
    for (let x = 0; x < this.patient?.attributes.length; x++) {
      this.pinfo[this.patient?.attributes[x]?.attributeType.display.replace(/ /g, '')] = this.patient?.attributes[x]?.value;
    }
    if (this.pinfo['ActiveLaborDiagnosed']) {
      this.pinfo['ActiveLaborDiagnosed'] = moment(this.pinfo['ActiveLaborDiagnosed'], 'DD/MM/YYYY hh:mm A').toISOString();
    }
    if (this.pinfo['MembraneRupturedTimestamp']) {
      (this.pinfo['MembraneRupturedTimestamp'] == 'U') ? this.pinfo['MembraneRupturedTimestamp'] = 'U' : this.pinfo['MembraneRupturedTimestamp'] = moment(this.pinfo['MembraneRupturedTimestamp'], 'DD/MM/YYYY hh:mm A').toISOString();
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

      // visitCompleteEnc.obs.forEach((obs: any) => {
      //   if (obs.display.includes('Birth Outcome')) {
      //     this.birthOutcome = obs.value;
      //   }
      //   if (obs.display.includes('Refer to other Hospital')) {
      //     this.birthOutcome = 'RTOH';
      //   }
      //   if (obs.display.includes('Self discharge against Medical Advice')) {
      //     this.birthOutcome = 'DAMA';
      //   }
      //   this.birthtime = moment(visitCompleteEnc.encounterDatetime).format("HH:mm A");
      // });
    }

    // console.log(this.pinfo);
    // console.log(this.nurseMobNo);
    // console.log(this.birthOutcome);
    // console.log(this.birthtime);
  }

  readStageData() {
    for (let x = 0; x < this.parameters.length; x++) {
      if (x == 20 || x == 22 || x == 23) {
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
        saveToStorage('patientVisitProvider', encs[x].encounterProviders[0])
        let indices = encs[x].encounterType.display.replace('Stage', '').replace('Hour', '').split('_').map((val) => +val);
        // Get timing and initials
        if (indices[0] == 1 && indices[1] <= 15) {
          this.timeStage1[indices[1] - 1] = encs[x].encounterDatetime;
          this.initialsStage1[indices[1] - 1] = this.getInitials(encs[x].encounterProviders[0].provider.person.display);
          this.encuuid1[indices[1] - 1] = encs[x].uuid;
        } else if (indices[0] == 2 && indices[1] <= 5) {
          this.timeStage2[indices[1] - 1] = encs[x].encounterDatetime;
          this.initialsStage2[indices[1] - 1] = this.getInitials(encs[x].encounterProviders[0].provider.person.display);
          this.encuuid2[indices[1] - 1] = encs[x].uuid;
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
                (parameterValue.stage1Count == 15) ? valueIndex = indices[1] - 1 : valueIndex = ((2 * (indices[1] - 1)) + (indices[2] - 1));
              } else {
                if (parameterValue.stage2Count == 5) {
                  valueIndex = valueIndex = indices[1] - 1;
                } else if (parameterValue.stage2Count == 10) {
                  valueIndex = (indices[2] == 1) ? ((2 * (indices[1] - 1)) + (indices[2] - 1)) : ((2 * (indices[1] - 1)) + (indices[2] - 2));
                } else {
                  valueIndex = ((4 * (indices[1] - 1)) + (indices[2] - 1));
                }
              }
              if (parameterIndex == 20 || parameterIndex == 22 || parameterIndex == 23) {
                this.parameters[parameterIndex][`stage${indices[0]}values`][valueIndex] = [...this.parameters[parameterIndex][`stage${indices[0]}values`][valueIndex], { value: encs[x].obs[y].value, uuid: encs[x].obs[y].uuid, creator: encs[x].obs[y].creator, obsDatetime: encs[x].obs[y].obsDatetime, canEdit: this.userId == encs[x].obs[y].creator?.uuid ? true : false }];
              } else if (parameterIndex == 19 || parameterIndex == 21) {
                this.parameters[parameterIndex][`stage${indices[0]}values`][valueIndex] = { value: encs[x].obs[y].value.startsWith("{") ? JSON.parse(encs[x].obs[y].value) : encs[x].obs[y].value, uuid: encs[x].obs[y].uuid };
              } else {
                this.parameters[parameterIndex][`stage${indices[0]}values`][valueIndex] = (parameterValue.alert) ? { value: encs[x].obs[y].value, comment: encs[x].obs[y].comment, uuid: encs[x].obs[y].uuid, creator: encs[x].obs[y].creator } : { value: encs[x].obs[y].value, uuid: encs[x].obs[y].uuid, creator: encs[x].obs[y].creator };
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
    for (let d = 0; d < 15; d++) {
      if (this.parameters[20].stage1values[d].length || this.parameters[22].stage1values[d].length || this.parameters[23].stage1values[d].length) {
        this.assessments.push({
          time: this.timeStage1[d],
          stage: 1,
          medicine: this.parameters[20].stage1values[d],
          assessment: this.parameters[22].stage1values[d],
          plan: this.parameters[23].stage1values[d]
        });
      }
    }

    for (let d = 0; d < 5; d++) {
      if (this.parameters[20].stage2values[d].length || this.parameters[22].stage2values[d].length || this.parameters[23].stage2values[d].length) {
        this.assessments.push({
          time: this.timeStage2[d],
          stage: 2,
          medicine: this.parameters[20].stage2values[d],
          assessment: this.parameters[22].stage2values[d],
          plan: this.parameters[23].stage2values[d]
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
        if (res.assessment.length) {
          res.assessment.forEach((a: any) => {
            this.encounterService.postObs({
              concept: this.conceptAssessment,
              person: this.visit.patient.uuid,
              obsDatetime: new Date(),
              value: a.assessmentValue,
              encounter: (stage == 1) ? this.encuuid1[index] : this.encuuid2[index],
            }).subscribe((result: any) => {
              (stage == 1) ? this.parameters[22].stage1values[index] = [{ value: a.planValue, uuid: result.uuid, creator: { uuid: this.userId, person: this.user.person }, obsDatetime: result.obsDatetime }] : this.parameters[22].stage2values[index] = [{ value: a.planValue, uuid: result.uuid, creator: result.creator, obsDatetime: result.obsDatetime }];
            });
          });
        }

        if (res.plan.length) {
          res.plan.forEach((p: any) => {
            this.encounterService.postObs({
              concept: this.conceptPlan,
              person: this.visit.patient.uuid,
              obsDatetime: new Date(),
              value: p.planValue,
              encounter: (stage == 1) ? this.encuuid1[index] : this.encuuid2[index],
            }).subscribe((result: any) => {
              (stage == 1) ? this.parameters[23].stage1values[index] = [{ value: p.planValue, uuid: result.uuid, creator: { uuid: this.userId, person: this.user.person }, obsDatetime: result.obsDatetime }] : this.parameters[23].stage2values[index] = [{ value: p.planValue, uuid: result.uuid, creator: result.creator, obsDatetime: result.obsDatetime }];
            });
          });
        }

        if (res.medicines.length) {
          res.medicines.forEach((m: any) => {
            this.encounterService.postObs({
              concept: this.conceptMedicine,
              person: this.visit.patient.uuid,
              obsDatetime: new Date(),
              value: `${m.typeOfMedicine} | ${m.medicineName} | ${m.strength} | ${m.dosage}::${m.dosageUnit} | ${m.frequency} | ${m.routeOfMedicine} | ${m.duration}::${m.durationUnit}${m.remark ? ' | ' + m.remark : ''}`,
              encounter: (stage == 1) ? this.encuuid1[index] : this.encuuid2[index],
            }).subscribe((result: any) => {
              (stage == 1) ? this.parameters[20].stage1values[index] = [{ value: `${m.typeOfMedicine} | ${m.medicineName} | ${m.strength} | ${m.dosage}::${m.dosageUnit} | ${m.frequency} | ${m.routeOfMedicine} | ${m.duration}::${m.durationUnit}${m.remark ? ' | ' + m.remark : ''}`, uuid: result.uuid, creator: { uuid: this.userId, person: this.user.person }, obsDatetime: result.obsDatetime }] : this.parameters[20].stage2values[index] = [{ value: `${m.typeOfMedicine} | ${m.medicineName} | ${m.strength} | ${m.dosage}::${m.dosageUnit} | ${m.frequency} | ${m.routeOfMedicine} | ${m.duration}::${m.durationUnit}${m.remark ? ' | ' + m.remark : ''}`, uuid: result.uuid, creator: { uuid: this.userId, person: this.user.person }, obsDatetime: result.obsDatetime }];
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
      assessment: (stage == 1) ? this.parameters[22].stage1values[index] : this.parameters[22].stage2values[index],
      plan: (stage == 1) ? this.parameters[23].stage1values[index] : this.parameters[23].stage2values[index],
      medicines: (stage == 1) ? this.parameters[20].stage1values[index] : this.parameters[20].stage2values[index]
    }).subscribe(res => {
      if (res) {
        // console.log(res);

        if (res.assessment.length) {
          res.assessment.forEach((a: any) => {
            if (a.id) {
              if (a.isDeleted) {
                if (a.canEdit) {
                  this.encounterService.deleteObs(a.id).subscribe((result: any) => {
                    // console.log(result);
                  });
                }
              } else {
                if (a.canEdit) {
                  this.encounterService.updateObs(a.id, { value: a.assessmentValue }).subscribe((result: any) => {
                    // console.log(result);
                  });
                }
              }
            } else {
              if (!a.isDeleted) {
                this.encounterService.postObs({
                  concept: this.conceptAssessment,
                  person: this.visit.patient.uuid,
                  obsDatetime: new Date(),
                  value: a.assessmentValue,
                  encounter: (stage == 1) ? this.encuuid1[index] : this.encuuid2[index],
                }).subscribe((result: any) => {
                  a.id = result.uuid;
                  a.obsDatetime = result.obsDatetime;
                  a.creator = { uuid: this.userId, person: this.user.person };
                  (stage == 1) ? this.parameters[22].stage1values[index] = [...this.parameters[22].stage1values[index], { value: a.assessmentValue, uuid: result.uuid, creator: { uuid: this.userId, person: this.user.person }, obsDatetime: result.obsDatetime }] : this.parameters[22].stage2values[index] = [...this.parameters[22].stage2values[index], { value: a.assessmentValue, uuid: result.uuid, creator: { uuid: this.userId, person: this.user.person }, obsDatetime: result.obsDatetime }];
                });
              }
            }
          });
        }

        if (res.plan.length) {
          res.plan.forEach((p: any) => {
            if (p.id) {
              if (p.isDeleted) {
                if (p.canEdit) {
                  this.encounterService.deleteObs(p.id).subscribe((result: any) => {
                    // console.log(result);
                  });
                }
              } else {
                if (p.canEdit) {
                  this.encounterService.updateObs(p.id, { value: p.planValue }).subscribe((result: any) => {
                    // console.log(result);
                  });
                }
              }
            } else {
              if (!p.isDeleted) {
                this.encounterService.postObs({
                  concept: this.conceptPlan,
                  person: this.visit.patient.uuid,
                  obsDatetime: new Date(),
                  value: p.planValue,
                  encounter: (stage == 1) ? this.encuuid1[index] : this.encuuid2[index],
                }).subscribe((result: any) => {
                  p.id = result.uuid;
                  p.obsDatetime = result.obsDatetime;
                  p.creator = { uuid: this.userId, person: this.user.person };
                  (stage == 1) ? this.parameters[23].stage1values[index] = [...this.parameters[23].stage1values[index], { value: p.planValue, uuid: result.uuid, creator: { uuid: this.userId, person: this.user.person }, obsDatetime: result.obsDatetime }] : this.parameters[23].stage2values[index] = [...this.parameters[23].stage2values[index], { value: p.planValue, uuid: result.uuid, creator: { uuid: this.userId, person: this.user.person }, obsDatetime: result.obsDatetime }];
                });
              }
            }
          });
        }

        if (res.medicines.length) {
          res.medicines.forEach((m: any) => {
            if (m.id) {
              if (m.isDeleted) {
                if (m.canEdit) {
                  this.encounterService.deleteObs(m.id).subscribe((result: any) => {
                    // console.log(result);
                  });
                }
              } else {
                if (m.canEdit) {
                  this.encounterService.updateObs(m.id, { value: `${m.typeOfMedicine} | ${m.medicineName} | ${m.strength} | ${m.dosage}::${m.dosageUnit} | ${m.frequency} | ${m.routeOfMedicine} | ${m.duration}::${m.durationUnit}${m.remark ? ' | ' + m.remark : ''}` }).subscribe((result: any) => {
                    // console.log(result);
                  });
                }
              }
            } else {
              if (!m.isDeleted) {
                this.encounterService.postObs({
                  concept: this.conceptMedicine,
                  person: this.visit.patient.uuid,
                  obsDatetime: new Date(),
                  value: `${m.typeOfMedicine} | ${m.medicineName} | ${m.strength} | ${m.dosage}::${m.dosageUnit} | ${m.frequency} | ${m.routeOfMedicine} | ${m.duration}::${m.durationUnit}${m.remark ? ' | ' + m.remark : ''}`,
                  encounter: (stage == 1) ? this.encuuid1[index] : this.encuuid2[index],
                }).subscribe((result: any) => {
                  m.id = result.uuid;
                  m.obsDatetime = result.obsDatetime;
                  m.creator = { uuid: this.userId, person: this.user.person };
                  (stage == 1) ? this.parameters[20].stage1values[index] = [...this.parameters[20].stage1values[index], { value: `${m.typeOfMedicine} | ${m.medicineName} | ${m.strength} | ${m.dosage}::${m.dosageUnit} | ${m.frequency} | ${m.routeOfMedicine} | ${m.duration}::${m.durationUnit}${m.remark ? ' | ' + m.remark : ''}`, uuid: result.uuid, creator: { uuid: this.userId, person: this.user.person }, obsDatetime: result.obsDatetime, canEdit: m.canEdit }] : this.parameters[20].stage2values[index] = [...this.parameters[20].stage2values[index], { value: `${m.typeOfMedicine} | ${m.medicineName} | ${m.strength} | ${m.dosage}::${m.dosageUnit} | ${m.frequency} | ${m.routeOfMedicine} | ${m.duration}::${m.durationUnit}${m.remark ? ' | ' + m.remark : ''}`, uuid: result.uuid, creator: { uuid: this.userId, person: this.user.person }, obsDatetime: result.obsDatetime, canEdit: m.canEdit }];
                });
              }
            }
          });
        }

        setTimeout(() => {
          console.log(res);
          let plan = [];
          let assessment = [];
          let med = [];
          for (let x = 0; x < res.assessment.length; x++) {
            if (!res.assessment[x].isDeleted) {
              assessment.push({ uuid: res.assessment[x].id, value: res.assessment[x].assessmentValue, creator: res.assessment[x].creator, obsDatetime: res.assessment[x].obsDatetime, canEdit: res.assessment[x].canEdit });
            }
          }
          for (let x = 0; x < res.plan.length; x++) {
            if (!res.plan[x].isDeleted) {
              plan.push({ uuid: res.plan[x].id, value: res.plan[x].planValue, creator: res.plan[x].creator, obsDatetime: res.plan[x].obsDatetime, canEdit: res.plan[x].canEdit });
            }
          }
          for (let x = 0; x < res.medicines.length; x++) {
            if (!res.medicines[x].isDeleted) {
              med.push({ uuid: res.medicines[x].id, value: `${res.medicines[x].typeOfMedicine} | ${res.medicines[x].medicineName} | ${res.medicines[x].strength} | ${res.medicines[x].dosage}::${res.medicines[x].dosageUnit}  | ${res.medicines[x].frequency} | ${res.medicines[x].routeOfMedicine} | ${res.medicines[x].duration}::${res.medicines[x].durationUnit}${res.medicines[x].remark ? ' | '+res.medicines[x].remark: ''}`, creator: res.medicines[x].creator, obsDatetime: res.medicines[x].obsDatetime, canEdit: res.medicines[x].canEdit });
            }
          }
          // console.log(med);
          if (stage == 1) {
            this.parameters[22].stage1values[index] = [...assessment];
            this.parameters[23].stage1values[index] = [...plan];
            this.parameters[20].stage1values[index] = [...med];
          } else {
            this.parameters[22].stage2values[index] = [...assessment];
            this.parameters[23].stage1values[index] = [...plan];
            this.parameters[20].stage1values[index] = [...med];
          }
          this.getAssessments();
        }, 5000);
      }
    });
  }

  async startCall() {
    await this.webrtcSvc.updateVisitHolderId(this.visit.uuid);

    const nursePresent: any = this.socketSvc.activeUsers.find(u => u?.uuid === this.webrtcSvc.visitHolderId);
    if (!nursePresent) {
      this.toastr.error("Please try again later.", "Health Worker is not Online.");
      return;
    }

    if (nursePresent?.callStatus !== 'available') {
      this.toastr.error("Please try again later.", "Health Worker is busy on another call");
      return;
    }

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
    return getFromStorage('user')?.uuid
  }

  get user() {
    return getFromStorage('user')
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
