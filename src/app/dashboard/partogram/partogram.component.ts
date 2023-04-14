import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import * as moment from 'moment';
import { CoreService } from 'src/app/services/core/core.service';
import { VisitService } from 'src/app/services/visit.service';

@Component({
  selector: 'app-partogram',
  templateUrl: './partogram.component.html',
  styleUrls: ['./partogram.component.scss']
})
export class PartogramComponent implements OnInit {

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

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private visitService: VisitService,
    private coreService: CoreService
  ) { }

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    this.provider = JSON.parse(localStorage.getItem("provider"));
    setTimeout(()=> {
      this.ele = document.getElementsByClassName('table-responsive')[0];
      this.ele.scrollTop = 0;
      this.ele.scrollLeft = 0;
      this.ele.addEventListener('mousedown', this.mouseDownHandler.bind(this));
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
      this.parameters[x]['stage1values'] = Array(this.parameters[x].stage1Count).fill(null);
      this.parameters[x]['stage2values'] = Array(this.parameters[x].stage2Count).fill(null);
    }
    const encs = this.visit.encounters;
    for (let x = 0; x < encs.length; x++) {
      if (encs[x].display.includes('Stage')) {
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
                  valueIndex = ((2*(indices[1]-1))+(indices[2]-1));
                } else {
                  valueIndex = ((4*(indices[1]-1))+(indices[2]-1));
                }
              }
              this.parameters[parameterIndex][`stage${indices[0]}values`][valueIndex] = (parameterValue.alert) ? { value: encs[x].obs[y].value, comment: encs[x].obs[y].comment } : encs[x].obs[y].value;
            }
          }
        }
      }
    }
    // console.log(this.parameters);
    // console.log(this.timeStage1, this.timeStage2);
    // console.log(this.initialsStage1, this.initialsStage2);

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

  addAssessmentAndPlan() {
    this.coreService.openAddAssessmentAndPlanModal(null).subscribe(res => {
      if (res) {

      }
    });
  }

  startCall() {

  }

  startChat() {

  }

}