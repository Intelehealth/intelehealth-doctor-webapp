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
import { NepaliDateService } from 'src/app/core/services/nepali-date.service';
import { environment } from 'src/environments/environment';

const STAGE3_COL_LABELS = ['0 min', '+15m', '+30m', '+45m', '+1h 15m', '+1h 45m', '+2h 45m', '+3h 45m'];
const STAGE3_NUM_COLS = STAGE3_COL_LABELS.length;

interface EPartogramStage3Param {
  name: string;
  conceptName: string;
  isTextarea?: boolean;
  values: any[];
}

@Component({
  selector: 'app-epartogram',
  templateUrl: './epartogram.component.html',
  styleUrls: ['./epartogram.component.scss']
})
export class EpartogramComponent implements OnInit {
  isNepalClient =
    environment.client === 'nepal' ||
    globalThis?.location?.hostname?.toLowerCase().includes('nepal');

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
  hasStage3Data = false;
  stage3DeliveryOutcome = {
    deliveryDate: '-',
    deliveryTime: '-',
    deliveryMode: '-',
    placentaMembraneDelivery: '-',
    placentaDeliveryTime: '-',
    amtslMedication: '-',
    babyStatus: '-',
    babyGender: '-',
    babyWeight: '-',
    apgarScore: '-',
    resuscitation: '-',
    skinToSkin: '-',
    breastfeedingInOneHour: '-',
    placentaCordAbnormality: '-',
    perinealLaceration: '-',
    degreeOfTear: '-',
    congenitalDisorders: '-',
  };
  stage3ColLabels = STAGE3_COL_LABELS;
  stage3NumCols = STAGE3_NUM_COLS;
  stage3ColIndexes = Array.from({ length: STAGE3_NUM_COLS }, (_, i) => i);
  stage3ColTimes: (string | null)[] = new Array(STAGE3_NUM_COLS).fill(null);

  stage3MaternalParams: EPartogramStage3Param[] = [
    { name: 'Pulse',               conceptName: 'PULSE',             values: new Array(STAGE3_NUM_COLS).fill(null) },
    { name: 'BP',                  conceptName: 'Systolic BP',       values: new Array(STAGE3_NUM_COLS).fill(null) },
    { name: 'Respiratory Rate',    conceptName: 'Respiratory Rate',  values: new Array(STAGE3_NUM_COLS).fill(null) },
    { name: 'Temperature',         conceptName: 'TEMPERATURE (C)',   values: new Array(STAGE3_NUM_COLS).fill(null) },
    { name: 'Blood Loss',          conceptName: 'Blood Loss',        values: new Array(STAGE3_NUM_COLS).fill(null) },
    { name: 'Uterus Contracted',   conceptName: 'Uterus Contracted', values: new Array(STAGE3_NUM_COLS).fill(null) },
    { name: 'Urine Passed',        conceptName: 'Urine Passed',      values: new Array(STAGE3_NUM_COLS).fill(null) },
    { name: 'Hematoma',            conceptName: 'Hematoma',          values: new Array(STAGE3_NUM_COLS).fill(null) },
    { name: 'Complication',        conceptName: 'Complication',      values: new Array(STAGE3_NUM_COLS).fill(null) },
    { name: 'Assessment (Mother)', conceptName: 'Assessment Mother', isTextarea: true, values: new Array(STAGE3_NUM_COLS).fill(null).map(() => []) },
    { name: 'Plan (Mother)',       conceptName: 'Plan Mother',       isTextarea: true, values: new Array(STAGE3_NUM_COLS).fill(null).map(() => []) },
  ];

  stage3NewbornParams: EPartogramStage3Param[] = [
    { name: 'Grunting',              conceptName: 'Grunting',              values: new Array(STAGE3_NUM_COLS).fill(null) },
    { name: 'Chest Indrawing',       conceptName: 'Chest Indrawing',       values: new Array(STAGE3_NUM_COLS).fill(null) },
    { name: 'Fast Breathing',        conceptName: 'Fast Breathing',        values: new Array(STAGE3_NUM_COLS).fill(null) },
    { name: 'Feet Temperature',      conceptName: 'Feet Temperature',      values: new Array(STAGE3_NUM_COLS).fill(null) },
    { name: 'Skin Color',            conceptName: 'Skin Color',            values: new Array(STAGE3_NUM_COLS).fill(null) },
    { name: 'Umbilical Cord Oozing', conceptName: 'Umbilical Cord Oozing', values: new Array(STAGE3_NUM_COLS).fill(null) },
    { name: 'Sucking / Feeding',     conceptName: 'Sucking Feeding',       values: new Array(STAGE3_NUM_COLS).fill(null) },
    { name: 'Assessment (Newborn)',  conceptName: 'Assessment Newborn',    isTextarea: true, values: new Array(STAGE3_NUM_COLS).fill(null).map(() => []) },
    { name: 'Plan (Newborn)',        conceptName: 'Plan Newborn',          isTextarea: true, values: new Array(STAGE3_NUM_COLS).fill(null).map(() => []) },
  ];

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
  timeFullStage1: any[] = [];  
  timeFullStage2: any[] = [];  
  initialsStage1: string[] = Array(15).fill(null);
  initialsStage2: string[] = Array(5).fill(null);
  encuuid1: string[] = Array(15).fill(null);
  encuuid2: string[] = Array(5).fill(null);
  encuuid1Full: any[] = [];  
  encuuid2Full: any[] = [];  
  subColsPerHourStage1: number[] = Array(15).fill(2); 
  subColsPerHourStage2: number[] = Array(5).fill(4);   
  totalStage1Cols: number = 30;  
  totalStage2Cols: number = 20;  
  sosEncounterUUIDs: Set<string> = new Set();
  displayedColumns: string[] = ['timeAndStage', 'medicine', 'assessment', 'plan'];
  dataSource = new MatTableDataSource<any>();
  @ViewChild('assessmentPaginator') assessmentPaginator: MatPaginator;

