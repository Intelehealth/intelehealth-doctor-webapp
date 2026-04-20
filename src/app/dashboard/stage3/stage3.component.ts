import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import * as moment from 'moment';
import { ToastrService } from 'ngx-toastr';
import { PageTitleService } from 'src/app/core/page-title/page-title.service';
import { NepaliDateService } from 'src/app/core/services/nepali-date.service';
import { CoreService } from 'src/app/services/core/core.service';
import { EncounterService } from 'src/app/services/encounter.service';
import { VisitService } from 'src/app/services/visit.service';
import { environment } from 'src/environments/environment';

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

  deliveryOutcome = {
    deliveryDate: '-',
    deliveryTime: '-',
    deliveryMode: '-',
    placentaMembraneDelivery: '-',
    amtslMedication: '-',
    babyStatus: '-',
    babyGender: '-',
    babyWeight: '-',
    apgarScore: '-',
    resuscitation: '-',
    skinToSkin: '-',
    breastfeedingInOneHour: '-',
  };

  colTimes: (string | null)[]    = new Array(NUM_COLS).fill(null);
  colEncUuids: (string | null)[] = new Array(NUM_COLS).fill(null);

  colOffsets = COL_OFFSETS;
  colLabels  = COL_LABELS;
  numCols    = NUM_COLS;
  colIndexes = Array.from({ length: NUM_COLS }, (_, i) => i);

  // Replace placeholder UUIDs with real OpenMRS concept UUIDs for Nepal Stage3
  conceptAssessmentMother  = '67a050c1-35e5-451c-a4ab-fff9d57b0db1';
  conceptPlanMother        = '162169AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA';
  conceptAssessmentNewborn = 'ASSESSMENT_NEWBORN_S3';
  conceptPlanNewborn       = 'PLAN_NEWBORN_S3';

  maternalParams: S3Param[] = [
    { name: 'Pulse',               conceptName: 'PULSE',             values: new Array(NUM_COLS).fill(null) },
    { name: 'BP',                  conceptName: 'Systolic BP',        values: new Array(NUM_COLS).fill(null) },
    { name: 'Respiratory Rate',    conceptName: 'Respiratory Rate',   values: new Array(NUM_COLS).fill(null) },
    { name: 'Temperature',         conceptName: 'TEMPERATURE (C)',    values: new Array(NUM_COLS).fill(null) },
    { name: 'Blood Loss',          conceptName: 'Blood Loss',         values: new Array(NUM_COLS).fill(null) },
    { name: 'Uterus Contracted',   conceptName: 'Uterus Contracted',  values: new Array(NUM_COLS).fill(null) },
    { name: 'Urine Passed',        conceptName: 'Urine Passed',       values: new Array(NUM_COLS).fill(null) },
    { name: 'Hematoma',            conceptName: 'Hematoma',           values: new Array(NUM_COLS).fill(null) },
    { name: 'Complication',        conceptName: 'Complication',       values: new Array(NUM_COLS).fill(null) },
    { name: 'Assessment (Mother)', conceptName: 'Assessment Mother',  isTextarea: true, values: new Array(NUM_COLS).fill(null).map(() => []) },
    { name: 'Plan (Mother)',       conceptName: 'Plan Mother',        isTextarea: true, values: new Array(NUM_COLS).fill(null).map(() => []) },
  ];

  newbornParams: S3Param[] = [
    { name: 'Grunting',              conceptName: 'Grunting',              values: new Array(NUM_COLS).fill(null) },
    { name: 'Chest Indrawing',       conceptName: 'Chest Indrawing',       values: new Array(NUM_COLS).fill(null) },
    { name: 'Fast Breathing',        conceptName: 'Fast Breathing',        values: new Array(NUM_COLS).fill(null) },
    { name: 'Feet Temperature',      conceptName: 'Feet Temperature',      values: new Array(NUM_COLS).fill(null) },
    { name: 'Skin Color',            conceptName: 'Skin Color',            values: new Array(NUM_COLS).fill(null) },
    { name: 'Umbilical Cord Oozing', conceptName: 'Umbilical Cord Oozing', values: new Array(NUM_COLS).fill(null) },
    { name: 'Sucking / Feeding',     conceptName: 'Sucking Feeding',       values: new Array(NUM_COLS).fill(null) },
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
    private readonly toastr: ToastrService
  ) { }

  ngOnInit(): void {
    this.pageTitleService.setTitle({ title: 'Early PostPartum Monitoring Report', imgUrl: '' });
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) { this.router.navigate(['/dashboard']); return; }
    this.getVisit(id);
  }

  get userId() { return getFromStorage('user')?.uuid; }
  get user()   { return getFromStorage('user'); }

  getInitials(name: string): string {
    if (!name) return '';
    const parts = name.trim().split(' ');
    if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
    return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
  }

  getVisit(uuid: string) {
    this.loading = true;
    this.visitService.fetchVisitDetails(uuid).subscribe((visit: any) => {
      this.loading = false;
      if (!visit) { this.router.navigate(['/dashboard']); return; }
      this.visit   = visit;
      this.patient = visit.patient;
      this.readPatientAttributes();
      this.readDeliveryOutcome();
      this.readStageData();
    }, () => {
      this.loading = false;
      this.router.navigate(['/dashboard']);
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
          const jsonKeyMatch = raw.match(/"(?:MEDICATIONS_AMTSL|Medications_AMTSL|AMTSL Medication)"\s*:\s*"([^"]+)"/i);
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
      .filter((item: string) => !!item)
      .join('\n');
  }

  private formatDate(value: any): string {
    const formatted = this.formatDateByClient(value);
    return formatted || '-';
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
      return moment(adDate).format('DD/MM/YYYY');
    }

    const bsDate = this.nepaliDateService.gregorianToBs(adDate);
    return bsDate ? this.nepaliDateService.formatBsDate(bsDate) : moment(adDate).format('DD/MM/YYYY');
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

    this.deliveryOutcome.deliveryDate = this.formatDate(deliveryDateObs || fallbackDateTime);
    this.deliveryOutcome.deliveryTime = this.formatTime(deliveryTimeObs || fallbackDateTime);
    this.deliveryOutcome.deliveryMode = this.toDisplayText(this.getObsValueByConcept(sourceEncounter, ['Delivery Mode', 'Mode of Delivery', 'DELIVERY_MODE']));
    this.deliveryOutcome.placentaMembraneDelivery = this.toDisplayText(this.getObsValueByConcept(sourceEncounter, ['Placenta & Membrane Delivery', 'Placenta and Membrane Delivery', 'PLACENTA_MEMBRANE_STATUS']));
    this.deliveryOutcome.amtslMedication = this.formatAmtslMedication(this.getObsValueByConcept(sourceEncounter, ['AMTSL Medication', 'AMTSL', 'Medications_AMTSL']));
    this.deliveryOutcome.babyStatus = this.toDisplayText(this.getObsValueByConcept(sourceEncounter, ['Baby status', 'Baby Status', 'BIRTH_TYPE']));
    this.deliveryOutcome.babyGender = this.toDisplayText(this.getObsValueByConcept(sourceEncounter, ['Sex', 'Baby Gender']));
    this.deliveryOutcome.babyWeight = this.toDisplayText(this.getObsValueByConcept(sourceEncounter, ['BirthWeight', 'Baby Weight']));
    this.deliveryOutcome.apgarScore = (apgar1 || apgar5) ? `${this.toDisplayText(apgar1)}/${this.toDisplayText(apgar5)}` : '-';
    this.deliveryOutcome.resuscitation = this.toDisplayText(this.getObsValueByConcept(sourceEncounter, ['Resuscitation', 'RESUSCITATION']));
    this.deliveryOutcome.skinToSkin = this.toDisplayText(this.getObsValueByConcept(sourceEncounter, ['Skin-to-skin', 'Skin To Skin', 'Skin-to skin contact', 'Skin-to skin contact']));
    this.deliveryOutcome.breastfeedingInOneHour = this.toDisplayText(this.getObsValueByConcept(sourceEncounter, ['Breast-feeding in 1 hour', 'Breastfeeding in 1 hour', 'BREASTFED_FIRSTHOUR']));
  }

  readStageData() {
    this.colTimes    = new Array(NUM_COLS).fill(null);
    this.colEncUuids = new Array(NUM_COLS).fill(null);
    this.maternalParams.forEach(p => {
      p.values = p.isTextarea
        ? new Array(NUM_COLS).fill(null).map(() => [])
        : new Array(NUM_COLS).fill(null);
    });
    this.newbornParams.forEach(p => {
      p.values = p.isTextarea
        ? new Array(NUM_COLS).fill(null).map(() => [])
        : new Array(NUM_COLS).fill(null);
    });

    const encs = (this.visit?.encounters || [])
      .filter((e: any) => /^Stage3_Hour\d+(?:_\d+)?$/.test(e.encounterType?.display))
      .sort((a: any, b: any) =>
        new Date(a.encounterDatetime).getTime() - new Date(b.encounterDatetime).getTime()
      );

    for (const [encIndex, enc] of encs.entries()) {
      const colIndex = encIndex;
      if (colIndex < 0 || colIndex >= NUM_COLS) continue;

      this.colTimes[colIndex]    = enc.encounterDatetime;
      this.colEncUuids[colIndex] = enc.uuid;

      for (const ob of (enc.obs || [])) {
        this.assignObs(ob, colIndex);
      }
    }

    if (!this.colEncUuids.some((encUuid: string | null) => !!encUuid)) {
      const visitCompleteEnc = (this.visit?.encounters || []).find((encounter: any) => encounter.encounterType?.display === 'Visit Complete');
      if (visitCompleteEnc) {
        this.colTimes[0] = visitCompleteEnc.encounterDatetime;
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
        p.values[colIndex] = { value: ob.value, uuid: ob.uuid };
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
      } else {
        p.values[colIndex] = { value: ob.value, uuid: ob.uuid };
      }
    }
  }

  private normalizeConcept(value: any): string {
    return String(value || '').trim().toLowerCase();
  }

  private matchesParamObs(ob: any, param: S3Param, section: 'maternal' | 'newborn', paramIndex: number): boolean {
    const obsDisplay = this.normalizeConcept(ob?.concept?.display);
    const obsConceptUuid = this.normalizeConcept(ob?.concept?.uuid);
    const paramDisplay = this.normalizeConcept(param?.conceptName);
    if (obsDisplay === paramDisplay) {
      return true;
    }

    const conceptUuid = this.normalizeConcept(this.getConceptUuid(section, paramIndex));
    if (conceptUuid && obsConceptUuid && conceptUuid === obsConceptUuid) {
      return true;
    }

    if (section === 'maternal' && param.isTextarea) {
      if (param.name === 'Assessment (Mother)' && ['assessment', 'assessment mother'].includes(obsDisplay)) {
        return true;
      }
      if (param.name === 'Plan (Mother)' && ['plan', 'plan mother', 'additional comments'].includes(obsDisplay)) {
        return true;
      }
    }

    if (section === 'newborn' && param.isTextarea) {
      if (param.name === 'Assessment (Newborn)' && ['assessment newborn'].includes(obsDisplay)) {
        return true;
      }
      if (param.name === 'Plan (Newborn)' && ['plan newborn'].includes(obsDisplay)) {
        return true;
      }
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
    return this.getTextareaHistory(this.newbornParams[7]);
  }

  get newbornPlanHistory(): any[] {
    return this.getTextareaHistory(this.newbornParams[8]);
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

  printStage3() {
    const tableEl = document.getElementById('stage3-print-table');
    if (!tableEl) { globalThis.print(); return; }
    const printWindow = globalThis.open('', '_blank', 'width=1400,height=900');
    if (!printWindow) { globalThis.print(); return; }
    const css = [
      '* { box-sizing: border-box; }',
      'body { margin: 0; padding: 8px; font-family: Arial, sans-serif; }',
      'table { border-collapse: collapse; }',
      'th, td { border: 1px solid #000; padding: 5px 7px; font-size: 11px; text-align: center; vertical-align: middle; white-space: nowrap; }',
      '.section-header-row td { background: #c8e6c9; font-weight: bold; text-align: left; }',
      'td.param-label { text-align: left; min-width: 160px; font-weight: bold; }',
      '.obs-chip { background: #e3f2fd; border-radius: 3px; padding: 1px 3px; margin: 1px; display: inline-block; }',
      '@media print { @page { size: landscape; margin: 5mm; } }'
    ].join(' ');
    const doc = printWindow.document;
    doc.open();
    doc.close();
    doc.head.innerHTML = '<meta charset="utf-8"><title>Early PostPartum Monitoring Report</title><style>' + css + '</style>';
    doc.body.innerHTML = '<table>' + tableEl.innerHTML + '</table>';
    setTimeout(() => {
      printWindow.focus();
      printWindow.print();
      printWindow.close();
    }, 300);
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

  formatColTime(time: string | null): string {
    if (!time) {
      return '';
    }
    const adDate = this.parseIncomingDate(time);
    if (!adDate) {
      return '';
    }
    const datePart = this.formatDateByClient(adDate);
    const timePart = moment(adDate).format('HH:mm');
    return `${datePart} ${timePart}`.trim();
  }

}
