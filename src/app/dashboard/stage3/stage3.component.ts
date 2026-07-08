import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import * as moment from 'moment';
import { ToastrService } from 'ngx-toastr';
import { PageTitleService } from 'src/app/core/page-title/page-title.service';
import { NepaliDateService } from 'src/app/core/services/nepali-date.service';
import { CoreService } from 'src/app/services/core/core.service';
import { EncounterService } from 'src/app/services/encounter.service';
import { VisitService } from 'src/app/services/visit.service';
import { AuthService } from 'src/app/services/auth.service';
import { HelperService } from 'src/app/services/helper.service';
import { environment } from 'src/environments/environment';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';

declare const getFromStorage;

const COL_OFFSETS = [0, 15, 30, 45, 75, 105, 165, 225];
const COL_LABELS  = ['0 min', '+15m', '+30m', '+45m', '+1h 15m', '+1h 45m', '+2h 45m', '+3h 45m'];
const NUM_COLS = 8;

export interface S3Param {
  name: string;
  conceptName: string;
  isTextarea?: boolean;
  values: any[];
}

@Component({
  selector: 'app-stage3',
  templateUrl: './stage3.component.html',
  styleUrls: ['./stage3.component.scss']
})
export class Stage3Component implements OnInit {
  isNepalClient =
    environment.client === 'nepal' ||
    globalThis?.location?.hostname?.toLowerCase().includes('nepal');

  visit: any;
  patient: any;
  pinfo: any = {};
  loading = false;
  showViewElcg = false;

  deliveryOutcome = {
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

  colTimes: (string | null)[]    = [];
  colEncUuids: (string | null)[] = [];
  colIsSos: boolean[]            = [];
  colLabels: string[]            = [];
  colIndexes: number[]           = [];

  colOffsets = COL_OFFSETS;
  numCols    = NUM_COLS;

  // Replace placeholder UUIDs with real OpenMRS concept UUIDs for Nepal Stage3
  conceptAssessmentMother  = '67a050c1-35e5-451c-a4ab-fff9d57b0db1';
  conceptPlanMother        = '162169AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA';
  conceptAssessmentNewborn = '15fc4eca-7635-4e7c-baa4-20c250cfe62a';
  conceptPlanNewborn       = 'a79853d9-e45e-41b2-8473-b19e5cae66cb';

  maternalParams: S3Param[] = [
    { name: 'Pulse',               conceptName: 'PULSE',             values: new Array(NUM_COLS).fill(null) },
    { name: 'BP',                  conceptName: 'Systolic BP',        values: new Array(NUM_COLS).fill(null) },
    { name: 'Respiratory Rate',    conceptName: 'Respiratory Rate',   values: new Array(NUM_COLS).fill(null) },
    { name: 'Temprature °f',         conceptName: 'TEMPERATURE (C)',    values: new Array(NUM_COLS).fill(null) },
    { name: 'Blood Loss',          conceptName: 'Blood Loss',         values: new Array(NUM_COLS).fill(null) },
    { name: 'Uterus Contracted',   conceptName: 'Uterus Contracted',  values: new Array(NUM_COLS).fill(null) },
    { name: 'Urine Passed',        conceptName: 'Urine Passed',       values: new Array(NUM_COLS).fill(null) },
    { name: 'Hematoma',            conceptName: 'Hematoma',           values: new Array(NUM_COLS).fill(null) },
    { name: 'Complication',        conceptName: 'Complication',       values: new Array(NUM_COLS).fill(null) },
    { name: 'Assessment (Mother)', conceptName: 'Assessment Mother',  isTextarea: true, values: new Array(NUM_COLS).fill(null).map(() => []) },
    { name: 'Plan (Mother)',       conceptName: 'Plan Mother',        isTextarea: true, values: new Array(NUM_COLS).fill(null).map(() => []) },
  ];

  newbornParams: S3Param[] = [
    { name: 'Respiratory Rate',      conceptName: 'Respiratory Rate',      values: new Array(NUM_COLS).fill(null) },
    { name: 'SPO2',                  conceptName: 'SPO2',                  values: new Array(NUM_COLS).fill(null) },
    { name: 'Temprature °f',           conceptName: 'TEMPERATURE_NEWBORN',   values: new Array(NUM_COLS).fill(null) },
    { name: 'Grunting',              conceptName: 'Grunting',              values: new Array(NUM_COLS).fill(null) },
    { name: 'Chest Indrawing',       conceptName: 'Chest Indrawing',       values: new Array(NUM_COLS).fill(null) },
    { name: 'Fast Breathing',        conceptName: 'Fast Breathing',        values: new Array(NUM_COLS).fill(null) },
    { name: 'Feet (warm)',           conceptName: 'Feet Warm',             values: new Array(NUM_COLS).fill(null) },
    { name: 'Skin Color',            conceptName: 'Skin Color',            values: new Array(NUM_COLS).fill(null) },
    { name: 'Umbilical Cord Oozing', conceptName: 'Umbilical Cord Oozing', values: new Array(NUM_COLS).fill(null) },
    { name: 'Sucking / Feeding',     conceptName: 'Sucking Feeding',       values: new Array(NUM_COLS).fill(null) },
    { name: 'Complications',         conceptName: 'Complication',          values: new Array(NUM_COLS).fill(null) },
    { name: 'Assessment (Newborn)',  conceptName: 'Assessment Newborn',    isTextarea: true, values: new Array(NUM_COLS).fill(null).map(() => []) },
    { name: 'Plan (Newborn)',        conceptName: 'Plan Newborn',          isTextarea: true, values: new Array(NUM_COLS).fill(null).map(() => []) },
  ];

  constructor(
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly pageTitleService: PageTitleService,
    private readonly nepaliDateService: NepaliDateService,
    private readonly coreService: CoreService,
    private readonly visitService: VisitService,
    private readonly encounterService: EncounterService,
    private readonly toastr: ToastrService,
    private readonly authService: AuthService,
    private readonly helperService: HelperService
  ) {
     this.showViewElcg = !!this.router.getCurrentNavigation()?.extras?.state?.['fromVisitSummary'];
  }

  private loginAttempt = 0;
  private loginExternalThenFetch(uuid: string) {
    this.loginAttempt++;
    this.authService.loginExternal().subscribe((res: any) => {
      if (res?.authenticated) { this.getVisit(uuid); }
    }, () => {
      if (this.loginAttempt < 3) { this.loginExternalThenFetch(uuid); }
    });
  }

  ngOnInit(): void {
    this.pageTitleService.setTitle({ title: 'Early PostPartum Monitoring Report', imgUrl: '' });
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) { return; }
    this.loginExternalThenFetch(id);
  }