  // Helper methods for template calculations
  getSubColArray(count: number): number[] {
    return Array(count).fill(0);
  }

  getFullIndexForStage1(hourIndex: number): number {
    if (hourIndex === 0) return 0;
    let sum = 0;
    for (let i = 0; i < hourIndex; i++) {
      sum += this.subColsPerHourStage1[i];
    }
    return sum;
  }

  getFullIndexForStage2(hourIndex: number): number {
    if (hourIndex === 0) return 0;
    let sum = 0;
    for (let i = 0; i < hourIndex; i++) {
      sum += this.subColsPerHourStage2[i];
    }
    return sum;
  }

  getParameterValueAtIndex(paramIndex: number, stage: number, hourIndex: number, subColIndex: number): any {
    const fullIndex = stage === 1 
      ? this.getFullIndexForStage1(hourIndex) + subColIndex
      : this.getFullIndexForStage2(hourIndex) + subColIndex;
    
    const stageValues = stage === 1 
      ? this.parameters[paramIndex]?.stage1values 
      : this.parameters[paramIndex]?.stage2values;
    
    return stageValues?.[fullIndex];
  }

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
    private coreService: CoreService,
    private nepaliDateService: NepaliDateService) { }

  formatDateByClient(dateValue: any): string {
    const adDate = this.parseIncomingDate(dateValue);
    if (!adDate) {
      return '';
    }

    if (!this.isNepalClient) {
      return moment(adDate).format('DD/MM/YYYY');
    }

    const bsDate = this.nepaliDateService.gregorianToBs(adDate);
    return bsDate ? this.nepaliDateService.formatBsDate(bsDate) : moment(adDate).format('DD/MM/YYYY');
  }

  private parseIncomingDate(dateValue: any): Date | null {
    if (!dateValue) {
      return null;
    }

    if (dateValue instanceof Date && !Number.isNaN(dateValue.getTime())) {
      return dateValue;
    }

    const formats = [
      moment.ISO_8601,
      'YYYY-MM-DDTHH:mm:ss.SSSZZ',
      'YYYY-MM-DDTHH:mm:ssZZ',
      'DD/MM/YYYY hh:mm A',
      'DD/MM/YYYY HH:mm',
      'DD/MM/YYYY'
    ];

    const parsed = moment(dateValue, formats as any, true);
    if (parsed.isValid()) {
      return parsed.toDate();
    }

    const fallback = new Date(dateValue);
    return Number.isNaN(fallback.getTime()) ? null : fallback;
  }

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
        this.readStage3Data();
      }
    });
  }

  private readStage3Data() {
    this.resetStage3Grid();
    const encounters = this.visit?.encounters || [];
    const deliveryOutcomeEncounter = encounters.find((encounter: any) => encounter.encounterType?.display === 'DELIVERY_OUTCOME_STAGE3');
    const stage3Encounters = encounters.filter((e: any) => /^Stage3_Hour\d+(?:_\d+)?$/.test(e.encounterType?.display));
    this.hasStage3Data = !!deliveryOutcomeEncounter || stage3Encounters.length > 0;
    if (!this.hasStage3Data) {
      return;
    }

    this.readStage3DeliveryOutcome(deliveryOutcomeEncounter);
    this.readStage3GridData(stage3Encounters);
  }

  private resetStage3Grid() {
    this.stage3ColTimes = new Array(STAGE3_NUM_COLS).fill(null);
    this.stage3MaternalParams.forEach((p: EPartogramStage3Param) => {
      p.values = p.isTextarea ? new Array(STAGE3_NUM_COLS).fill(null).map(() => []) : new Array(STAGE3_NUM_COLS).fill(null);
    });
    this.stage3NewbornParams.forEach((p: EPartogramStage3Param) => {
      p.values = p.isTextarea ? new Array(STAGE3_NUM_COLS).fill(null).map(() => []) : new Array(STAGE3_NUM_COLS).fill(null);
    });
  }

  private getObsValueByConcept(encounter: any, conceptDisplays: string[]): any {
    const obs = (encounter?.obs || []).find((item: any) => conceptDisplays.includes(item?.concept?.display));
    return obs?.value;
  }

  private toDisplayText(value: any): string {
    if (value === undefined || value === null || value === '') {
      return '-';
    }
    return String(value);
  }

  private formatTimeValue(value: any): string {
    if (value === undefined || value === null || value === '') {
      return '-';
    }
    const parsed = moment(value, [moment.ISO_8601, 'HH:mm', 'hh:mm A', 'hh:mm a'], true);
    if (!parsed.isValid()) {
      return this.toDisplayText(value);
    }
    return parsed.format('hh:mm A');
  }

  private formatAmtslMedication(value: any): string {
    if (value === undefined || value === null || value === '') {
      return '-';
    }
    let normalized = value;
    if (typeof normalized === 'string') {
      const raw = normalized.trim();
      if (raw.startsWith('{') || raw.startsWith('[')) {
        try {
          normalized = JSON.parse(raw);
        } catch {
          return raw;
        }
      }
    }
    if (Array.isArray(normalized)) {
      return normalized.map(String).filter(Boolean).join(', ');
    }
    if (typeof normalized === 'object') {
      return this.toDisplayText(normalized.MEDICATIONS_AMTSL || normalized.Medications_AMTSL || normalized['AMTSL Medication']);
    }
    return this.toDisplayText(normalized);
  }

  private formatCongenitalDisorders(value: any): string {
    if (value === undefined || value === null || value === '') {
      return '-';
    }
    let normalized = value;
    if (typeof normalized === 'string') {
      const raw = normalized.trim();
      if (raw.startsWith('{') || raw.startsWith('[')) {
        try {
          normalized = JSON.parse(raw);
        } catch {
          return raw;
        }
      }
    }
    if (Array.isArray(normalized)) {
      return normalized.map(String).filter(Boolean).join(', ');
    }
    if (typeof normalized === 'object') {
      const disorders: string[] = [];
      const congenitalArray = normalized.CONGENITAL_ANOMALY || normalized.congenital_anomaly || [];
      if (Array.isArray(congenitalArray)) {
        disorders.push(...congenitalArray.map(String).filter(Boolean));
      }
      if (normalized.other_text) {
        disorders.push(String(normalized.other_text));
      }
      return disorders.length ? disorders.join(', ') : '-';
    }
    return this.toDisplayText(normalized);
  }

  private readStage3DeliveryOutcome(sourceEncounter: any) {
    if (!sourceEncounter) {
      return;
    }

    const deliveryDateObs = this.getObsValueByConcept(sourceEncounter, ['Delivery Date', 'DATE OF DELIVERY', 'Birth Date', 'DELIVERY_DATE']);
    const deliveryTimeObs = this.getObsValueByConcept(sourceEncounter, ['Delivery Time', 'TIME OF DELIVERY', 'Birth Time', 'DELIVERY_TIME']);
    const fallbackDateTime = sourceEncounter?.encounterDatetime;
    const apgar1 = this.getObsValueByConcept(sourceEncounter, ['Apgar at 1 min']);
    const apgar5 = this.getObsValueByConcept(sourceEncounter, ['Apgar at 5 min']);

    this.stage3DeliveryOutcome.deliveryDate = this.formatDateByClient(deliveryDateObs || fallbackDateTime) || '-';
    this.stage3DeliveryOutcome.deliveryTime = this.formatTimeValue(deliveryTimeObs || fallbackDateTime);
    this.stage3DeliveryOutcome.deliveryMode = this.toDisplayText(this.getObsValueByConcept(sourceEncounter, ['Delivery Mode', 'Mode of Delivery', 'DELIVERY_MODE']));
    this.stage3DeliveryOutcome.placentaMembraneDelivery = this.toDisplayText(this.getObsValueByConcept(sourceEncounter, ['Placenta & Membrane Delivery', 'Placenta and Membrane Delivery', 'PLACENTA_MEMBRANE_STATUS']));
    this.stage3DeliveryOutcome.placentaDeliveryTime = this.formatTimeValue(this.getObsValueByConcept(sourceEncounter, ['Placenta Delivery Time', 'PLACENTA_DELIVERY_TIME']));
    this.stage3DeliveryOutcome.amtslMedication = this.formatAmtslMedication(this.getObsValueByConcept(sourceEncounter, ['AMTSL Medication', 'AMTSL', 'Medications_AMTSL']));
    this.stage3DeliveryOutcome.babyStatus = this.toDisplayText(this.getObsValueByConcept(sourceEncounter, ['Baby status', 'Baby Status', 'BIRTH_TYPE']));
    this.stage3DeliveryOutcome.babyGender = this.toDisplayText(this.getObsValueByConcept(sourceEncounter, ['Sex', 'Baby Gender']));
    this.stage3DeliveryOutcome.babyWeight = this.toDisplayText(this.getObsValueByConcept(sourceEncounter, ['BirthWeight', 'Baby Weight']));
    this.stage3DeliveryOutcome.apgarScore = (apgar1 || apgar5) ? `${this.toDisplayText(apgar1)}/${this.toDisplayText(apgar5)}` : '-';
    this.stage3DeliveryOutcome.resuscitation = this.toDisplayText(this.getObsValueByConcept(sourceEncounter, ['Resuscitation', 'RESUSCITATION']));
    this.stage3DeliveryOutcome.skinToSkin = this.toDisplayText(this.getObsValueByConcept(sourceEncounter, ['Skin-to-skin', 'Skin To Skin', 'Skin-to skin contact', 'Skin-to skin contact']));
    this.stage3DeliveryOutcome.breastfeedingInOneHour = this.toDisplayText(this.getObsValueByConcept(sourceEncounter, ['Breast-feeding in 1 hour', 'Breastfeeding in 1 hour', 'BREASTFED_FIRSTHOUR']));
    this.stage3DeliveryOutcome.placentaCordAbnormality = this.toDisplayText(this.getObsValueByConcept(sourceEncounter, ['Placenta or cord abnormality']));
    this.stage3DeliveryOutcome.perinealLaceration = this.toDisplayText(this.getObsValueByConcept(sourceEncounter, ['Perineal laceration during delivery']));
    this.stage3DeliveryOutcome.degreeOfTear = this.toDisplayText(this.getObsValueByConcept(sourceEncounter, ['DEGREE_OF_TEAR', 'Degree of tear']));
    this.stage3DeliveryOutcome.congenitalDisorders = this.formatCongenitalDisorders(this.getObsValueByConcept(sourceEncounter, ['CONGENITAL DISORDERS', 'Congenital Disorders']));
  }

  private stage3NormalizeConcept(value: any): string {
    return String(value || '').trim().toLowerCase().replace(/[^a-z0-9]/g, '');
  }

  private stage3GetParamAliases(section: 'maternal' | 'newborn', param: EPartogramStage3Param): string[] {
    const aliases: string[] = [param?.conceptName, param?.name];

    if (section === 'maternal') {
      if (param.name === 'BP') {
        aliases.push('Systolic BP', 'Diastolic BP');
      } else if (param.name === 'Respiratory Rate') {
        aliases.push('Respiratory rate');
      } else if (param.name === 'Blood Loss') {
        aliases.push('BLOOD_LOSS_MOTHER', 'Blood Loss Mother');
      } else if (param.name === 'Uterus Contracted') {
        aliases.push('UTERUS_CONTRACTED_MOTHER');
      } else if (param.name === 'Urine Passed') {
        aliases.push('URINE_PASSED_MOTHER');
      } else if (param.name === 'Hematoma') {
        aliases.push('HEMATOMA_MOTHER');
      } else if (param.name === 'Complication') {
        aliases.push('ONGOING_COMPLICATIONS_MOTHER', 'Complications Mother');
      } else if (param.name === 'Assessment (Mother)') {
        aliases.push('ASSESSMENT_MOTHER', 'Assessment Mother');
      } else if (param.name === 'Plan (Mother)') {
        aliases.push('PLAN_MOTHER', 'Plan Mother', 'Additional comments');
      }
    }

    if (section === 'newborn') {
      if (param.name === 'Grunting') {
        aliases.push('GRUNTING_NEWBORN');
      } else if (param.name === 'Chest Indrawing') {
        aliases.push('CHEST_INDRAWING_NEWBORN');
      } else if (param.name === 'Fast Breathing') {
        aliases.push('FAST_BREATHING_NEWBORN');
      } else if (param.name === 'Feet Temperature') {
        aliases.push('FEET_WARM_NEWBORN', 'Feet Warm Newborn');
      } else if (param.name === 'Skin Color') {
        aliases.push('SKIN_COLOR_NEWBORN');
      } else if (param.name === 'Umbilical Cord Oozing') {
        aliases.push('UC_OOZING_NEWBORN', 'Umbilical Cord Oozing Newborn');
      } else if (param.name === 'Sucking / Feeding') {
        aliases.push('SUCKING_FEEDING_NEWBORN', 'Sucking Feeding Newborn');
      } else if (param.name === 'Assessment (Newborn)') {
        aliases.push('ASSESSMENT_NEWBORN', 'Assessment Newborn');
      } else if (param.name === 'Plan (Newborn)') {
        aliases.push('PLAN_NEWBORN', 'Plan Newborn');
      }
    }

    return aliases
      .map((item: string) => this.stage3NormalizeConcept(item))
      .filter(Boolean);
  }

  private stage3MatchesParamObs(ob: any, param: EPartogramStage3Param, section: 'maternal' | 'newborn'): boolean {
    const obsDisplay = this.stage3NormalizeConcept(ob?.concept?.display);
    const aliases = this.stage3GetParamAliases(section, param);
    return aliases.includes(obsDisplay);
  }

  private readStage3GridData(stage3Encounters: any[]) {
    const encs = stage3Encounters
      .sort((a: any, b: any) => new Date(a.encounterDatetime).getTime() - new Date(b.encounterDatetime).getTime())
      .slice(0, STAGE3_NUM_COLS);

    for (const [encIndex, enc] of encs.entries()) {
      const colIndex = encIndex;
      this.stage3ColTimes[colIndex] = enc.encounterDatetime;

      for (const ob of (enc.obs || [])) {
        let idx = this.stage3MaternalParams.findIndex((param: EPartogramStage3Param) => this.stage3MatchesParamObs(ob, param, 'maternal'));
        if (idx >= 0) {
          const p = this.stage3MaternalParams[idx];
          if (p.isTextarea) {
            if (!Array.isArray(p.values[colIndex])) {
              p.values[colIndex] = [];
            }
            const displayName = ob.creator?.person?.display;
            const initial = displayName && displayName.includes(' ') ? this.getInitials(displayName) : '';
            p.values[colIndex] = [...p.values[colIndex], { value: ob.value, initial }];
          } else if (p.name === 'BP') {
            const concept = this.stage3NormalizeConcept(ob?.concept?.display);
            const current = p.values[colIndex]?.value ? String(p.values[colIndex].value) : '';
            const systolic = /systolicbp/.test(concept) ? String(ob.value) : (current.includes('/') ? current.split('/')[0] : current);
            const diastolic = /diastolicbp/.test(concept) ? String(ob.value) : (current.includes('/') ? current.split('/')[1] : '');
            const value = systolic && diastolic ? `${systolic}/${diastolic}` : (systolic || diastolic);
            p.values[colIndex] = { value };
          } else {
            p.values[colIndex] = { value: ob.value };
          }
          continue;
        }

        idx = this.stage3NewbornParams.findIndex((param: EPartogramStage3Param) => this.stage3MatchesParamObs(ob, param, 'newborn'));
        if (idx >= 0) {
          const p = this.stage3NewbornParams[idx];
          if (p.isTextarea) {
            if (!Array.isArray(p.values[colIndex])) {
              p.values[colIndex] = [];
            }
            const displayName = ob.creator?.person?.display;
            const initial = displayName && displayName.includes(' ') ? this.getInitials(displayName) : '';
            p.values[colIndex] = [...p.values[colIndex], { value: ob.value, initial }];
          } else {
            p.values[colIndex] = { value: ob.value };
          }
        }
      }
    }
  }

  readPatientAttributes() {
    for (let x = 0; x < this.patient?.attributes.length; x++) {
      this.pinfo[this.patient?.attributes[x]?.attributeType.display.replace(/ /g,'')] = this.patient?.attributes[x]?.value;
    }
    const lmpAttr = this.patient?.attributes?.find((a: any) => a.attributeType.display === 'Last Menstrual Period (LMP)');
    if (lmpAttr) { this.pinfo['LMP'] = lmpAttr.value; }
    const eddAttr = this.patient?.attributes?.find((a: any) => a.attributeType.display === 'Estimated Date of Delivery (EDD)');
    if (eddAttr) { this.pinfo['EDD'] = eddAttr.value; }
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
    
    this.sosEncounterUUIDs.clear();
    
    const maxSubColPerHour = new Map<string, number>();
    
    for (let hour = 1; hour <= 15; hour++) {
      maxSubColPerHour.set(`1_${hour}`, 2)
    }
    for (let hour = 1; hour <= 5; hour++) {
      maxSubColPerHour.set(`2_${hour}`, 4)
    }
    
    const encounterSubColMap = new Map<string, { stageNo: number, stageHourNo: number, stageHourSecNo: number }>();
    const sosEncounterMap = new Map<string, { stageNo: number, stageHourNo: number, stageHourSecNo: number }>();
    
    const nextSubColPerHour = new Map<string, number>();
    
    for (let hour = 1; hour <= 15; hour++) {
      nextSubColPerHour.set(`1_${hour}`, 1);
    }
    for (let hour = 1; hour <= 5; hour++) {
      nextSubColPerHour.set(`2_${hour}`, 1);
    }
    
    for (const enc of encs) {
      let stageNo: number, stageHourNo: number, stageHourSecNo: number;
      
      if (enc.encounterType.display === 'LCG_SOS') {
        const sosStageHourObs = enc.obs.find((o: any) => o.concept.display.toLowerCase() === 'sos_stage_hour');
        if (sosStageHourObs) {
          const sosValue = sosStageHourObs.value;
          const match = sosValue.match(/Stage(\d+)_Hour(\d+)_SOS(\d+)/);
          if (match) {
            stageNo = Number.parseInt(match[1]);
            stageHourNo = Number.parseInt(match[2]);
            const hourKey = `${stageNo}_${stageHourNo}`;
            
            stageHourSecNo = nextSubColPerHour.get(hourKey)!;
            nextSubColPerHour.set(hourKey, stageHourSecNo + 1);
            
            encounterSubColMap.set(enc.uuid, { stageNo, stageHourNo, stageHourSecNo });
            sosEncounterMap.set(enc.uuid, { stageNo, stageHourNo, stageHourSecNo });
            
            const currentMax = maxSubColPerHour.get(hourKey) || 0;
            if (stageHourSecNo > currentMax) {
              maxSubColPerHour.set(hourKey, stageHourSecNo);
            }
            
            this.sosEncounterUUIDs.add(enc.uuid);
          }
        }
      } else if (enc.display.includes('Stage')) {
        const indices = enc.encounterType.display.replace('Stage', '').replace('Hour', '').split('_').map((val: any) => +val);
        stageNo = indices[0];
        stageHourNo = indices[1];

        const hourKey = `${stageNo}_${stageHourNo}`;
        
        stageHourSecNo = nextSubColPerHour.get(hourKey)!;
        nextSubColPerHour.set(hourKey, stageHourSecNo + 1);
        
        encounterSubColMap.set(enc.uuid, { stageNo, stageHourNo, stageHourSecNo });
        
        const currentMax = maxSubColPerHour.get(hourKey) || 0;
        if (stageHourSecNo > currentMax) {
          maxSubColPerHour.set(hourKey, stageHourSecNo);
        }
      }
    }
    
    let totalStage1SubCols = 0;
    let totalStage2SubCols = 0;
    
    for (let hour = 1; hour <= 15; hour++) {
      const key = `1_${hour}`;
      const subCols = maxSubColPerHour.get(key); 
      this.subColsPerHourStage1[hour - 1] = subCols; 
      totalStage1SubCols += subCols;
    }
    
    for (let hour = 1; hour <= 5; hour++) {
      const key = `2_${hour}`;
      const subCols = maxSubColPerHour.get(key);  
      this.subColsPerHourStage2[hour - 1] = subCols; 
      totalStage2SubCols += subCols;
    }
    
    this.totalStage1Cols = totalStage1SubCols;
    this.totalStage2Cols = totalStage2SubCols;
    
    this.timeFullStage1 = Array(totalStage1SubCols).fill(null);
    this.timeFullStage2 = Array(totalStage2SubCols).fill(null);
    this.encuuid1Full = Array(totalStage1SubCols).fill(null);
    this.encuuid2Full = Array(totalStage2SubCols).fill(null);
    
    for (let x = 0; x < this.parameters.length; x++) {
      const stage1Count = this.parameters[x].stage1Count;
      const stage2Count = this.parameters[x].stage2Count;
      
      const actualStage1Size = totalStage1SubCols;
      const actualStage2Size = totalStage2SubCols;
      
      if (x == 20 || x == 22 || x == 23 || x == 26 || x == 27 || x == 28) {
        this.parameters[x]['stage1values'] = Array(actualStage1Size).fill([]);
        this.parameters[x]['stage2values'] = Array(actualStage2Size).fill([]);
      } else {
        this.parameters[x]['stage1values'] = Array(actualStage1Size).fill(null);
        this.parameters[x]['stage2values'] = Array(actualStage2Size).fill(null);
      }
    }
    
    const hourToIndexMap = new Map<string, number>();
    let currentIndexStage1 = 0;
    let currentIndexStage2 = 0;
    
    for (let hour = 1; hour <= 15; hour++) {
      const key = `1_${hour}`;
      hourToIndexMap.set(key, currentIndexStage1);
      const subCols = maxSubColPerHour.get(key); 
      currentIndexStage1 += subCols;
    }
    
    for (let hour = 1; hour <= 5; hour++) {
      const key = `2_${hour}`;
      hourToIndexMap.set(key, currentIndexStage2);
      const subCols = maxSubColPerHour.get(key);  
      currentIndexStage2 += subCols;
    }
    
    for (const enc of encs) {
      let stageNo: number, stageHourNo: number, stageHourSecNo: number;
      
      if (encounterSubColMap.has(enc.uuid)) {
        const encInfo = encounterSubColMap.get(enc.uuid);
        stageNo = encInfo.stageNo;
        stageHourNo = encInfo.stageHourNo;
        stageHourSecNo = encInfo.stageHourSecNo;
      } 
      else {
        continue;
      }
      
      if (enc.display.includes('Stage')) {
        // saveToStorage('patientVisitProvider', enc.encounterProviders[0]);
      }

      if (stageNo == 1 && stageHourNo <= 15) {
        if (stageNo > this.stage) this.stage = stageNo;
        if (!this.timeStage1[stageHourNo - 1]) this.timeStage1[stageHourNo - 1] = enc.encounterDatetime;
        
        const hourKey = `1_${stageHourNo}`;
        const hourStartIndex = hourToIndexMap.get(hourKey) || 0;
        const fullIndex = hourStartIndex + (stageHourSecNo - 1);
        
        this.timeFullStage1[fullIndex] = enc.encounterDatetime;
        this.encuuid1Full[fullIndex] = { enc_time: enc.encounterDatetime, enc_uuid: enc.uuid, stageNo, stageHourNo, stageHourSecNo };
        
        if (enc.display.includes('Stage')) {
          this.initialsStage1[stageHourNo - 1] = this.getInitials(enc.encounterProviders[0].provider.person.display);
          if (!this.encuuid1[stageHourNo - 1]) this.encuuid1[stageHourNo - 1] = enc.uuid;
        }

      } else if (stageNo == 2 && stageHourNo <= 5) {
        if (stageNo > this.stage) this.stage = stageNo;
        if (!this.timeStage2[stageHourNo - 1]) this.timeStage2[stageHourNo - 1] = enc.encounterDatetime;
        
        const hourKey = `2_${stageHourNo}`;
        const hourStartIndex = hourToIndexMap.get(hourKey) || 0;
        const fullIndex = hourStartIndex + (stageHourSecNo - 1);
        
        this.timeFullStage2[fullIndex] = enc.encounterDatetime;
        this.encuuid2Full[fullIndex] = { enc_time: enc.encounterDatetime, enc_uuid: enc.uuid, stageNo, stageHourNo, stageHourSecNo };
        
        if (enc.display.includes('Stage')) {
          this.initialsStage2[stageHourNo - 1] = this.getInitials(enc.encounterProviders[0].provider.person.display);
          if (!this.encuuid2[stageHourNo - 1]) this.encuuid2[stageHourNo - 1] = enc.uuid;
        }
      } else {
        continue;
      }

      const observations = enc.obs.sort((a: any, b: any) => new Date(a.obsDatetime).getTime() - new Date(b.obsDatetime).getTime());
      if (observations.length) {
        for (const ob of observations) {
          if (ob.concept.display.toLowerCase() === 'sos_stage_hour') {
            continue;
          }
          
          const parameterIndex = this.parameters.findIndex((o: any) => o.conceptName == ob.concept.display);
          if (parameterIndex != -1) {
            const parameterValue = this.parameters.find((o: any) => o.conceptName == ob.concept.display);
            let valueIndex = -1;
            
            if (stageNo == 1) {
              const hourKey = `1_${stageHourNo}`;
              const hourStartIndex = hourToIndexMap.get(hourKey) || 0;
              valueIndex = hourStartIndex + (stageHourSecNo - 1);
            } else {
              const hourKey = `2_${stageHourNo}`;
              const hourStartIndex = hourToIndexMap.get(hourKey) || 0;
              valueIndex = hourStartIndex + (stageHourSecNo - 1);
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
                this.parameters[parameterIndex][`stage${stageNo}values`][valueIndex] = { value: ob.value.startsWith("{") ? JSON.parse(ob.value) : ob.value, uuid: ob.uuid, creator: ob.creator, obsDatetime: ob.obsDatetime, initial: this.getInitials(ob.creator?.person.display) };
                break;
              default:
                this.parameters[parameterIndex][`stage${stageNo}values`][valueIndex] = (parameterValue.alert) ? { value: ob.value, comment: ob.comment, uuid: ob.uuid, creator: ob.creator } : { value: ob.value, uuid: ob.uuid, creator: ob.creator };
                break;
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
      const startIndex = this.getFullIndexForStage1(encounterNo);
      const subCols = this.subColsPerHourStage1[encounterNo];
      for (let j = 0; j < subCols; j++) {
        const data23 = this.parameters[23].stage1values[startIndex + j];
        const data26 = this.parameters[26].stage1values[startIndex + j];
        const data27 = this.parameters[27].stage1values[startIndex + j];
        const data28 = this.parameters[28].stage1values[startIndex + j];
        if (data23 && Array.isArray(data23)) planData = planData.concat(data23);
        if (data26 && Array.isArray(data26)) medicationData = medicationData.concat(data26);
        if (data27 && Array.isArray(data27)) oxytocinData = oxytocinData.concat(data27);
        if (data28 && Array.isArray(data28)) ivData = ivData.concat(data28);
      }
      planData.sort((a, b) => new Date(b.obsDatetime).getTime() - new Date(a.obsDatetime).getTime());
      medicationData.sort((a, b) => new Date(b.obsDatetime).getTime() - new Date(a.obsDatetime).getTime());
      oxytocinData.sort((a, b) => new Date(b.obsDatetime).getTime() - new Date(a.obsDatetime).getTime());
      ivData.sort((a, b) => new Date(b.obsDatetime).getTime() - new Date(a.obsDatetime).getTime());
    } else {
      const startIndex = this.getFullIndexForStage2(encounterNo);
      const subCols = this.subColsPerHourStage2[encounterNo];
      for (let j = 0; j < subCols; j++) {
        const data23 = this.parameters[23].stage2values[startIndex + j];
        const data26 = this.parameters[26].stage2values[startIndex + j];
        const data27 = this.parameters[27].stage2values[startIndex + j];
        const data28 = this.parameters[28].stage2values[startIndex + j];
        if (data23 && Array.isArray(data23)) planData = planData.concat(data23);
        if (data26 && Array.isArray(data26)) medicationData = medicationData.concat(data26);
        if (data27 && Array.isArray(data27)) oxytocinData = oxytocinData.concat(data27);
        if (data28 && Array.isArray(data28)) ivData = ivData.concat(data28);
      }
      planData.sort((a, b) => new Date(b.obsDatetime).getTime() - new Date(a.obsDatetime).getTime());
      medicationData.sort((a, b) => new Date(b.obsDatetime).getTime() - new Date(a.obsDatetime).getTime());
      oxytocinData.sort((a, b) => new Date(b.obsDatetime).getTime() - new Date(a.obsDatetime).getTime());
      ivData.sort((a, b) => new Date(b.obsDatetime).getTime() - new Date(a.obsDatetime).getTime());
    }
    return { stage: stageNo, hour: encounterNo + 1, planData: [...planData], medicationData: [...medicationData], oxytocinData: [...oxytocinData], ivData: [...ivData] };
  }

  getEncounterAssessmentData(stageNo: number, encounterNo: number) {
    let assessmentData = [];
    if (stageNo == 1) {
      const startIndex = this.getFullIndexForStage1(encounterNo);
      const subCols = this.subColsPerHourStage1[encounterNo];
      for (let j = 0; j < subCols; j++) {
        const data22 = this.parameters[22].stage1values[startIndex + j];
        if (data22 && Array.isArray(data22)) assessmentData = assessmentData.concat(data22);
      }
      assessmentData.sort((a, b) => new Date(b.obsDatetime).getTime() - new Date(a.obsDatetime).getTime());
    } else {
      const startIndex = this.getFullIndexForStage2(encounterNo);
      const subCols = this.subColsPerHourStage2[encounterNo];
      for (let j = 0; j < subCols; j++) {
        const data22 = this.parameters[22].stage2values[startIndex + j];
        if (data22 && Array.isArray(data22)) assessmentData = assessmentData.concat(data22);
      }
      assessmentData.sort((a, b) => new Date(b.obsDatetime).getTime() - new Date(a.obsDatetime).getTime());
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
        // Combine Medicine (index 20) with Medicine Prescribed (index 26)
        const medicineData = this.parameters[20].stage1values.reduce((acc, item) => {
          return acc.concat(item);
        }, []).concat(this.parameters[20].stage2values.reduce((acc, item) => {
          return acc.concat(item);
        }, []));
        this.medicationPrescribedHistory = [...historyData, ...medicineData].sort((a, b) => new Date(b.obsDatetime).getTime() - new Date(a.obsDatetime).getTime());
        break;
      case 27:
        // Combine Oxytocin (index 19) with Oxytocin Prescribed (index 27)
        const oxytocinData = this.parameters[19].stage1values.reduce((acc, item) => {
          return acc.concat(item);
        }, []).concat(this.parameters[19].stage2values.reduce((acc, item) => {
          return acc.concat(item);
        }, [])).filter(item => item && item.value !== 'NO'); // Filter out null/undefined and "NO" values
        this.oxytocinPrescribedHistory = [...historyData, ...oxytocinData].filter(item => item && item.value !== 'NO').sort((a, b) => new Date(b.obsDatetime).getTime() - new Date(a.obsDatetime).getTime());
        break;
      case 28:
        // Combine IV fluids (index 21) with IV fluids Prescribed (index 28)
        const ivFluidsData = this.parameters[21].stage1values.reduce((acc, item) => {
          return acc.concat(item);
        }, []).concat(this.parameters[21].stage2values.reduce((acc, item) => {
          return acc.concat(item);
        }, [])).filter(item => item && item.value !== 'NO'); // Filter out null/undefined and "NO" values
        this.ivPrescribedHistory = [...historyData, ...ivFluidsData].filter(item => item && item.value !== 'NO').sort((a, b) => new Date(b.obsDatetime).getTime() - new Date(a.obsDatetime).getTime());
        break;
      default:
        break;
    }
  }
}
