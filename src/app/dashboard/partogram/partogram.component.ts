import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { MatAccordion } from '@angular/material/expansion';
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
      stage2Count: 20,
      alert: true
    },
    {
      id: 19,
      name: 'Oxytocin (U/L, drops/min)',
      conceptName: 'Oxytocin U/l, Drops per min',
      stage1Count: 30,
      stage2Count: 20,
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
      stage1Count: 30,
      stage2Count: 20,
      alert: false
    },
    {
      id: 22,
      name: 'ASSESSMENT',
      conceptName: 'Assessment',
      stage1Count: 30,
      stage2Count: 20,
      alert: false
    },
    {
      id: 23,
      name: 'PLAN',
      conceptName: 'Additional Comments',
      stage1Count: 30,
      stage2Count: 20,
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
  conceptPlan = '162169AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA';
  conceptAssessment = '67a050c1-35e5-451c-a4ab-fff9d57b0db1';
  conceptMedicine = 'c38c0c50-2fd2-4ae3-b7ba-7dd25adca4ca';
  conceptMedicinePrescribed = 'ce75ed49-0eac-44f0-ac91-bcf9c5d1d700';
  conceptOxytocinPrescribed = '6eef8ae6-e6b3-46f1-a58c-393bd6d0e8c8';
  conceptIvFluidsPrescribed = '0c21f925-d225-48ce-9e98-bb1cc5638e04';
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
  stage: number = 0;
  assessmentHistory: any[] = [];
  planHistory: any[] = [];
  medicationPrescribedHistory: any[] = [];
  oxytocinPrescribedHistory: any[] = [];
  ivPrescribedHistory: any[] = [];
  showAll = false;
  @ViewChild(MatAccordion) accordion: MatAccordion;
  openChatFlag: boolean = false;

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
  ) {
    this.openChatFlag = this.router.getCurrentNavigation()?.extras?.state?.openChat;
  }

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
    for (let x = 0; x < this.parameters.length; x++) {
      if (x == 20 || x == 22 || x == 23 || x == 26 || x == 27 || x == 28) {
        this.parameters[x]['stage1values'] = Array(this.parameters[x].stage1Count).fill([]);
        this.parameters[x]['stage2values'] = Array(this.parameters[x].stage2Count).fill([]);
      } else {
        this.parameters[x]['stage1values'] = Array(this.parameters[x].stage1Count).fill(null);
        this.parameters[x]['stage2values'] = Array(this.parameters[x].stage2Count).fill(null);
      }
    }
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
        this.checkOpenChatBoxFlag();
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
          this.visitService.updateAttribute(this.visit.uuid, visitSeenBy?.uuid, json).subscribe(r => { });
        }
      } else {
        const json = {
          attributeType: '2e4b62a5-aa71-43e2-abc9-f4a777697b19',
          value: this.userId.split('-')[0]
        }
        this.visitService.postAttribute(this.visit.uuid, json).subscribe(r => { });
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
        if (this.birthOutcome == 'Other' || this.birthOutcome == 'OTHER') {
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
        saveToStorage('patientVisitProvider', enc.encounterProviders[0])
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
                  this.parameters[parameterIndex][`stage${stageNo}values`][valueIndex] = [...this.parameters[parameterIndex][`stage${stageNo}values`][valueIndex], { value: ob.value, uuid: ob.uuid, creator: ob.creator, obsDatetime: ob.obsDatetime, canEdit: this.canEdit(ob.creator?.uuid), initial: this.getInitials(ob.creator?.person.display) }];
                  break;
                case 27:
                case 28:
                  this.parameters[parameterIndex][`stage${stageNo}values`][valueIndex] = [...this.parameters[parameterIndex][`stage${stageNo}values`][valueIndex], { value: ob.value.startsWith("{") ? JSON.parse(ob.value) : ob.value, uuid: ob.uuid, creator: ob.creator, obsDatetime: ob.obsDatetime, canEdit: this.canEdit(ob.creator?.uuid), initial: this.getInitials(ob.creator?.person.display) }];
                  break;
                case 19:
                case 21:
                  // this.parameters[parameterIndex][`stage${stageNo}values`][valueIndex] = [...this.parameters[parameterIndex][`stage${stageNo}values`][valueIndex], { value: ob.value.startsWith("{") ? JSON.parse(ob.value) : ob.value, uuid: ob.uuid, creator: ob.creator, obsDatetime: ob.obsDatetime, canEdit: this.canEdit(ob.creator?.uuid), initial: this.getInitials(ob.creator?.person.display) }];
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

  canEdit(uuid: string): boolean {
    return this.userId == uuid;
  }

  getLatestEncounterUuid() {
    if (this.stage == 1) {
      const index = this.encuuid1Full.indexOf(null)
      return (index == -1 ? this.encuuid1Full[29] : this.encuuid1Full[index - 1]);
    } else {
      const index = this.encuuid2Full.indexOf(null)
      return (index == -1 ? this.encuuid2Full[19] : this.encuuid2Full[index - 1]);
    }
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

  checkOpenChatBoxFlag() {
    const openChat: string = this.route.snapshot.queryParamMap.get('openChat');
    if (openChat === 'true') {
      setTimeout(() => {
        this.startChat();
      }, 1000);
    }
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
    const currentEnc = this.getLatestEncounterUuid();
    let currentEncData = [];
    if (currentEnc?.stageNo == 1) {
      currentEncData = this.parameters[index].stage1values[((2 * (currentEnc?.stageHourNo - 1)) + (currentEnc?.stageHourSecNo - 1))].sort((a, b) => new Date(b.obsDatetime).getTime() - new Date(a.obsDatetime).getTime());
    } else {
      currentEncData = this.parameters[index].stage2values[((4 * (currentEnc?.stageHourNo - 1)) + (currentEnc?.stageHourSecNo - 1))].sort((a, b) => new Date(b.obsDatetime).getTime() - new Date(a.obsDatetime).getTime());
    }
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

    return { historyData: [...historyData], currentEncData: [...currentEncData] };
  }

  prescribeMedication() {
    this.coreService.openPrescribeMedicationModal(this.getPastData(26)).subscribe(res => {
      if (res?.medicines?.length) {
        const currentEnc = this.getLatestEncounterUuid();
        res.medicines.forEach((m: any) => {
          if (m.id) {
            if (m.isDeleted) {
              this.encounterService.deleteObs(m.id).subscribe((result: any) => {
                const index =  (currentEnc?.stageNo == 1) ? this.parameters[26].stage1values[((2 * (currentEnc?.stageHourNo - 1)) + (currentEnc?.stageHourSecNo - 1))].findIndex(o => o.uuid == m.id) : this.parameters[26].stage2values[((4 * (currentEnc?.stageHourNo - 1)) + (currentEnc?.stageHourSecNo - 1))].findIndex(o => o.uuid == m.id);
                (currentEnc?.stageNo == 1) ? this.parameters[26].stage1values[((2 * (currentEnc?.stageHourNo - 1)) + (currentEnc?.stageHourSecNo - 1))].splice(index, 1) : this.parameters[26].stage2values[((4 * (currentEnc?.stageHourNo - 1)) + (currentEnc?.stageHourSecNo - 1))].splice(index, 1);
              });
            } else {
              this.encounterService.updateObs(m.id, { value: `${m.typeOfMedicine} | ${m.medicineName} | ${m.strength} | ${m.dosage}::${m.dosageUnit} | ${m.frequency} | ${m.routeOfMedicine} | ${m.duration}::${m.durationUnit}${m.remark ? ' | ' + m.remark : ''}` }).subscribe((result: any) => {
                const index =  (currentEnc?.stageNo == 1) ? this.parameters[26].stage1values[((2 * (currentEnc?.stageHourNo - 1)) + (currentEnc?.stageHourSecNo - 1))].findIndex(o => o.uuid == m.id) : this.parameters[26].stage2values[((4 * (currentEnc?.stageHourNo - 1)) + (currentEnc?.stageHourSecNo - 1))].findIndex(o => o.uuid == m.id);
                (currentEnc?.stageNo == 1) ? this.parameters[26].stage1values[((2 * (currentEnc?.stageHourNo - 1)) + (currentEnc?.stageHourSecNo - 1))][index].value =  result.value : this.parameters[26].stage2values[((4 * (currentEnc?.stageHourNo - 1)) + (currentEnc?.stageHourSecNo - 1))][index].value = result.value;
              });
            }
          } else if (!m.isDeleted) {
            this.encounterService.postObs({
              concept: this.conceptMedicinePrescribed,
              person: this.visit.patient.uuid,
              obsDatetime: new Date(),
              value: `${m.typeOfMedicine} | ${m.medicineName} | ${m.strength} | ${m.dosage}::${m.dosageUnit} | ${m.frequency} | ${m.routeOfMedicine} | ${m.duration}::${m.durationUnit}${m.remark ? ' | ' + m.remark : ''}`,
              encounter: currentEnc?.enc_uuid,
            }).subscribe((result: any) => {
              (currentEnc?.stageNo == 1) ? this.parameters[26].stage1values[((2 * (currentEnc?.stageHourNo - 1)) + (currentEnc?.stageHourSecNo - 1))] = [...this.parameters[26].stage1values[((2 * (currentEnc?.stageHourNo - 1)) + (currentEnc?.stageHourSecNo - 1))], { value: result.value, uuid: result.uuid, creator: { uuid: this.userId, person: this.user.person }, obsDatetime: result.obsDatetime, canEdit: true, initial: this.getInitials(this.user.person.display) }] : this.parameters[26].stage2values[((4 * (currentEnc?.stageHourNo - 1)) + (currentEnc?.stageHourSecNo - 1))] = [...this.parameters[26].stage2values[((4 * (currentEnc?.stageHourNo - 1)) + (currentEnc?.stageHourSecNo - 1))], { value: result.value, uuid: result.uuid, creator: { uuid: this.userId, person: this.user.person }, obsDatetime: result.obsDatetime, canEdit: true, initial: this.getInitials(this.user.person.display) }];
            });
          }
        });

        setTimeout(() => {
          this.getPastData(26);
        }, 5000);
      }
    });
  }

  prescribePlan() {
    this.coreService.openPrescribePlanModal(this.getPastData(23)).subscribe(res => {
      if (res?.plan?.length) {
        const currentEnc = this.getLatestEncounterUuid();
        res.plan.forEach((p: any) => {
          if (p.id) {
            if (p.isDeleted) {
              this.encounterService.deleteObs(p.id).subscribe((result: any) => {
                const index =  (currentEnc?.stageNo == 1) ? this.parameters[23].stage1values[((2 * (currentEnc?.stageHourNo - 1)) + (currentEnc?.stageHourSecNo - 1))].findIndex(o => o.uuid == p.id) : this.parameters[23].stage2values[((4 * (currentEnc?.stageHourNo - 1)) + (currentEnc?.stageHourSecNo - 1))].findIndex(o => o.uuid == p.id);
                (currentEnc?.stageNo == 1) ? this.parameters[23].stage1values[((2 * (currentEnc?.stageHourNo - 1)) + (currentEnc?.stageHourSecNo - 1))].splice(index, 1) : this.parameters[23].stage2values[((4 * (currentEnc?.stageHourNo - 1)) + (currentEnc?.stageHourSecNo - 1))].splice(index, 1);
              });
            } else {
              this.encounterService.updateObs(p.id, { value: p.planValue }).subscribe((result: any) => {
                const index =  (currentEnc?.stageNo == 1) ? this.parameters[23].stage1values[((2 * (currentEnc?.stageHourNo - 1)) + (currentEnc?.stageHourSecNo - 1))].findIndex(o => o.uuid == p.id) : this.parameters[23].stage2values[((4 * (currentEnc?.stageHourNo - 1)) + (currentEnc?.stageHourSecNo - 1))].findIndex(o => o.uuid == p.id);
                (currentEnc?.stageNo == 1) ? this.parameters[23].stage1values[((2 * (currentEnc?.stageHourNo - 1)) + (currentEnc?.stageHourSecNo - 1))][index].value =  result.value : this.parameters[23].stage2values[((4 * (currentEnc?.stageHourNo - 1)) + (currentEnc?.stageHourSecNo - 1))][index].value = result.value;
              });
            }
          } else if (!p.isDeleted) {
            this.encounterService.postObs({
              concept: this.conceptPlan,
              person: this.visit.patient.uuid,
              obsDatetime: new Date(),
              value: p.planValue,
              encounter: currentEnc?.enc_uuid,
            }).subscribe((result: any) => {
              (currentEnc?.stageNo == 1) ? this.parameters[23].stage1values[((2 * (currentEnc?.stageHourNo - 1)) + (currentEnc?.stageHourSecNo - 1))] = [...this.parameters[23].stage1values[((2 * (currentEnc?.stageHourNo - 1)) + (currentEnc?.stageHourSecNo - 1))], { value: p.planValue, uuid: result.uuid, creator: { uuid: this.userId, person: this.user.person }, obsDatetime: result.obsDatetime, canEdit: true, initial: this.getInitials(this.user.person.display) }] : this.parameters[23].stage2values[((4 * (currentEnc?.stageHourNo - 1)) + (currentEnc?.stageHourSecNo - 1))] = [...this.parameters[23].stage2values[((4 * (currentEnc?.stageHourNo - 1)) + (currentEnc?.stageHourSecNo - 1))], { value: p.planValue, uuid: result.uuid, creator: { uuid: this.userId, person: this.user.person }, obsDatetime: result.obsDatetime, canEdit: true, initial: this.getInitials(this.user.person.display) }];
            });
          }
        });

        setTimeout(() => {
          this.getPastData(23);
        }, 5000);
      }
    });
  }

  prescribeOxytocin() {
    this.coreService.openPrescribeOxytocinModal(this.getPastData(27)).subscribe(res => {
      if (res?.oxytocin?.length) {
        const currentEnc = this.getLatestEncounterUuid();
        res.oxytocin.forEach((oxy: any) => {
          if (oxy.id) {
            if (oxy.isDeleted) {
              this.encounterService.deleteObs(oxy.id).subscribe((result: any) => {
                const index =  (currentEnc?.stageNo == 1) ? this.parameters[27].stage1values[((2 * (currentEnc?.stageHourNo - 1)) + (currentEnc?.stageHourSecNo - 1))].findIndex(o => o.uuid == oxy.id) : this.parameters[27].stage2values[((4 * (currentEnc?.stageHourNo - 1)) + (currentEnc?.stageHourSecNo - 1))].findIndex(o => o.uuid == oxy.id);
                (currentEnc?.stageNo == 1) ? this.parameters[27].stage1values[((2 * (currentEnc?.stageHourNo - 1)) + (currentEnc?.stageHourSecNo - 1))].splice(index, 1) : this.parameters[27].stage2values[((4 * (currentEnc?.stageHourNo - 1)) + (currentEnc?.stageHourSecNo - 1))].splice(index, 1);
              });
            } else {
              this.encounterService.updateObs(oxy.id, { value: JSON.stringify({ strength: oxy.strength, infusionRate: oxy.infusionRate, infusionStatus: oxy.infusionStatus }) }).subscribe((result: any) => {
                const index =  (currentEnc?.stageNo == 1) ? this.parameters[27].stage1values[((2 * (currentEnc?.stageHourNo - 1)) + (currentEnc?.stageHourSecNo - 1))].findIndex(o => o.uuid == oxy.id) : this.parameters[27].stage2values[((4 * (currentEnc?.stageHourNo - 1)) + (currentEnc?.stageHourSecNo - 1))].findIndex(o => o.uuid == oxy.id);
                (currentEnc?.stageNo == 1) ? this.parameters[27].stage1values[((2 * (currentEnc?.stageHourNo - 1)) + (currentEnc?.stageHourSecNo - 1))][index].value =  JSON.parse(result.value) : this.parameters[27].stage2values[((4 * (currentEnc?.stageHourNo - 1)) + (currentEnc?.stageHourSecNo - 1))][index].value = JSON.parse(result.value);
              });
            }
          } else if (!oxy.isDeleted) {
            this.encounterService.postObs({
              concept: this.conceptOxytocinPrescribed,
              person: this.visit.patient.uuid,
              obsDatetime: new Date(),
              value: JSON.stringify({ strength: oxy.strength, infusionRate: oxy.infusionRate, infusionStatus: oxy.infusionStatus }),
              encounter: currentEnc?.enc_uuid,
            }).subscribe((result: any) => {
              (currentEnc?.stageNo == 1) ? this.parameters[27].stage1values[((2 * (currentEnc?.stageHourNo - 1)) + (currentEnc?.stageHourSecNo - 1))] = [...this.parameters[27].stage1values[((2 * (currentEnc?.stageHourNo - 1)) + (currentEnc?.stageHourSecNo - 1))], { value: JSON.parse(result.value), uuid: result.uuid, creator: { uuid: this.userId, person: this.user.person }, obsDatetime: result.obsDatetime, canEdit: true, initial: this.getInitials(this.user.person.display) }] : this.parameters[27].stage2values[((4 * (currentEnc?.stageHourNo - 1)) + (currentEnc?.stageHourSecNo - 1))] = [...this.parameters[27].stage2values[((4 * (currentEnc?.stageHourNo - 1)) + (currentEnc?.stageHourSecNo - 1))], { value: JSON.parse(result.value), uuid: result.uuid, creator: { uuid: this.userId, person: this.user.person }, obsDatetime: result.obsDatetime, canEdit: true, initial: this.getInitials(this.user.person.display) }];
            });
          }
        });

        setTimeout(() => {
          this.getPastData(27);
        }, 5000);
      }
    });
  }

  prescribeIvFluid() {
    this.coreService.openPrescribeIVFluidModal(this.getPastData(28)).subscribe(res => {
      if (res?.iv?.length) {
        const currentEnc = this.getLatestEncounterUuid();
        res.iv.forEach((i: any) => {
          if (i.id) {
            if (i.isDeleted) {
              this.encounterService.deleteObs(i.id).subscribe((result: any) => {
                const index =  (currentEnc?.stageNo == 1) ? this.parameters[28].stage1values[((2 * (currentEnc?.stageHourNo - 1)) + (currentEnc?.stageHourSecNo - 1))].findIndex(o => o.uuid == i.id) : this.parameters[28].stage2values[((4 * (currentEnc?.stageHourNo - 1)) + (currentEnc?.stageHourSecNo - 1))].findIndex(o => o.uuid == i.id);
                (currentEnc?.stageNo == 1) ? this.parameters[28].stage1values[((2 * (currentEnc?.stageHourNo - 1)) + (currentEnc?.stageHourSecNo - 1))].splice(index, 1) : this.parameters[28].stage2values[((4 * (currentEnc?.stageHourNo - 1)) + (currentEnc?.stageHourSecNo - 1))].splice(index, 1);
              });
            } else {
              this.encounterService.updateObs(i.id, { value: JSON.stringify({ type: i.type, otherType: i.otherType, infusionRate: i.infusionRate, infusionStatus: i.infusionStatus }) }).subscribe((result: any) => {
                const index =  (currentEnc?.stageNo == 1) ? this.parameters[28].stage1values[((2 * (currentEnc?.stageHourNo - 1)) + (currentEnc?.stageHourSecNo - 1))].findIndex(o => o.uuid == i.id) : this.parameters[28].stage2values[((4 * (currentEnc?.stageHourNo - 1)) + (currentEnc?.stageHourSecNo - 1))].findIndex(o => o.uuid == i.id);
                (currentEnc?.stageNo == 1) ? this.parameters[28].stage1values[((2 * (currentEnc?.stageHourNo - 1)) + (currentEnc?.stageHourSecNo - 1))][index].value =  JSON.parse(result.value) : this.parameters[28].stage2values[((4 * (currentEnc?.stageHourNo - 1)) + (currentEnc?.stageHourSecNo - 1))][index].value = JSON.parse(result.value);
              });
            }
          } else if (!i.isDeleted) {
            this.encounterService.postObs({
              concept: this.conceptIvFluidsPrescribed,
              person: this.visit.patient.uuid,
              obsDatetime: new Date(),
              value: JSON.stringify({ type: i.type, otherType: i.otherType, infusionRate: i.infusionRate, infusionStatus: i.infusionStatus }),
              encounter: currentEnc?.enc_uuid,
            }).subscribe((result: any) => {
              (currentEnc?.stageNo == 1) ? this.parameters[28].stage1values[((2 * (currentEnc?.stageHourNo - 1)) + (currentEnc?.stageHourSecNo - 1))] = [...this.parameters[28].stage1values[((2 * (currentEnc?.stageHourNo - 1)) + (currentEnc?.stageHourSecNo - 1))], { value: JSON.parse(result.value), uuid: result.uuid, creator: { uuid: this.userId, person: this.user.person }, obsDatetime: result.obsDatetime, canEdit: true, initial: this.getInitials(this.user.person.display) }] : this.parameters[28].stage2values[((4 * (currentEnc?.stageHourNo - 1)) + (currentEnc?.stageHourSecNo - 1))] = [...this.parameters[28].stage2values[((4 * (currentEnc?.stageHourNo - 1)) + (currentEnc?.stageHourSecNo - 1))], { value: JSON.parse(result.value), uuid: result.uuid, creator: { uuid: this.userId, person: this.user.person }, obsDatetime: result.obsDatetime, canEdit: true, initial: this.getInitials(this.user.person.display) }];
            });
          }
        });

        setTimeout(() => {
          this.getPastData(28);
        }, 5000);
      }
    });
  }

  addAssessment() {
    this.coreService.openAddAssessmentModal(this.getPastData(22)).subscribe(res => {
      if (res?.assessment?.length) {
        const currentEnc = this.getLatestEncounterUuid();
        res.assessment.forEach((a: any) => {
          if (a.id) {
            if (a.isDeleted) {
              this.encounterService.deleteObs(a.id).subscribe((result: any) => {
                const index =  (currentEnc?.stageNo == 1) ? this.parameters[22].stage1values[((2 * (currentEnc?.stageHourNo - 1)) + (currentEnc?.stageHourSecNo - 1))].findIndex(o => o.uuid == a.id) : this.parameters[22].stage2values[((4 * (currentEnc?.stageHourNo - 1)) + (currentEnc?.stageHourSecNo - 1))].findIndex(o => o.uuid == a.id);
                (currentEnc?.stageNo == 1) ? this.parameters[22].stage1values[((2 * (currentEnc?.stageHourNo - 1)) + (currentEnc?.stageHourSecNo - 1))].splice(index, 1) : this.parameters[22].stage2values[((4 * (currentEnc?.stageHourNo - 1)) + (currentEnc?.stageHourSecNo - 1))].splice(index, 1);
              });
            } else {
              this.encounterService.updateObs(a.id, { value: a.assessmentValue }).subscribe((result: any) => {
                const index =  (currentEnc?.stageNo == 1) ? this.parameters[22].stage1values[((2 * (currentEnc?.stageHourNo - 1)) + (currentEnc?.stageHourSecNo - 1))].findIndex(o => o.uuid == a.id) : this.parameters[22].stage2values[((4 * (currentEnc?.stageHourNo - 1)) + (currentEnc?.stageHourSecNo - 1))].findIndex(o => o.uuid == a.id);
                (currentEnc?.stageNo == 1) ? this.parameters[22].stage1values[((2 * (currentEnc?.stageHourNo - 1)) + (currentEnc?.stageHourSecNo - 1))][index].value =  result.value : this.parameters[22].stage2values[((4 * (currentEnc?.stageHourNo - 1)) + (currentEnc?.stageHourSecNo - 1))][index].value = result.value;
              });
            }
          } else if (!a.isDeleted) {
            this.encounterService.postObs({
              concept: this.conceptAssessment,
              person: this.visit.patient.uuid,
              obsDatetime: new Date(),
              value: a.assessmentValue,
              encounter: currentEnc?.enc_uuid,
            }).subscribe((result: any) => {
              (currentEnc?.stageNo == 1) ? this.parameters[22].stage1values[((2 * (currentEnc?.stageHourNo - 1)) + (currentEnc?.stageHourSecNo - 1))] = [...this.parameters[22].stage1values[((2 * (currentEnc?.stageHourNo - 1)) + (currentEnc?.stageHourSecNo - 1))], { value: a.assessmentValue, uuid: result.uuid, creator: { uuid: this.userId, person: this.user.person }, obsDatetime: result.obsDatetime, canEdit: true, initial: this.getInitials(this.user.person.display) }] : this.parameters[22].stage2values[((4 * (currentEnc?.stageHourNo - 1)) + (currentEnc?.stageHourSecNo - 1))] = [...this.parameters[22].stage2values[((4 * (currentEnc?.stageHourNo - 1)) + (currentEnc?.stageHourSecNo - 1))], { value: a.assessmentValue, uuid: result.uuid, creator: { uuid: this.userId, person: this.user.person }, obsDatetime: result.obsDatetime, canEdit: true, initial: this.getInitials(this.user.person.display) }];
            });
          }
        });

        setTimeout(() => {
          this.getPastData(22);
        }, 5000);
      }
    });
  }

}