  get userId() { return getFromStorage('user')?.uuid; }
  get user()   { return getFromStorage('user'); }

  getInitials(name: string): string {
    return name ? name.trim() : '';
  }

  getVisit(uuid: string) {
    this.loading = true;
    this.visitService.fetchVisitDetails(uuid).subscribe((visit: any) => {
      this.loading = false;
      if (!visit) { return; }
      this.visit   = visit;
      this.patient = visit.patient;
      this.readPatientAttributes();
      this.readDeliveryOutcome();
      this.readStageData();
    }, () => {
      this.loading = false;
    });
  }

  readPatientAttributes() {
    for (const attr of (this.patient?.attributes || [])) {
      this.pinfo[attr.attributeType.display.replace(/ /g, '')] = attr.value;
    }
    this.pinfo['age']       = this.patient?.person?.age;
    this.pinfo['birthdate'] = this.patient?.person?.birthdate;
    this.pinfo['name']      = this.patient?.person?.display;
    this.pinfo['gender']    = this.patient?.person?.gender;
    this.pinfo['openMrsId'] = this.patient?.identifiers?.[0]?.identifier;
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

  private formatAmtslMedication(value: any): string {
    if (value === undefined || value === null || value === '') {
      return '-';
    }

    const extractMedicationText = (input: any): any => {
      if (input === undefined || input === null) {
        return input;
      }

      if (Array.isArray(input)) {
        return input.join(', ');
      }

      if (typeof input === 'object') {
        return input.MEDICATIONS_AMTSL || input.Medications_AMTSL || input['AMTSL Medication'] || JSON.stringify(input);
      }

      return input;
    };

    let normalized = extractMedicationText(value);

    if (typeof normalized === 'string') {
      const raw = normalized.trim();
      if (raw.startsWith('{') || raw.startsWith('[')) {
        try {
          normalized = extractMedicationText(JSON.parse(raw));
        } catch {
          const regex = /"(?:MEDICATIONS_AMTSL|Medications_AMTSL|AMTSL Medication)"\s*:\s*"([^"]+)"/i;
          const jsonKeyMatch = regex.exec(raw);
          if (jsonKeyMatch?.[1]) {
            normalized = jsonKeyMatch[1];
          }
        }
      }
    }

    const text = this.toDisplayText(normalized);
    if (text === '-') {
      return text;
    }

    return text
      .split(',')
      .map((item: string) => item.trim())
      .filter(Boolean)
      .join('\n');
  }

  private formatComplication(value: any): string {
    if (value === undefined || value === null || value === '') {
      return '-';
    }

    const raw = typeof value === 'string' ? value.trim() : value;

    if (typeof raw === 'object' && !Array.isArray(raw)) {
      const complications = raw.complications || raw.Complications || '';
      return complications || 'N';
    }

    if (typeof raw === 'string' && (raw.startsWith('{') || raw.startsWith('['))) {
      try {
        const parsed = JSON.parse(raw);
        if (typeof parsed === 'object' && !Array.isArray(parsed)) {
          const complications = parsed.complications || parsed.Complications || '';
          return complications || 'N';
        }
      } catch {
        // not JSON, return as-is
      }
    }

    if (typeof raw === 'string' && ['no', 'n', 'none'].includes(raw.toLowerCase())) {
      return 'N';
    }

    return this.toDisplayText(value);
  }

  private formatCongenitalDisorders(value: any): string {
    if (value === undefined || value === null || value === '') {
      return '-';
    }

    const extractDisordersText = (input: any): string[] => {
      if (input === undefined || input === null) {
        return [];
      }

      if (Array.isArray(input)) {
        return input.map(String).filter(Boolean);
      }

      if (typeof input === 'object') {
        const congenitalArray = input.CONGENITAL_ANOMALY || input.congenital_anomaly || [];
        const disorders: string[] = [];
        
        if (Array.isArray(congenitalArray)) {
          disorders.push(...congenitalArray.map(String).filter(Boolean));
        }
        
        if (input.other_text) {
          disorders.push(String(input.other_text));
        }
        
        return disorders;
      }

      if (typeof input === 'string') {
        const raw = input.trim();
        if (raw.startsWith('{') || raw.startsWith('[')) {
          try {
            return extractDisordersText(JSON.parse(raw));
          } catch {
            // If JSON parsing fails, return as is
            return input.split(',').map((item: string) => item.trim()).filter(Boolean);
          }
        }
        return input.split(',').map((item: string) => item.trim()).filter(Boolean);
      }

      return [];
    };

    const disorders = extractDisordersText(value);
    if (disorders.length === 0) {
      return '-';
    }

    return disorders.join(', ');
  }

  private formatDateYMD(value: any): string {
    const adDate = this.parseIncomingDate(value);
    if (!adDate) return '-';

    if (this.isNepalClient) {
      const bsDate = this.nepaliDateService.gregorianToBs(adDate);
      if (bsDate) {
        return `${String(bsDate.day).padStart(2, '0')} ${this.nepaliDateService.monthNames[bsDate.month - 1]} ${bsDate.year} BS`;
      }
    }

    return moment(adDate).format('YYYY MMMM DD');
  }

  private formatTime(value: any): string {
    if (!value) {
      return '-';
    }
    const parsed = moment(value);
    if (!parsed.isValid()) {
      return this.toDisplayText(value);
    }
    return parsed.format('hh:mm A');
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

  formatDateByClient(dateValue: any): string {
    const adDate = this.parseIncomingDate(dateValue);
    if (!adDate) {
      return '';
    }

    if (!this.isNepalClient) {
      return moment(adDate).format('YYYY/MM/DD');
    }

    const bsDate = this.nepaliDateService.gregorianToBs(adDate);
    return bsDate ? this.nepaliDateService.formatBsDate(bsDate) : moment(adDate).format('YYYY/MM/DD');
  }

  formatDateTimeByClient(dateValue: any): string {
    const adDate = this.parseIncomingDate(dateValue);
    if (!adDate) {
      return '';
    }

    const datePart = this.formatDateByClient(adDate);
    const timePart = moment(adDate).format('hh:mm a');
    return `${datePart} ${timePart}`.trim();
  }

  readDeliveryOutcome() {
    const deliveryOutcomeEncounter = (this.visit?.encounters || []).find((encounter: any) => encounter.encounterType?.display === 'DELIVERY_OUTCOME_STAGE3');
    const visitComplete = (this.visit?.encounters || []).find((encounter: any) => encounter.encounterType?.display === 'Visit Complete');
    const sourceEncounter = deliveryOutcomeEncounter || visitComplete;

    if (!sourceEncounter) {
      return;
    }

    const deliveryDateObs = this.getObsValueByConcept(sourceEncounter, ['Delivery Date', 'DATE OF DELIVERY', 'Birth Date', 'DELIVERY_DATE']);
    const deliveryTimeObs = this.getObsValueByConcept(sourceEncounter, ['Delivery Time', 'TIME OF DELIVERY', 'Birth Time', 'DELIVERY_TIME']);
    const fallbackDateTime = sourceEncounter?.encounterDatetime;

    const apgar1 = this.getObsValueByConcept(sourceEncounter, ['Apgar at 1 min']);
    const apgar5 = this.getObsValueByConcept(sourceEncounter, ['Apgar at 5 min']);

    this.deliveryOutcome.deliveryDate = this.formatDateYMD(deliveryDateObs || fallbackDateTime);
    this.deliveryOutcome.deliveryTime = this.formatTime(deliveryTimeObs || fallbackDateTime);
    this.deliveryOutcome.deliveryMode = this.toDisplayText(this.getObsValueByConcept(sourceEncounter, ['Delivery Mode', 'Mode of Delivery', 'DELIVERY_MODE']));
    this.deliveryOutcome.placentaMembraneDelivery = this.toDisplayText(this.getObsValueByConcept(sourceEncounter, ['Placenta & Membrane Delivery', 'Placenta and Membrane Delivery', 'PLACENTA_MEMBRANE_STATUS']));
    this.deliveryOutcome.placentaDeliveryTime = this.formatTime(this.getObsValueByConcept(sourceEncounter, ['Placenta Delivery Time', 'PLACENTA_DELIVERY_TIME']));
    this.deliveryOutcome.amtslMedication = this.formatAmtslMedication(this.getObsValueByConcept(sourceEncounter, ['AMTSL Medication', 'AMTSL', 'Medications_AMTSL']));
    this.deliveryOutcome.babyStatus = this.toDisplayText(this.getObsValueByConcept(sourceEncounter, ['Baby status', 'Baby Status', 'BIRTH_TYPE']));
    this.deliveryOutcome.babyGender = this.toDisplayText(this.getObsValueByConcept(sourceEncounter, ['Sex', 'Baby Gender']));
    this.deliveryOutcome.babyWeight = this.toDisplayText(this.getObsValueByConcept(sourceEncounter, ['BirthWeight', 'Baby Weight']));
    this.deliveryOutcome.apgarScore = (apgar1 || apgar5) ? `${this.toDisplayText(apgar1)}/${this.toDisplayText(apgar5)}` : '-';
    this.deliveryOutcome.resuscitation = this.toDisplayText(this.getObsValueByConcept(sourceEncounter, ['Resuscitation', 'RESUSCITATION']));
    this.deliveryOutcome.skinToSkin = this.toDisplayText(this.getObsValueByConcept(sourceEncounter, ['Skin-to-skin', 'Skin To Skin', 'Skin-to skin contact', 'Skin-to skin contact']));
    this.deliveryOutcome.breastfeedingInOneHour = this.toDisplayText(this.getObsValueByConcept(sourceEncounter, ['Breast-feeding in 1 hour', 'Breastfeeding in 1 hour', 'BREASTFED_FIRSTHOUR']));
    this.deliveryOutcome.placentaCordAbnormality = this.toDisplayText(this.getObsValueByConcept(sourceEncounter, ['Placenta or cord abnormality']));
    this.deliveryOutcome.perinealLaceration = this.toDisplayText(this.getObsValueByConcept(sourceEncounter, ['Perineal laceration during delivery']));
    this.deliveryOutcome.degreeOfTear = this.toDisplayText(this.getObsValueByConcept(sourceEncounter, ['DEGREE_OF_TEAR', 'Degree of tear']));
    this.deliveryOutcome.congenitalDisorders = this.formatCongenitalDisorders(this.getObsValueByConcept(sourceEncounter, ['CONGENITAL DISORDERS', 'Congenital Disorders']));
  }

  readStageData() {
    const allEncounters = this.visit?.encounters || [];
    const regularEncs = allEncounters
      .filter((e: any) => /^Stage3_Hour\d+(?:_\d+)?$/.test(e.encounterType?.display))
      .sort((a: any, b: any) =>
        new Date(a.encounterDatetime).getTime() - new Date(b.encounterDatetime).getTime()
      );
    const sosEncs = allEncounters
      .filter((e: any) => e.encounterType?.display === 'LCG_SOS' &&
        (e.obs || []).some((o: any) =>
          o.concept?.display === 'SOS_Stage_Hour' && /^Stage3_Hour/i.test(String(o.value || ''))))
      .sort((a: any, b: any) =>
        new Date(a.encounterDatetime).getTime() - new Date(b.encounterDatetime).getTime()
      );

    type ColEntry = { enc: any; isSos: boolean; label: string };
    const columns: ColEntry[] = [];
    let regIdx = 0;
    let sosIdx = 0;
    while (regIdx < regularEncs.length || sosIdx < sosEncs.length) {
      const reg = regularEncs[regIdx];
      const sos = sosEncs[sosIdx];
      const regT = reg ? new Date(reg.encounterDatetime).getTime() : Infinity;
      const sosT = sos ? new Date(sos.encounterDatetime).getTime() : Infinity;
      if (sosT < regT) {
        columns.push({ enc: sos, isSos: true, label: 'SOS' });
        sosIdx++;
      } else {
        columns.push({ enc: reg, isSos: false, label: COL_LABELS[regIdx] || `+${regIdx}` });
        regIdx++;
      }
    }

    const totalCols = Math.max(columns.length, NUM_COLS);
    this.colTimes    = new Array(totalCols).fill(null);
    this.colEncUuids = new Array(totalCols).fill(null);
    this.colIsSos    = new Array(totalCols).fill(false);
    this.colLabels   = new Array(totalCols).fill('');
    for (let i = 0; i < NUM_COLS; i++) {
      this.colLabels[i] = COL_LABELS[i];
    }
    this.colIndexes  = Array.from({ length: totalCols }, (_, i) => i);
    this.maternalParams.forEach(p => {
      p.values = p.isTextarea
        ? new Array(totalCols).fill(null).map(() => [])
        : new Array(totalCols).fill(null);
    });
    this.newbornParams.forEach(p => {
      p.values = p.isTextarea
        ? new Array(totalCols).fill(null).map(() => [])
        : new Array(totalCols).fill(null);
    });

    for (let colIndex = 0; colIndex < columns.length; colIndex++) {
      const { enc, isSos, label } = columns[colIndex];
      this.colTimes[colIndex]    = enc.encounterDatetime;
      this.colEncUuids[colIndex] = enc.uuid;
      this.colIsSos[colIndex]    = isSos;
      this.colLabels[colIndex]   = label;
      for (const ob of (enc.obs || [])) {
        this.assignObs(ob, colIndex);
      }
    }

    if (!this.colEncUuids.some((encUuid: string | null) => !!encUuid)) {
      const visitCompleteEnc = allEncounters.find((encounter: any) => encounter.encounterType?.display === 'Visit Complete');
      if (visitCompleteEnc) {
        this.colTimes[0]    = visitCompleteEnc.encounterDatetime;
        this.colEncUuids[0] = visitCompleteEnc.uuid;
        for (const observation of (visitCompleteEnc.obs || [])) {
          this.assignObs(observation, 0);
        }
      }
    }
  }

  private assignObs(ob: any, colIndex: number) {
    const display = ob.concept?.display;
    if (!display) return;

    let idx = this.maternalParams.findIndex((param, paramIndex) => this.matchesParamObs(ob, param, 'maternal', paramIndex));
    if (idx >= 0) {
      const p = this.maternalParams[idx];
      if (p.isTextarea) {
        if (!Array.isArray(p.values[colIndex])) p.values[colIndex] = [];
        p.values[colIndex] = [...p.values[colIndex], {
          value: ob.value, uuid: ob.uuid, creator: ob.creator,
          obsDatetime: ob.obsDatetime,
          canEdit: this.userId === ob.creator?.uuid,
          initial: this.getInitials(ob.creator?.person?.display)
        }];
      } else {
        if (p.name === 'BP') {
          const concept = this.normalizeConcept(ob?.concept?.display);
          // Always keep BP as "systolic/diastolic" so the two obs can arrive in any
          // order without the previously-stored half being lost.
          const current = p.values[colIndex]?.value ? String(p.values[colIndex].value) : '/';
          let [systolic = '', diastolic = ''] = current.split('/');
          if (/systolicbp/.test(concept)) {
            systolic = String(ob.value);
          } else if (/diastolicbp/.test(concept)) {
            diastolic = String(ob.value);
          }
          p.values[colIndex] = { value: `${systolic}/${diastolic}`, uuid: ob.uuid };
        } else if (p.name === 'Complication') {
          p.values[colIndex] = { value: this.formatComplication(ob.value), uuid: ob.uuid };
        } else {
          p.values[colIndex] = { value: ob.value, uuid: ob.uuid };
        }
      }
      return;
    }

    idx = this.newbornParams.findIndex((param, paramIndex) => this.matchesParamObs(ob, param, 'newborn', paramIndex));
    if (idx >= 0) {
      const p = this.newbornParams[idx];
      if (p.isTextarea) {
        if (!Array.isArray(p.values[colIndex])) p.values[colIndex] = [];
        p.values[colIndex] = [...p.values[colIndex], {
          value: ob.value, uuid: ob.uuid, creator: ob.creator,
          obsDatetime: ob.obsDatetime,
          canEdit: this.userId === ob.creator?.uuid,
          initial: this.getInitials(ob.creator?.person?.display)
        }];
      } else if (p.name === 'Complications') {
        p.values[colIndex] = { value: this.formatComplication(ob.value), uuid: ob.uuid };
      } else {
        p.values[colIndex] = { value: ob.value, uuid: ob.uuid };
      }
    }
  }

  private normalizeConcept(value: any): string {
    return String(value || '').trim().toLowerCase().replace(/[^a-z0-9]/g, '');
  }

  private getParamAliases(section: 'maternal' | 'newborn', param: S3Param): string[] {
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
      if (param.name === 'Respiratory Rate') {
        aliases.push('RESPIRATORY_RATE_NEWBORN', 'Respiratory Rate Newborn', 'Respiratory rate', 'RESPIRATORY RATE');
      } else if (param.name === 'SPO2') {
        aliases.push('SPO2_NEWBORN', 'SpO2', 'Oxygen Saturation', 'SPO2 Newborn');
      } else if (param.name === 'Temperature') {
        aliases.push('TEMPERATURE (C)', 'Temperature (C)', 'TEMPERATURE_NEWBORN', 'Temperature Newborn', 'TEMP (C)');
      } else if (param.name === 'Complications') {
        aliases.push('COMPLICATION_NEWBORN', 'Complication Newborn', 'Complication', 'Complications Newborn', 'ONGOING_COMPLICATIONS_NEWBORN');
      } else if (param.name === 'Grunting') {
        aliases.push('GRUNTING_NEWBORN');
      } else if (param.name === 'Chest Indrawing') {
        aliases.push('CHEST_INDRAWING_NEWBORN');
      } else if (param.name === 'Fast Breathing') {
        aliases.push('FAST_BREATHING_NEWBORN');
      } else if (param.name === 'Feet (warm)') {
        aliases.push('FEET_WARM_NEWBORN', 'Feet Warm Newborn', 'Feet Warm', 'Feet Temperature');
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
      .map((item: string) => this.normalizeConcept(item))
      .filter(Boolean);
  }

  private matchesParamObs(ob: any, param: S3Param, section: 'maternal' | 'newborn', paramIndex: number): boolean {
    const obsDisplay = this.normalizeConcept(ob?.concept?.display);
    const obsConceptUuid = this.normalizeConcept(ob?.concept?.uuid);
    const aliases = this.getParamAliases(section, param);

    const normalizedAliases = aliases
      .filter(a => a)
      .map(a => this.normalizeConcept(a));
    if (normalizedAliases.includes(obsDisplay)) {
      return true;
    }

    const conceptUuid = this.normalizeConcept(this.getConceptUuid(section, paramIndex));
    if (conceptUuid && obsConceptUuid && conceptUuid === obsConceptUuid) {
      return true;
    }

    return false;
  }

  private getConceptUuid(section: 'maternal' | 'newborn', paramIdx: number): string | null {
    const conceptName = section === 'maternal'
      ? this.maternalParams[paramIdx].conceptName
      : this.newbornParams[paramIdx].conceptName;
    const map: Record<string, string> = {
      'Assessment Mother':  this.conceptAssessmentMother,
      'Plan Mother':        this.conceptPlanMother,
      'Assessment Newborn': this.conceptAssessmentNewborn,
      'Plan Newborn':       this.conceptPlanNewborn,
    };
    return map[conceptName] ?? null;
  }

  private getLatestStage3ColumnIndex(): number {
    for (let index = this.colEncUuids.length - 1; index >= 0; index--) {
      if (this.colEncUuids[index]) {
        return index;
      }
    }
    return -1;
  }

  isAlert(paramName: string, value: any): boolean {
    if (value === undefined || value === null || value === '' || value === '-') return false;
    const v = String(value).trim().toLowerCase();
    const num = parseFloat(v);

    switch (paramName) {
      case 'Pulse':
        return !isNaN(num) && (num < 60 || num >= 120);
      case 'BP': {
        const parts = String(value).split('/');
        const sys = parseFloat(parts[0]);
        const dia = parseFloat(parts[1]);
        return (!isNaN(sys) && (sys < 80 || sys >= 140)) || (!isNaN(dia) && dia >= 90);
      }
      case 'Temprature °f':
        return !isNaN(num) && (num < 95 || num >= 99.5);
      case 'Respiratory Rate':
        return !isNaN(num) && num > 30;
      case 'SPO2':
        return !isNaN(num) && num < 92;  
      case 'Blood Loss':
        return !isNaN(num) && num >= 500;
      case 'Uterus Contracted':
        return v === 'n' || v === 'no';
      case 'Urine Passed':
        return v === 'n' || v === 'no';
      case 'Hematoma':
        return v === 'y' || v === 'yes';
      case 'Complication':
      case 'Complications':
        return v !== '-' && v !== 'no' && v !== 'n' && v.length > 0;
      case 'Grunting':
      case 'Chest Indrawing':
      case 'Fast Breathing':
      case 'Skin Color':
      case 'Umbilical Cord Oozing':
        return v === 'y' || v === 'yes';
      case 'Feet Temperature':
      case 'Feet (warm)':    
        return v === 'n' || v === 'no';
      case 'Sucking / Feeding':
        return v === 'n' || v === 'no';
      default:
        return false;
    }
  }

  getTextareaHistory(param: S3Param): any[] {
    return param.values.reduce((acc: any[], cell: any) => {
      if (Array.isArray(cell)) {
        return acc.concat(cell);
      }
      return acc;
    }, []).sort((a: any, b: any) => new Date(b.obsDatetime).getTime() - new Date(a.obsDatetime).getTime());
  }

  get maternalAssessmentHistory(): any[] {
    return this.getTextareaHistory(this.maternalParams[9]);
  }

  get maternalPlanHistory(): any[] {
    return this.getTextareaHistory(this.maternalParams[10]);
  }

  get newbornAssessmentHistory(): any[] {
    return this.getTextareaHistory(this.newbornParams[11]);
  }

  get newbornPlanHistory(): any[] {
    return this.getTextareaHistory(this.newbornParams[12]);
  }

  private findObsLocation(param: S3Param, obsUuid: string): { colIdx: number; itemIdx: number } {
    for (let colIdx = 0; colIdx < this.colIndexes.length; colIdx++) {
      const cell = param.values[colIdx];
      if (!Array.isArray(cell)) {
        continue;
      }
      const itemIdx = cell.findIndex((item: any) => item.uuid === obsUuid);
      if (itemIdx !== -1) {
        return { colIdx, itemIdx };
      }
    }
    return { colIdx: -1, itemIdx: -1 };
  }

  private ensureLatestEncounter(): { colIdx: number; encounterUuid: string } {
    const colIdx = this.getLatestStage3ColumnIndex();
    if (colIdx === -1 || !this.colEncUuids[colIdx]) {
      this.toastr.warning('No Stage 3 encounter found to save data.');
      return null;
    }
    return { colIdx, encounterUuid: this.colEncUuids[colIdx] };
  }

  addAssessment(section: 'maternal' | 'newborn', paramIdx: number) {
    const params = section === 'maternal' ? this.maternalParams : this.newbornParams;
    const param = params[paramIdx];
    const latestInfo = this.ensureLatestEncounter();
    if (!latestInfo) {
      return;
    }

    const currentEncData = Array.isArray(param.values[latestInfo.colIdx]) ? [...param.values[latestInfo.colIdx]] : [];
    const historyData = this.getTextareaHistory(param);

    this.coreService.openAddAssessmentModal({ currentEncData, historyData }).subscribe((res: any) => {
      if (!res?.assessment?.length) {
        return;
      }

      const conceptUuid = this.getConceptUuid(section, paramIdx);
      if (!conceptUuid) {
        this.toastr.error('Concept UUID not configured for this parameter.');
        return;
      }

      res.assessment.forEach((assessmentItem: any) => {
        if (assessmentItem.id) {
          if (assessmentItem.isDeleted) {
            this.encounterService.deleteObs(assessmentItem.id).subscribe(() => {
              const location = this.findObsLocation(param, assessmentItem.id);
              if (location.colIdx !== -1 && location.itemIdx !== -1) {
                param.values[location.colIdx].splice(location.itemIdx, 1);
              }
            });
          } else {
            this.encounterService.updateObs(assessmentItem.id, { value: assessmentItem.assessmentValue }).subscribe((result: any) => {
              const location = this.findObsLocation(param, assessmentItem.id);
              if (location.colIdx !== -1 && location.itemIdx !== -1) {
                param.values[location.colIdx][location.itemIdx].value = result.value;
              }
            });
          }
        } else if (!assessmentItem.isDeleted) {
          this.encounterService.postObs({
            concept: conceptUuid,
            person: this.visit.patient.uuid,
            obsDatetime: new Date(),
            value: assessmentItem.assessmentValue,
            encounter: latestInfo.encounterUuid,
          }).subscribe((result: any) => {
            if (!Array.isArray(param.values[latestInfo.colIdx])) {
              param.values[latestInfo.colIdx] = [];
            }
            param.values[latestInfo.colIdx] = [
              ...param.values[latestInfo.colIdx],
              {
                value: assessmentItem.assessmentValue,
                uuid: result.uuid,
                creator: { uuid: this.userId, person: this.user?.person },
                obsDatetime: result.obsDatetime,
                canEdit: true,
                initial: this.getInitials(this.user?.person?.display)
              }
            ];
          });
        }
      });
    });
  }

  prescribePlan(section: 'maternal' | 'newborn', paramIdx: number) {
    const params = section === 'maternal' ? this.maternalParams : this.newbornParams;
    const param = params[paramIdx];
    const latestInfo = this.ensureLatestEncounter();
    if (!latestInfo) {
      return;
    }

    const currentEncData = Array.isArray(param.values[latestInfo.colIdx]) ? [...param.values[latestInfo.colIdx]] : [];
    const historyData = this.getTextareaHistory(param);

    this.coreService.openPrescribePlanModal({ currentEncData, historyData }).subscribe((res: any) => {
      if (!res?.plan?.length) {
        return;
      }

      const conceptUuid = this.getConceptUuid(section, paramIdx);
      if (!conceptUuid) {
        this.toastr.error('Concept UUID not configured for this parameter.');
        return;
      }

      res.plan.forEach((planItem: any) => {
        if (planItem.id) {
          if (planItem.isDeleted) {
            this.encounterService.deleteObs(planItem.id).subscribe(() => {
              const location = this.findObsLocation(param, planItem.id);
              if (location.colIdx !== -1 && location.itemIdx !== -1) {
                param.values[location.colIdx].splice(location.itemIdx, 1);
              }
            });
          } else {
            this.encounterService.updateObs(planItem.id, { value: planItem.planValue }).subscribe((result: any) => {
              const location = this.findObsLocation(param, planItem.id);
              if (location.colIdx !== -1 && location.itemIdx !== -1) {
                param.values[location.colIdx][location.itemIdx].value = result.value;
              }
            });
          }
        } else if (!planItem.isDeleted) {
          this.encounterService.postObs({
            concept: conceptUuid,
            person: this.visit.patient.uuid,
            obsDatetime: new Date(),
            value: planItem.planValue,
            encounter: latestInfo.encounterUuid,
          }).subscribe((result: any) => {
            if (!Array.isArray(param.values[latestInfo.colIdx])) {
              param.values[latestInfo.colIdx] = [];
            }
            param.values[latestInfo.colIdx] = [
              ...param.values[latestInfo.colIdx],
              {
                value: planItem.planValue,
                uuid: result.uuid,
                creator: { uuid: this.userId, person: this.user?.person },
                obsDatetime: result.obsDatetime,
                canEdit: true,
                initial: this.getInitials(this.user?.person?.display)
              }
            ];
          });
        }
      });
    });
  }

  async printStage3() {
    const printContent = document.getElementById('stage3-print-content');
    if (!printContent) { return; }
    const css = [
      '* { box-sizing: border-box; }',
      'body { margin: 0; padding: 8px; font-family: Arial, sans-serif; }',
      'table { border-collapse: collapse; }',
      'th, td { border: 1px solid #000; padding: 5px 7px; font-size: 11px; text-align: center; vertical-align: middle; word-wrap: break-word; }',
      '.delivery-outcome { margin-bottom: 12px; }',
      '.delivery-outcome td { white-space: normal; }',
      '.delivery-outcome td.amtsl-medication-cell { white-space: pre-line; }',
      '.page-title-row td, .delivery-title-row td { font-weight: bold; }',
      'td span { font-weight: bold; }',
      '.section-header-row td { background: #c8e6c9; font-weight: bold; text-align: left; }',
      'td.param-label { text-align: left; min-width: 160px; font-weight: bold; }',
      '.obs-chip { background: #e3f2fd; border-radius: 3px; padding: 1px 3px; margin: 1px; display: inline-block; }',
      '.alert-value { color: #d32f2f; background: #ffebee; border-radius: 4px; }',
      '.sos-badge { display: inline-block; margin-left: 4px; padding: 1px 6px; font-size: 10px; font-weight: 700; color: #fff; background: #d32f2f; border-radius: 8px; letter-spacing: 0.5px; }',
      '.sos-col-header { background: #d32f2f !important; color: #fff !important; }',
      '.sos-col-header .time-label, .sos-col-header small { color: #fff !important; }',
      'table { width: 100%; table-layout: auto; }',
      // The on-screen grid lives in an overflow-x:auto scroller which would clip
      // the right-hand columns in print; let it show its full width instead.
      '.table-responsive { overflow: visible !important; }',
      // Let the (wide) grid take its natural width so we can measure it and zoom
      // it down to fit the page — otherwise width:100% squeezes/clips columns.
      '#stage3-print-table { width: auto; table-layout: auto; }',
      '@media print { @page { size: portrait; margin: 5mm; } }'
    ].join(' ');
   const iframe = document.createElement('iframe');
    iframe.setAttribute('aria-hidden', 'true');
    // Off-screen but with a real size so the grid lays out and measures
    // correctly (a 0x0 iframe reports wrong widths).
    iframe.style.cssText = 'position:fixed;left:-10000px;top:0;width:1200px;height:1600px;border:0;';
    document.body.appendChild(iframe);

    const frameWin = iframe.contentWindow;
    const frameDoc = frameWin?.document;
    if (!frameWin || !frameDoc) {
      iframe.remove();
      return;
    }

    const reportTitle = 'Delivery Outcome Report';
    frameDoc.open();
    frameDoc.write('<!DOCTYPE html><html><head><meta charset="utf-8"><title>' + reportTitle + '</title><style>' + css + '</style></head><body><div id="stage3-print-root">' + printContent.innerHTML + '</div></body></html>');
    frameDoc.close();

    const cleanup = () => {
      if (iframe.parentNode) { iframe.parentNode.removeChild(iframe); }
    };

    // Wait for fonts to load before rasterising so the width/height is accurate.
    const waitForFonts = () => new Promise<void>((resolve) => {
      const fonts = (frameDoc as any).fonts;
      let done = false;
      const finish = () => { if (!done) { done = true; resolve(); } };
      if (fonts && fonts.ready && typeof fonts.ready.then === 'function') {
        fonts.ready.then(() => setTimeout(finish, 150));
        setTimeout(finish, 2000);
      } else {
        setTimeout(finish, 500);
      }
    });

    // We render to a PDF and save it rather than calling window.print(), because
    // the web app runs inside the Intelehealth mobile wrappers (Android WebView /
    // iOS WKWebView) where JS-initiated printing is a no-op. A downloadable PDF
    // lets the OS handle printing/sharing.
    try {
      await waitForFonts();

      const root = (frameDoc.getElementById('stage3-print-root') as HTMLElement | null) || frameDoc.body;
      const naturalWidth = root.scrollWidth;
      const naturalHeight = root.scrollHeight;

      // Cap the raster resolution so a wide report doesn't blow up memory on
      // low-end devices, while keeping text crisp on smaller ones (never < 1x).
      const captureScale = Math.max(1, Math.min(2, 2400 / naturalWidth));

      const canvas = await html2canvas(root, {
        backgroundColor: '#ffffff',
        scale: captureScale,
        useCORS: true,
        windowWidth: naturalWidth,
        windowHeight: naturalHeight,
      });

      const pdf = new jsPDF({ orientation: 'portrait', unit: 'pt', format: 'a4' });
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const margin = 14; // ~5mm
      const maxWidth = pageWidth - margin * 2;

      // Fit to page width; paginate down the height so tall reports aren't
      // squashed onto a single page.
      const imgWidth = maxWidth;
      const imgHeight = (canvas.height / canvas.width) * imgWidth;
      const imgData = canvas.toDataURL('image/png');

      let heightLeft = imgHeight;
      let position = margin;
      pdf.addImage(imgData, 'PNG', margin, position, imgWidth, imgHeight);
      heightLeft -= (pageHeight - margin * 2);
      while (heightLeft > 0) {
        pdf.addPage();
        position = margin - (imgHeight - heightLeft);
        pdf.addImage(imgData, 'PNG', margin, position, imgWidth, imgHeight);
        heightLeft -= (pageHeight - margin * 2);
      }

      await this.helperService.deliverPdf(pdf, reportTitle + '.pdf', reportTitle);
    } catch (err) {
      console.error('Failed to generate Stage 3 PDF', err);
    } finally {
      cleanup();
    }
  }

  backToStage12() {
    if (this.visit?.uuid) {
      this.router.navigate(['/dashboard/elcg', this.visit.uuid], {
        queryParams: { fromStage3: '1' }
      });
      return;
    }
    this.router.navigate(['/dashboard']);
  }

  getBpPart(value: any, part: 'systolic' | 'diastolic'): string {
    const str = value == null ? '' : String(value);
    if (!str) return '';
    const [s = '', d = ''] = str.split('/');
    return part === 'systolic' ? s.trim() : d.trim();
  }

  formatColTime(time: string | null): string {
    if (!time) {
      return '';
    }
    const adDate = this.parseIncomingDate(time);
    if (!adDate) {
      return '';
    }
    let datePart: string;
    if (this.isNepalClient) {
      const bsDate = this.nepaliDateService.gregorianToBs(adDate);
      datePart = bsDate
        ? `${String(bsDate.day).padStart(2, '0')} ${this.nepaliDateService.monthNames[bsDate.month - 1]} ${bsDate.year} BS`
        : moment(adDate).format('YYYY/MM/DD');
    } else {
      datePart = moment(adDate).format('YYYY/MM/DD');
    }
    const timePart = moment(adDate).format('HH:mm');
    return `${datePart} ${timePart}`.trim();
  }

}
