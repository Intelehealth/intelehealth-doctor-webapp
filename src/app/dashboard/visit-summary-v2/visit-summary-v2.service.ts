import { Injectable } from '@angular/core';
import { EMPTY, forkJoin, Observable, of, throwError } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';
import { tap } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { visitTypes, conceptIds, doctorDetails, visitAttributeTypes } from 'src/config/constant';
import { calculateBMI, convertCelsiusToFahrenheit } from 'src/app/utils/utility-functions';
import {
  ApiResponseModel, EncounterModel, ObsApiResponseModel, ObsModel,
  PatientModel, VisitModel, VitalModel
} from 'src/app/model/model';
import { VisitService } from 'src/app/services/visit.service';
import { DiagnosisService } from 'src/app/services/diagnosis.service';
import { AppointmentService } from 'src/app/services/appointment.service';
import { EncounterService } from 'src/app/services/encounter.service';
import { LinkService } from 'src/app/services/link.service';
import { VisitSummaryHelperService } from 'src/app/services/visit-summary-helper.service';
import { AppConfigService } from 'src/app/services/app-config.service';
import { AiddxService, AiTxService } from 'aiddx-library';
import {
  AiDiagnosisResult, AiDiagnosisSuggestion, AiMedicationSuggestion, AiMissingDetailsError, AiTreatmentResult,
  AyuSuggestedQuestion, ComplaintDetail, DetailRow, DocItem, Patient, PastVisit, PrescriptionData,
  SuggestionLikelihood, SymptomGroup, TimelineGroup, VitalCell
} from './visit-summary-v2.models';
import { AI_CONFIDENCE_HIGH, AI_CONFIDENCE_MODERATE } from './doctor-note/doctor-note.constants';

const AI_REQUIRED_DETAILS: { label: string; numeric: boolean }[] = [
  { label: 'Age', numeric: true },
  { label: 'Weight (kg)', numeric: true },
  { label: 'Gender', numeric: false }
];

const AI_UNSPECIFIED = /\b(not\s+specified|unknown|none|n\/?a)\b/i;

export interface DraftDiagnosis { name: string; type: string; status: string; code: string; uuid: string; }
export interface DiagnosisOption { name: string; code: string; }
export interface DraftMedication { drug: string; dose: string; durationNo: string; durationUnit: string; instructRemark: string; frequency: string; uuid: string; }
export interface DraftAdvice { value: string; uuid: string; }
export interface DraftTest { value: string; uuid: string; }
export interface DraftReferral { speciality: string; facility: string; priority: string; reason: string; uuid: string; }
export interface DraftFollowUp { wantFollowUp: boolean; date: string; time: string; reason: string; type: string; uuid: string; }
export interface DraftTextItem { value: string; uuid: string; }
export interface DraftNote {
  diagnoses: DraftDiagnosis[];
  medications: DraftMedication[];
  advices: DraftAdvice[];
  tests: DraftTest[];
  referrals: DraftReferral[];
  followUp: DraftFollowUp | null;
  notes: DraftTextItem[];
  additionalInstruction: DraftTextItem | null;
}

export interface CurrentVisitData {
  visitUuid: string;
  visit: VisitModel;
  visitNoteExists: boolean;
  visitNoteUuid: string;
  patientUuid: string;
  specializations: string[];
  patient: Patient;
  patientModel: PatientModel;
  clinicName: string;
  visitEnded: boolean;
  visitNoteProviderUuids: string[];
  consultationDetails: DetailRow[];
  chiefComplaints: string[];
  complaintDetails: ComplaintDetail[];
  associatedSymptoms: SymptomGroup[];
  patientHistory: DetailRow[];
  familyHistory: DetailRow[];
  vitals: VitalCell[];
  generalExams: DetailRow[];
  abdomenFindings: string[];
  eyeImages: string[];
  documents: DocItem[];
}

@Injectable({ providedIn: 'root' })
export class VisitSummaryV2Service {
  private baseURL = environment.baseURL;

  constructor(
    private visitService: VisitService,
    private diagnosisService: DiagnosisService,
    private appointmentService: AppointmentService,
    private encounterService: EncounterService,
    private linkService: LinkService,
    private helper: VisitSummaryHelperService,
    private appConfigService: AppConfigService,
    private aiddxService: AiddxService,
    private aiTxService: AiTxService
  ) {}

  loadInteractionNote(patientUuid: string, visitUuid: string): Observable<DraftTextItem> {
    return this.diagnosisService.getObs(patientUuid, conceptIds.conceptNote).pipe(
      catchError(() => of({ results: [] } as ObsApiResponseModel)),
      map((res: ObsApiResponseModel) => {
        const obs = (res.results || []).filter((o: ObsModel) => o.encounter?.visit?.uuid === visitUuid).pop();
        return { value: obs?.value || '', uuid: obs?.uuid || '' };
      })
    );
  }

  saveInteractionNote(patientUuid: string, encounterUuid: string, value: string, existingUuid?: string): Observable<ObsModel> {
    return this.writeObs(conceptIds.conceptNote, patientUuid, encounterUuid, value, existingUuid);
  }

  /**
  * Read the 'Patient Interaction' visit attribute for a visit
  */
  getPatientInteraction(visit: VisitModel): { value: string; uuid: string } {
    const attr = (visit?.attributes || []).find(
      (a: any) => a?.attributeType?.display === visitTypes.PATIENT_INTERACTION
    );
    return { value: (attr as any)?.value || '', uuid: (attr as any)?.uuid || '' };
  }

  /**
  * Create or update the 'Patient Interaction' visit attribute
  */
  savePatientInteraction(visitUuid: string, value: string, existingUuid?: string): Observable<any> {
    const payload = { attributeType: visitAttributeTypes.PatientInteraction, value };
    return existingUuid
      ? this.visitService.updateAttribute(visitUuid, existingUuid, payload)
      : this.visitService.postAttribute(visitUuid, payload);
  }

  missingAiDetails(caseText: string): string[] {
    return AI_REQUIRED_DETAILS
      .filter(({ label, numeric }) => {
        const value = this.extractDetail(caseText, label);
        if (!value) { return true; }
        return numeric && (AI_UNSPECIFIED.test(value) || !/\d/.test(value));
      })
      .map(({ label }) => label);
  }

  private extractDetail(caseText: string, label: string): string {
    const key = label.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const match = new RegExp(`\\b${key}\\s*[:=-]\\s*([^\\n\\r,;]+)`, 'i').exec(caseText || '');
    return (match?.[1] || '').trim();
  }

  loadAiDiagnosis(patientInfo: PatientModel, visit: VisitModel, notes = '', prescriptionShared = false): Observable<AiDiagnosisResult> {
    const casehistory = this.aiddxService.getDDxPayload(patientInfo, visit, notes);
    const missing = this.missingAiDetails(casehistory);
    if (missing.length) {
      return throwError(() => new AiMissingDetailsError(missing));
    }
    return this.aiddxService.getAIDiagnosis(casehistory, visit?.uuid, prescriptionShared).pipe(
      map((res: any) => this.buildAiDiagnosisResult(res))
    );
  }

  private buildAiDiagnosisResult(res: any): AiDiagnosisResult {
    const results = res?.result?.data?.result || [];
    const questions = res?.result?.data?.further_questions || [];
    return {
      summary: res?.conclusion || res?.result?.data?.conclusion || '',
      suggestions: results.map((r: any) => ({
        name: r?.diagnosis || '',
        likelihood: this.mapLikelihood(r?.likelihood),
        confidence: this.mapProbability(r?.probability),
        reasons: this.buildRationale(r)
      })).filter((s: AiDiagnosisSuggestion) => !!s.name),
      questions: questions.map((q: any) => {
        const key = Object.keys(q || {})[0] || '';
        const text = q?.[key] || '';
        const hint = text.match(/\(([^)]*)\)\s*$/);
        return {
          category: /^\d+$/.test(key) ? '' : key,
          question: hint ? text.replace(hint[0], '').trim() : text,
          hint: hint ? hint[1] : '',
          answer: ''
        };
      }).filter((q: AyuSuggestedQuestion) => !!q.question)
    };
  }

  private mapProbability(value: any): number | null {
    if (value === null || value === undefined || value === '') { return null; }
    const num = Number(value);
    if (isNaN(num)) { return null; }
    return Math.round(num <= 1 ? num * 100 : num);
  }

  private mapLikelihood(value: string): SuggestionLikelihood {
    const likelihood = (value || '').toLowerCase();
    if (likelihood.includes('high')) { return 'High'; }
    if (likelihood.includes('moderate') || likelihood.includes('medium')) { return 'Moderate'; }
    return 'Less';
  }

  loadAiTreatment(patientInfo: PatientModel, visit: VisitModel, diagnosis: string, prescriptionShared = false): Observable<AiTreatmentResult> {
    const casehistory = this.aiTxService.getTxPayload(patientInfo, visit);
    const missing = this.missingAiDetails(casehistory);
    if (missing.length) {
      return throwError(() => new AiMissingDetailsError(missing));
    }
    this.aiTxService.clearCache();
    return this.aiTxService.getAITTx(casehistory, diagnosis, visit?.uuid, prescriptionShared).pipe(
      map((res: any) => this.buildAiTreatmentResult(res))
    );
  }

  private buildAiTreatmentResult(res: any): AiTreatmentResult {
    const data = res?.result?.data || {};
    return {
      medicines: (data.medications || data.result || []).map((m: any) => ({
        name: m?.name || '',
        label: m?.name || '',
        likelihood: this.mapConfidence(m?.confidence),
        confidence: this.mapProbability(m?.confidence),
        reasons: this.toReasonList(m?.rationale),
        timing: m?.frequency || '',
        strength: m?.dosage || '',
        days: m?.duration ? `${m.duration}` : '',
        durationUnit: m?.duration_unit || '',
        remarks: m?.instructions || ''
      })).filter((m: AiMedicationSuggestion) => !!m.name),
      advices: (data.medical_advice || []).map((a: any) => a?.v || a).filter(Boolean),
      tests: (data.tests_to_be_done || []).map((t: any) => t?.test_name || t).filter(Boolean),
      referrals: (data.referral || []).map((r: any) => ({
        speciality: r?.referral_to || '',
        facility: r?.referral_facility || '',
        priority: '',
        reason: r?.remark || ''
      })).filter((r: any) => !!r.speciality),
      followUp: (data.follow_up || []).filter((f: any) => f?.follow_up_duration).map((f: any) => ({
        required: f?.follow_up_required,
        duration: f?.follow_up_duration || '',
        reason: f?.reason_for_follow_up || ''
      }))[0] || null
    };
  }

  private mapConfidence(value: any): SuggestionLikelihood {
    if (typeof value === 'string') { return this.mapLikelihood(value); }
    const confidence = Number(value);
    if (isNaN(confidence)) { return 'Less'; }
    const score = confidence > 1 ? confidence / 100 : confidence;
    if (score >= AI_CONFIDENCE_HIGH) { return 'High'; }
    if (score >= AI_CONFIDENCE_MODERATE) { return 'Moderate'; }
    return 'Less';
  }

  private toReasonList(rationale: any): string[] {
    if (!rationale) { return []; }
    if (Array.isArray(rationale)) {
      return rationale.reduce((acc: string[], r: any) =>
        acc.concat(typeof r === 'string' ? [r] : Object.values(r || {}) as string[]), []);
    }
    return [`${rationale}`];
  }

  private buildRationale(result: any): string[] {
    if (result?.summarised_rationale?.length) { return result.summarised_rationale; }
    if (Array.isArray(result?.rationale)) {
      return result.rationale.flatMap((r: any) => Object.values(r || {})) as string[];
    }
    return [];
  }

  loadCurrentVisit(uuid: string): Observable<CurrentVisitData> {
    return this.visitService.fetchVisitDetails(uuid).pipe(
      switchMap((visit: VisitModel) => {
        if (!visit) { return EMPTY; }
        const patientUuid = visit.patient?.uuid || '';
        return forkJoin({
          patient: this.visitService.patientInfo(patientUuid),
          appointment: this.appointmentService.getAppointment(visit.uuid).pipe(catchError(() => of(null))),
          eyeImages: this.diagnosisService.getObs(patientUuid, conceptIds.conceptPhysicalExamination).pipe(catchError(() => of({ results: [] } as ObsApiResponseModel))),
          docs: this.diagnosisService.getObs(patientUuid, conceptIds.conceptAdditionlDocument).pipe(catchError(() => of({ results: [] } as ObsApiResponseModel)))
        }).pipe(map(res => this.assemble(visit, res.patient, res.appointment, res.eyeImages, res.docs)));
      })
    );
  }

  loadPastVisits(patientUuid: string, currentVisitUuid: string): Observable<TimelineGroup[]> {
    return this.visitService.recentVisits(patientUuid).pipe(
      switchMap((res: any) => {
        const visits: VisitModel[] = (res?.results || []).filter((v: VisitModel) => v.uuid !== currentVisitUuid);
        if (!visits.length) { return of([] as TimelineGroup[]); }
        return forkJoin(
          visits.map(v => this.visitService.fetchVisitDetails(v.uuid).pipe(catchError(() => of(null))))
        ).pipe(map((details: (VisitModel | null)[]) => this.groupPastVisits(details.filter(Boolean) as VisitModel[])));
      })
    );
  }

  private groupPastVisits(visits: VisitModel[]): TimelineGroup[] {
    const sorted = [...visits].sort((a, b) => this.time(b.startDatetime) - this.time(a.startDatetime));
    const groups: TimelineGroup[] = [];
    sorted.forEach(v => {
      const date = this.formatGroupDate(v.startDatetime);
      let g = groups.find(x => x.date === date);
      if (!g) { g = { date, visits: [] }; groups.push(g); }
      g.visits.push(this.buildPastVisit(v));
    });
    if (groups.length) { groups[0].current = true; }
    return groups;
  }

  private buildPastVisit(visit: VisitModel): PastVisit {
    const encounters = visit.encounters || [];
    const cc = this.parseCheckUpReason(encounters);
    const mh = this.parseMedicalHistory(encounters);
    const pe = this.parsePhysicalExam(encounters);
    const prescription = this.parsePrescription(encounters);
    const referred = this.obsByConcept(encounters, conceptIds.conceptReferral).length > 0;
    const docName = prescription.doctor.name || '';
    const firstMed = prescription.meds[0];
    return {
      key: visit.uuid,
      title: prescription.diagnosis[0]?.name || cc.chiefComplaints[0] || 'Visit',
      med: firstMed ? `${firstMed.drug} ${firstMed.dose}`.trim() : '',
      by: docName ? (referred ? `Reff. to ${docName}` : `Seen by ${docName}`) : '',
      referred,
      diagnosis: prescription.diagnosis[0]?.name || '',
      consultation: this.buildPastConsultation(visit),
      chiefComplaints: cc.chiefComplaints,
      prescription,
      complaintDetails: cc.complaintDetails,
      associatedSymptoms: cc.associatedSymptoms,
      patientHistory: mh.patientHistory,
      familyHistory: mh.familyHistory,
      vitals: this.buildVitals(encounters),
      generalExams: pe.generalExams,
      abdomenFindings: pe.abdomenFindings,
      eyeImages: this.imageSrcsFromEncounters(encounters, conceptIds.conceptPhysicalExamination),
      documents: this.docsFromEncounters(encounters)
    };
  }

  private buildPastConsultation(visit: VisitModel): DetailRow[] {
    return [
      { label: 'Visit ID', value: this.maskVisitId(visit.uuid) },
      { label: 'Visit started', value: this.formatDateTime(visit.startDatetime) },
      { label: 'Status', value: this.getVisitStatus(visit.encounters || []) }
    ];
  }

  private parsePrescription(encounters: EncounterModel[]): PrescriptionData {
    const diagnosis = this.obsByConcept(encounters, conceptIds.conceptDiagnosis)
      .map(o => this.diagnosisFromValue(o.value)).filter(d => d.name);
    const meds = this.obsByConcept(encounters, conceptIds.conceptMed).map(o => this.medFromValue(o.value));
    const notes = this.obsByConcept(encounters, conceptIds.conceptNote).map(o => o.value).filter(v => !!v && !!String(v).trim());
    const advice = this.obsByConcept(encounters, conceptIds.conceptAdvice).filter(o => !o.value.includes('</a>')).map(o => o.value);
    const tests = this.obsByConcept(encounters, conceptIds.conceptTest).map(o => o.value);
    const instructions = this.obsByConcept(encounters, conceptIds.conceptFollowUpInstruction).map(o => o.value);
    const refObs = this.obsByConcept(encounters, conceptIds.conceptReferral);
    const fuObs = this.obsByConcept(encounters, conceptIds.conceptFollow);
    return {
      doctor: this.doctorFromEncounters(encounters),
      diagnosis,
      notes,
      meds,
      instructions,
      advice,
      tests,
      referral: refObs.length ? this.referralFromValue(refObs[0].value) : { to: '', facility: '', priority: '', reason: '' },
      followUp: fuObs.length ? this.followUpForPrescription(fuObs[0].value) : { suggested: 'No', date: '', time: '', reason: '' },
      docs: this.obsByConcept(encounters, conceptIds.conceptAdditionlDocument).map(o => ({ name: o.comment || 'Attachment' }))
    };
  }

  private doctorFromEncounters(encounters: EncounterModel[]): { name: string; qualifications: string; speciality: string } {
    let doctor = { name: '', qualifications: '', speciality: '' };
    encounters.forEach(enc => {
      (enc.obs || []).forEach((o: ObsModel) => {
        if (o.concept?.display === 'Doctor details') {
          try {
            const d = JSON.parse(o.value);
            doctor = { name: d.name || '', qualifications: d.Qualification || '', speciality: d.specialization || '' };
          } catch { }
        }
      });
    });
    return doctor;
  }

  private diagnosisFromValue(value: string): { name: string; type: string; status: string } {
    if (value.includes('}')) { return { name: '', type: '', status: '' }; }
    let parts = value.split(':');
    if (value.includes('::')) { parts = value.split('::').pop()?.split(':') || []; }
    const typeStatus = parts?.[1]?.split('&');
    return { name: parts?.[0]?.trim() ?? '', type: typeStatus?.[0]?.trim() ?? '', status: typeStatus?.[1]?.trim() ?? '' };
  }

  private medFromValue(value: string): { drug: string; dose: string; durationNo: string; durationUnit: string; instructRemark: string; frequency: string } {
    const v = value.split(':');
    return { drug: v[0] ?? '', dose: v[1] ?? '', durationNo: v[2] ?? '', durationUnit: v[3] ?? '', instructRemark: v[4] ?? '', frequency: v[5] ?? '' };
  }

  private referralFromValue(value: string): { to: string; facility: string; priority: string; reason: string } {
    const v = value.split(':');
    return { to: v[0]?.trim() ?? '', facility: v[1]?.trim() ?? '', priority: v[2]?.trim() ?? '', reason: v[3]?.trim() ? v[3].trim() : '-' };
  }

  private followUpForPrescription(value: string): { suggested: string; date: string; time: string; reason: string } {
    const parts = value.split(',').filter(Boolean);
    return {
      suggested: 'Yes',
      date: this.formatDate(parts[0]),
      time: parts.find((p: string) => p.includes('Time:'))?.split('Time:')?.[1]?.trim() || '',
      reason: parts.find((p: string) => p.includes('Remark:'))?.split('Remark:')?.[1]?.trim() || ''
    };
  }

  private obsByConcept(encounters: EncounterModel[], conceptUuid: string): ObsModel[] {
    const out: ObsModel[] = [];
    encounters.forEach(enc => (enc.obs || []).forEach((o: ObsModel) => {
      if (o.concept?.uuid === conceptUuid) { out.push(o); }
    }));
    return out;
  }

  private imageSrcsFromEncounters(encounters: EncounterModel[], conceptUuid: string): string[] {
    return this.obsByConcept(encounters, conceptUuid).map(o => `${this.baseURL}/obs/${o.uuid}/value`);
  }

  private docsFromEncounters(encounters: EncounterModel[]): DocItem[] {
    return this.obsByConcept(encounters, conceptIds.conceptAdditionlDocument)
      .map(o => ({ type: 'image' as const, src: `${this.baseURL}/obs/${o.uuid}/value` }));
  }

  private time(d: any): number { const t = new Date(d).getTime(); return isNaN(t) ? 0 : t; }
  private formatGroupDate(d: any): string {
    const dt = new Date(d);
    return isNaN(dt.getTime()) ? '' : dt.toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' });
  }

  createVisitNote(visit: VisitModel, providerUuid: string): Observable<EncounterModel> {
    return this.encounterService.postEncounter({
      patient: visit.patient?.uuid,
      encounterType: 'd7151f82-c1f3-4152-a605-2f9ea7414a79',
      encounterProviders: [
        { provider: providerUuid, encounterRole: '73bbb069-9781-4afc-a9d1-54b6b2270e03' }
      ],
      visit: visit.uuid,
      encounterDatetime: new Date(Date.now() - 30000)
    });
  }

  reassignSpeciality(visit: VisitModel, speciality: string, providerUuid: string): Observable<any> {
    const attr = this.helper.checkIfAttributeExists(visit.attributes || []);
    if (attr) {
      return this.visitService
        .updateAttribute(visit.uuid, attr.uuid, { attributeType: attr.attributeType?.uuid, value: speciality })
        .pipe(switchMap(() => this.postReferEncounter(visit, providerUuid)));
    }
    return this.postReferEncounter(visit, providerUuid);
  }

  private postReferEncounter(visit: VisitModel, providerUuid: string): Observable<any> {
    return this.encounterService.postEncounter({
      patient: visit.patient?.uuid,
      encounterType: '8d5b27bc-c2cc-11de-8d13-0010c6dffd0f',
      encounterProviders: [
        { provider: providerUuid, encounterRole: '73bbb069-9781-4afc-a9d1-54b6b2270e04' }
      ],
      visit: visit.uuid,
      encounterDatetime: new Date(Date.now() - 30000)
    });
  }

  loadDraftNote(patientUuid: string, visitUuid: string): Observable<DraftNote> {
    const getObs = (concept: string) =>
      this.diagnosisService.getObs(patientUuid, concept).pipe(catchError(() => of({ results: [] } as ObsApiResponseModel)));
    return forkJoin({
      diagnosis: getObs(conceptIds.conceptDiagnosis),
      medication: getObs(conceptIds.conceptMed),
      advice: getObs(conceptIds.conceptAdvice),
      test: getObs(conceptIds.conceptTest),
      referral: getObs(conceptIds.conceptReferral),
      followUp: getObs(conceptIds.conceptFollow),
      note: getObs(conceptIds.conceptNote),
      adviceList: this.getAdvicesList()
    }).pipe(map(res => {
      const adviceNames: string[] = res.adviceList;
      const { advices, additionalInstruction } = this.parseAdviceAndInstruction(res.advice, visitUuid, adviceNames);
      return {
        diagnoses: this.parseDiagnoses(res.diagnosis, visitUuid),
        medications: this.parseMedications(res.medication, visitUuid),
        advices,
        additionalInstruction,
        tests: this.parseTests(res.test, visitUuid),
        referrals: this.parseReferrals(res.referral, visitUuid),
        followUp: this.parseFollowUp(res.followUp, visitUuid),
        notes: this.parseTextItems(res.note, visitUuid)
      };
    }));
  }

  private parseTextItems(res: ObsApiResponseModel, visitUuid: string): DraftTextItem[] {
    return (res.results || [])
      .filter((obs: ObsModel) => obs.encounter?.visit?.uuid === visitUuid)
      .map((obs: ObsModel) => ({ value: obs.value, uuid: obs.uuid || '' }));
  }

  private parseAdviceAndInstruction(res: ObsApiResponseModel, visitUuid: string, adviceNames: string[]): { advices: DraftAdvice[]; additionalInstruction: DraftTextItem | null } {
    const obsList = (res.results || []).filter((obs: ObsModel) =>
      obs.encounter?.visit?.uuid === visitUuid && !obs.value.includes('</a>'));
    let additionalInstruction: DraftTextItem | null = null;
    obsList.forEach((obs: ObsModel) => {
      if (this.isAdditionalInstruction(obs.value, adviceNames)) {
        additionalInstruction = { value: obs.value, uuid: obs.uuid || '' };
      }
    });
    const advices = obsList
      .filter((obs: ObsModel) => obs.uuid !== additionalInstruction?.uuid)
      .map((obs: ObsModel) => ({ value: obs.value, uuid: obs.uuid || '' }));
    return { advices, additionalInstruction };
  }

  private isAdditionalInstruction(value: string, adviceNames: string[]): boolean {
    if (value.includes(':') && value.split(':').length >= 3) { return false; }
    return !adviceNames.includes(value);
  }

  private parseDiagnoses(res: ObsApiResponseModel, visitUuid: string): DraftDiagnosis[] {
    const out: DraftDiagnosis[] = [];
    (res.results || []).forEach((obs: ObsModel) => {
      if (obs.encounter?.visit?.uuid !== visitUuid) { return; }
      if (obs.value.includes('}')) { return; }
      let obsValues = obs.value.split(':');
      const code = obs.value.includes('::') ? (obs.value.split('::')[0]?.trim() || 'NA') : 'NA';
      if (obs.value.includes('::')) { obsValues = obs.value.split('::').pop()?.split(':') || []; }
      const typeStatus = obsValues?.[1]?.split('&');
      out.push({
        name: obsValues?.[0]?.trim() ?? '',
        type: typeStatus?.[0]?.trim() ?? '',
        status: typeStatus?.[1]?.trim() ?? '',
        code,
        uuid: obs.uuid || ''
      });
    });
    return out;
  }

  private parseMedications(res: ObsApiResponseModel, visitUuid: string): DraftMedication[] {
    const out: DraftMedication[] = [];
    (res.results || []).forEach((obs: ObsModel) => {
      if (obs.encounter?.visit?.uuid !== visitUuid) { return; }
      const v = obs.value.split(':');
      out.push({
        drug: v[0] ?? '', dose: v[1] ?? '', durationNo: v[2] ?? '', durationUnit: v[3] ?? '',
        instructRemark: v[4] ?? '', frequency: v[5] ?? '', uuid: obs.uuid || ''
      });
    });
    return out;
  }

  private parseTests(res: ObsApiResponseModel, visitUuid: string): DraftTest[] {
    return (res.results || [])
      .filter((obs: ObsModel) => obs.encounter?.visit?.uuid === visitUuid)
      .map((obs: ObsModel) => ({ value: obs.value, uuid: obs.uuid || '' }));
  }

  private parseReferrals(res: ObsApiResponseModel, visitUuid: string): DraftReferral[] {
    const out: DraftReferral[] = [];
    (res.results || []).forEach((obs: ObsModel) => {
      if (obs.encounter?.visit?.uuid !== visitUuid) { return; }
      const v = obs.value.split(':');
      if (v.length <= 1) { return; }
      out.push({
        speciality: v[0]?.trim() ?? '',
        facility: v[1]?.trim() ?? '',
        priority: v[2]?.trim() ?? '',
        reason: v[3]?.trim() ? v[3].trim() : '-',
        uuid: obs.uuid || ''
      });
    });
    return out;
  }

  private parseFollowUp(res: ObsApiResponseModel, visitUuid: string): DraftFollowUp | null {
    let followUp: DraftFollowUp | null = null;
    (res.results || []).forEach((obs: ObsModel) => {
      if (obs.encounter?.visit?.uuid !== visitUuid) { return; }
      let date = '', time = '', reason = '', type = '';
      if (obs.value.includes('Time:') || obs.value.includes('Remark:')) {
        const parts = obs.value.split(',').filter(Boolean);
        date = this.toDateInput(parts[0]);
        reason = parts.find((p: string) => p.includes('Remark:'))?.split('Remark:')?.[1]?.trim() || '';
        time = parts.find((p: string) => p.includes('Time:'))?.split('Time:')?.[1]?.trim() || '';
        type = parts.find((p: string) => p.includes('Type:'))?.split('Type:')?.[1]?.trim() || '';
        if (type === 'null') { type = ''; }
        if (reason === 'null') { reason = ''; }
      } else {
        date = this.toDateInput(obs.value);
      }
      followUp = { wantFollowUp: true, date, time, reason, type, uuid: obs.uuid || '' };
    });
    return followUp;
  }

  private toDateInput(d: any): string {
    if (!d) { return ''; }
    const date = new Date(d);
    if (isNaN(date.getTime())) { return ''; }
    return date.toISOString().slice(0, 10);
  }

  saveDiagnosis(patientUuid: string, encounterUuid: string, dx: { name: string; type: string; status: string; code?: string }, existingUuid?: string): Observable<ObsModel> {
    const code = dx.code || 'NA';
    return this.writeObs(conceptIds.conceptDiagnosis, patientUuid, encounterUuid, `${code}::${dx.name}:${dx.type} & ${dx.status}`, existingUuid);
  }

  getAdvicesList(): Observable<string[]> {
    return this.conceptAnswers('0308000d-77a2-46e0-a6fa-a8c1dcbc3141');
  }

  getTestsList(): Observable<string[]> {
    return this.conceptAnswers(conceptIds.conceptInvestigationsTest);
  }

  private conceptAnswers(conceptUuid: string): Observable<string[]> {
    return this.diagnosisService.concept(conceptUuid).pipe(
      map((res: any) => (res?.answers || []).map((a: any) => a.display).filter(Boolean)),
      catchError(() => of([] as string[]))
    );
  }

  searchDiagnosis(term: string): Observable<DiagnosisOption[]> {
    return this.diagnosisService.getSnomedCTDiagnosisList(term).pipe(
      map((res: any) => (res?.data || [])
        .filter((e: any) => e?.concept_name)
        .map((e: any) => ({ name: e.concept_name, code: e.snomedCTCode }))),
      catchError(() => of([] as DiagnosisOption[]))
    );
  }

  saveMedication(patientUuid: string, encounterUuid: string, med: { drug: string; dose: string; durationNo: string; durationUnit: string; instructRemark: string; frequency: string }, existingUuid?: string): Observable<ObsModel> {
    return this.writeObs(conceptIds.conceptMed, patientUuid, encounterUuid, `${med.drug ?? ''}:${med.dose ?? ''}:${med.durationNo ?? ''}:${med.durationUnit ?? ''}:${med.instructRemark ?? ''}:${med.frequency ?? ''}`, existingUuid);
  }

  saveAdvice(patientUuid: string, encounterUuid: string, value: string): Observable<ObsModel> {
    return this.postObs(conceptIds.conceptAdvice, patientUuid, encounterUuid, value);
  }

  saveTest(patientUuid: string, encounterUuid: string, value: string): Observable<ObsModel> {
    return this.postObs(conceptIds.conceptTest, patientUuid, encounterUuid, value);
  }

  saveReferral(patientUuid: string, encounterUuid: string, ref: { speciality: string; facility: string; priority: string; reason: string }): Observable<ObsModel> {
    return this.postObs(conceptIds.conceptReferral, patientUuid, encounterUuid, `${ref.speciality}:${ref.facility}:${ref.priority}:${ref.reason}`);
  }

  saveNote(patientUuid: string, encounterUuid: string, value: string): Observable<ObsModel> {
    return this.postObs(conceptIds.conceptNote, patientUuid, encounterUuid, value);
  }

  saveAdditionalInstruction(patientUuid: string, encounterUuid: string, value: string, existingUuid?: string): Observable<ObsModel> {
    return this.writeObs(conceptIds.conceptAdvice, patientUuid, encounterUuid, value, existingUuid);
  }

  saveFollowUp(patientUuid: string, encounterUuid: string, fu: { date: string; time: string; reason: string; type: string }, existingUuid?: string): Observable<ObsModel> {
    let value = fu.date;
    if (fu.time) { value += `,Time:${fu.time}`; }
    value += `,Remark:${fu.reason || ''}`;
    if (fu.type) { value += `,Type:${fu.type}`; }
    if (existingUuid) {
      return this.encounterService.updateObs(existingUuid, { concept: conceptIds.conceptFollow, person: patientUuid, obsDatetime: new Date(), value, encounter: encounterUuid });
    }
    return this.postObs(conceptIds.conceptFollow, patientUuid, encounterUuid, value);
  }

  getReferralSpecialities(): string[] {
    const values = (this.appConfigService as any).dropdown_values?.['refer specialisation'] || [];
    return values.filter((v: any) => v?.is_enabled).map((v: any) => v.name).filter(Boolean);
  }

  getFollowUpTimeSlots(date?: string): string[] {
    return this.helper.getHours(false, date) || [];
  }

  deleteObs(uuid: string): Observable<any> {
    return this.diagnosisService.deleteObs(uuid);
  }

  completeVisit(visitUuid: string, patientUuid: string, provider: any): Observable<any> {
    return this.encounterService.postEncounter({
      patient: patientUuid,
      encounterType: 'bd1fbfaa-f5fb-4ebd-b75c-564506fc309e',
      encounterProviders: [
        { provider: provider?.uuid, encounterRole: '73bbb069-9781-4afc-a9d1-54b6b2270e03' }
      ],
      visit: visitUuid,
      encounterDatetime: new Date(Date.now() - 30000),
      obs: [
        { concept: '7a9cb7bc-9ab9-4ff0-ae82-7a1bd2cca93e', value: JSON.stringify(this.buildDoctorDetails(provider)) }
      ]
    }).pipe(tap(() => {
      this.appointmentService.completeAppointment({ visitUuid }).subscribe({ error: () => {} });
      this.linkService.shortUrl(`/i/${visitUuid}`).subscribe({
        next: (res: ApiResponseModel) => {
          const hash = res?.data?.hash;
          if (hash) {
            this.visitService.postAttribute(visitUuid, {
              attributeType: '1e02db7e-e117-4b16-9a1e-6e583c3994da',
              value: `/i/${hash}`
            }).subscribe({ error: () => {} });
          }
        },
        error: () => {}
      });
    }));
  }

  private buildDoctorDetails(provider: any): any {
    const d: any = {};
    if (!provider) { return d; }
    const attrs: string[] = [
      doctorDetails.QUALIFICATION, doctorDetails.FONT_OF_SIGN, doctorDetails.WHATS_APP,
      doctorDetails.REGISTRATION_NUMBER, doctorDetails.CONSULTATION_LANGUAGE, doctorDetails.TYPE_OF_PROFESSION,
      doctorDetails.ADDRESS, doctorDetails.WORK_EXPERIENCE, doctorDetails.RESEARCH_EXPERIENCE,
      doctorDetails.TEXT_OF_SIGN, doctorDetails.SPECIALIZATION, doctorDetails.PHONE_NUMBER,
      doctorDetails.COUNTRY_CODE, doctorDetails.EMAIL_ID, doctorDetails.WORK_EXPERIENCE_DETAILS,
      doctorDetails.SIGNATURE_TYPE, doctorDetails.SIGNATURE
    ];
    d.name = provider.person?.display;
    d.uuid = provider.uuid;
    (provider.attributes || []).forEach((pattr: any) => {
      if (!pattr.voided && attrs.includes(pattr.attributeType?.display)) {
        d[pattr.attributeType.display] = pattr.value;
      }
    });
    return d;
  }

  private postObs(concept: string, patientUuid: string, encounterUuid: string, value: string): Observable<ObsModel> {
    return this.encounterService.postObs({
      concept,
      person: patientUuid,
      obsDatetime: new Date(),
      value,
      encounter: encounterUuid
    });
  }

  private writeObs(concept: string, patientUuid: string, encounterUuid: string, value: string, existingUuid?: string): Observable<ObsModel> {
    if (existingUuid) {
      return this.encounterService.updateObs(existingUuid, {
        concept, person: patientUuid, obsDatetime: new Date(), value, encounter: encounterUuid
      });
    }
    return this.postObs(concept, patientUuid, encounterUuid, value);
  }

  private assemble(
    visit: VisitModel,
    patient: PatientModel,
    appointment: ApiResponseModel | null,
    eyeImagesRes: ObsApiResponseModel,
    docsRes: ObsApiResponseModel
  ): CurrentVisitData {
    const encounters = visit.encounters || [];
    const clinicName = visit.location?.display || '';
    const visitStatus = this.getVisitStatus(encounters);
    const vitals = this.buildVitals(encounters);
    const { chiefComplaints, complaintDetails, associatedSymptoms } = this.parseCheckUpReason(encounters);
    const { generalExams, abdomenFindings } = this.parsePhysicalExam(encounters);
    const { patientHistory, familyHistory } = this.parseMedicalHistory(encounters);

    const visitNote = this.helper.checkIfEncounterExists(encounters, visitTypes.VISIT_NOTE);
    return {
      visitUuid: visit.uuid,
      visit,
      visitNoteExists: !!visitNote,
      visitNoteUuid: visitNote?.uuid || '',
      patientUuid: visit.patient?.uuid || '',
      specializations: ((this.appConfigService as any).specialization || []).map((s: any) => s.name).filter(Boolean),
      patient: this.buildPatient(patient, vitals, patientHistory),
      patientModel: patient,
      clinicName,
      visitEnded: !!this.helper.checkIfEncounterExists(encounters, visitTypes.PATIENT_EXIT_SURVEY) || !!visit.stopDatetime,
      visitNoteProviderUuids: (visitNote?.encounterProviders || []).map((ep: any) => ep?.provider?.uuid).filter(Boolean),
      consultationDetails: this.buildConsultationDetails(visit, appointment, visitStatus, clinicName),
      chiefComplaints,
      complaintDetails,
      associatedSymptoms,
      patientHistory,
      familyHistory,
      vitals,
      generalExams,
      abdomenFindings,
      eyeImages: this.buildImageSources(eyeImagesRes, visit.uuid),
      documents: this.buildDocuments(docsRes, visit.uuid)
    };
  }

  private buildPatient(patient: PatientModel, vitals: VitalCell[], patientHistory: DetailRow[]): Patient {
    const p: any = patient.person;
    const name = [p?.preferredName?.givenName, p?.preferredName?.middleName, p?.preferredName?.familyName]
      .filter(Boolean).join(' ').trim();

    const weightVital = vitals.find(v => /weight/i.test(v.label));
    const allergyRow = patientHistory.find(r => /allergies/i.test(r.label));
    const pregnancyRow = patientHistory.find(r => /pregnan/i.test(r.label));

    const allergyNames = this.parseAllergyNames(allergyRow?.value);
    const contactNo = this.personAttr(patient, 'Telephone Number');
    const gender = this.mapGender(p?.gender);
    const isMale = gender === 'Male';

    return {
      name: name || (p?.display || ''),
      gender,
      tag: !isMale && pregnancyRow && !/^\s*(no|not)\b/i.test(pregnancyRow.value || '') ? 'Pregnant' : '',
      openMrsId: this.patientIdentifier(patient, 'OpenMRS ID'),
      avatar: `${this.baseURL}/personimage/${p?.uuid}`,
      age: p?.age != null ? `${p.age} Years` : '',
      weight: weightVital?.value ? `${weightVital.value}Kg` : '',
      allergies: allergyNames.slice(0, 2),
      extraAllergiesCount: Math.max(allergyNames.length - 2, 0),
      pregnancy: isMale ? '' : (pregnancyRow?.value || ''),
      contactNo: contactNo !== 'NA' ? contactNo : '',
      occupation: this.valOrEmpty(this.personAttr(patient, 'occupation')),
      dateOfBirth: this.formatDate(p?.birthdate),
      allAllergies: allergyNames.map(n => ({ name: n, severe: false })),
      contacts: contactNo !== 'NA' ? [{ no: contactNo, type: 'call' }] : [],
      address: this.buildAddress(p?.preferredAddress),
      other: this.buildOther(patient)
    };
  }

  private buildAddress(addr: any): DetailRow[] {
    if (!addr) { return []; }
    const rows: DetailRow[] = [
      { label: 'Household number', value: addr.address1 },
      { label: 'Corresponding address 1', value: addr.address2 },
      { label: 'Village/Town/City', value: addr.cityVillage },
      { label: 'State', value: addr.stateProvince },
      { label: 'Country', value: addr.country },
      { label: 'Postal Code', value: addr.postalCode }
    ];
    return rows.filter(r => r.value).map(r => ({ label: r.label, value: String(r.value) }));
  }

  private buildOther(patient: PatientModel): DetailRow[] {
    const rows: DetailRow[] = [
      { label: 'National ID', value: this.personAttr(patient, 'NationalID') },
      { label: 'Occupation', value: this.personAttr(patient, 'occupation') }
    ];
    return rows.filter(r => r.value && r.value !== 'NA');
  }

  private buildConsultationDetails(
    visit: VisitModel, appointment: ApiResponseModel | null, visitStatus: string, clinicName: string
  ): DetailRow[] {
    const apptDate = appointment?.data?.slotJsDate;
    return [
      { label: 'Visit ID', value: this.maskVisitId(visit.uuid) },
      { label: 'Appointment on', value: apptDate ? this.formatDate(apptDate) : 'No appointment' },
      { label: 'Visit created', value: this.formatDateTime(visit.startDatetime) },
      { label: 'Status', value: visitStatus, highlight: visitStatus === visitTypes.PRIORITY_VISIT },
      { label: 'Visit uploaded', value: this.formatDateTime((visit as any).dateCreated) },
      { label: 'Location', value: this.titleCase(clinicName) }
    ];
  }

  private getVisitStatus(encounters: EncounterModel[]): string {
    if (this.helper.checkIfEncounterExists(encounters, visitTypes.PATIENT_EXIT_SURVEY)) { return visitTypes.ENDED_VISIT; }
    if (this.helper.checkIfEncounterExists(encounters, visitTypes.VISIT_COMPLETE)) { return visitTypes.COMPLETED_VISIT; }
    if (this.helper.checkIfEncounterExists(encounters, visitTypes.VISIT_NOTE)) { return visitTypes.IN_PROGRESS_VISIT; }
    if (this.helper.checkIfEncounterExists(encounters, visitTypes.FLAGGED)) { return visitTypes.PRIORITY_VISIT; }
    if (this.helper.checkIfEncounterExists(encounters, visitTypes.ADULTINITIAL) ||
        this.helper.checkIfEncounterExists(encounters, visitTypes.VITALS)) { return visitTypes.AWAITING_VISIT; }
    return '';
  }

  private buildVitals(encounters: EncounterModel[]): VitalCell[] {
    const vitalObs = this.getVitalObs(encounters);
    const config: VitalModel[] = [...(this.appConfigService.patient_vitals || [])];
    return config.map(v => {
      const value = this.getObsValue(v.uuid, v.key, vitalObs, config);
      return {
        label: v.name,
        value: value ?? (/blood\s*group/i.test(v.name || '') ? 'NA' : '')
      };
    });
  }

  private getVitalObs(encounters: EncounterModel[]): ObsModel[] {
    const enc = encounters.find(e => e.encounterType?.display === visitTypes.VITALS);
    return enc?.obs || [];
  }

  private getObsValue(uuid: string, key: string, vitalObs: ObsModel[], config: VitalModel[]): any {
    const v = vitalObs.find(e => e.concept?.uuid === uuid);
    const value: any = v?.value ? (typeof v.value === 'object' ? (v.value as any)?.display : v.value) : null;
    if (!value && key === 'bmi') {
      return calculateBMI(config, vitalObs);
    }
    if (value && key && key.toLowerCase().includes('temp')) {
      const converted = convertCelsiusToFahrenheit(parseFloat(value));
      return converted !== null ? converted : value;
    }
    return value;
  }

  private parseCheckUpReason(encounters: EncounterModel[]): {
    chiefComplaints: string[]; complaintDetails: ComplaintDetail[]; associatedSymptoms: SymptomGroup[];
  } {
    const chiefComplaints: string[] = [];
    const complaintDetails: ComplaintDetail[] = [];
    const associatedSymptoms: SymptomGroup[] = [];

    encounters.forEach((enc: EncounterModel) => {
      if (enc.encounterType?.display !== visitTypes.ADULTINITIAL) { return; }
      enc.obs.forEach((obs: ObsModel) => {
        if (obs.concept?.display !== visitTypes.CURRENT_COMPLAINT) { return; }
        const parsed = this.visitService.getData(obs)?.value;
        if (!parsed) { return; }
        const currentComplaint = parsed.split('<b>');
        for (let i = 0; i < currentComplaint.length; i++) {
          if (!currentComplaint[i] || currentComplaint[i].length <= 1) { continue; }
          const obs1 = currentComplaint[i].split('<');
          if (!obs1[0].match(visitTypes.ASSOCIATED_SYMPTOMS)) {
            chiefComplaints.push(obs1[0]);
          }
          const splitByBr = currentComplaint[i].split('<br/>');
          if (splitByBr[0].includes(visitTypes.ASSOCIATED_SYMPTOMS)) {
            for (let j = 1; j < splitByBr.length; j = j + 2) {
              if (splitByBr[j] && splitByBr[j].trim().length > 1) {
                associatedSymptoms.push({
                  label: splitByBr[j].replace('• ', '').replace(' -', ''),
                  text: (splitByBr[j + 1] || '').trim()
                });
              }
            }
          } else {
            const rows: DetailRow[] = [];
            for (let k = 1; k < splitByBr.length; k++) {
              if (splitByBr[k] && splitByBr[k].trim().length > 1) {
                const splitByDash = splitByBr[k].split('-');
                const processed = splitByDash.slice(1).join('-').split('.').map((itemList: string) => {
                  const splitByHyphen = itemList.split(' - ');
                  const value = splitByHyphen.pop() || '';
                  splitByHyphen.push(value);
                  return splitByHyphen.join(' - ');
                });
                rows.push({ label: splitByDash[0].replace('• ', ''), value: processed.join('. ').trim() });
              }
            }
            complaintDetails.push({ title: splitByBr[0].replace('</b>:', ''), rows });
          }
        }
      });
    });

    return { chiefComplaints, complaintDetails, associatedSymptoms };
  }

  private parsePhysicalExam(encounters: EncounterModel[]): { generalExams: DetailRow[]; abdomenFindings: string[] } {
    const generalExams: DetailRow[] = [];
    const abdomenFindings: string[] = [];

    encounters.forEach((enc: EncounterModel) => {
      if (enc.encounterType?.display !== visitTypes.ADULTINITIAL) { return; }
      enc.obs.forEach((obs: ObsModel) => {
        if (obs.concept?.display !== 'PHYSICAL EXAMINATION') { return; }
        const parsed = this.visitService.getData(obs)?.value?.replace(new RegExp('<br/>►', 'g'), '');
        if (!parsed) { return; }
        const physicalExam = parsed.split('<b>');
        for (let i = 0; i < physicalExam.length; i++) {
          if (!physicalExam[i]) { continue; }
          const splitByBr = physicalExam[i].split('<br/>');
          if (splitByBr[0].includes('Abdomen')) {
            for (let k = 1; k < splitByBr.length; k++) {
              if (splitByBr[k].trim()) { abdomenFindings.push(splitByBr[k].replace('• ', '')); }
            }
          } else {
            for (let k = 1; k < splitByBr.length; k++) {
              if (splitByBr[k].trim()) {
                const splitByDash = splitByBr[k].split('-');
                generalExams.push({
                  label: splitByDash[0].replace('• ', ''),
                  value: splitByDash.slice(1).join('-').trim()
                });
              }
            }
          }
        }
      });
    });

    return { generalExams, abdomenFindings };
  }

  private parseMedicalHistory(encounters: EncounterModel[]): { patientHistory: DetailRow[]; familyHistory: DetailRow[] } {
    const patientHistory: DetailRow[] = [];
    const familyHistory: DetailRow[] = [];

    encounters.forEach((enc: EncounterModel) => {
      if (enc.encounterType?.display !== visitTypes.ADULTINITIAL) { return; }
      enc.obs.forEach((obs: ObsModel) => {
        if (obs.concept?.display === visitTypes.MEDICAL_HISTORY) {
          const parsed = this.visitService.getData(obs)?.value?.split('<br/>') || [];
          parsed.forEach((line: string) => {
            if (!line) { return; }
            const splitByDash = line.split('-');
            patientHistory.push({
              label: splitByDash[0].replace('• ', '').trim(),
              value: splitByDash.slice(1).join('-').trim()
            });
          });
        }
        if (obs.concept?.display === visitTypes.FAMILY_HISTORY) {
          const parsed = this.visitService.getData(obs)?.value?.split('<br/>') || [];
          parsed.forEach((line: string) => {
            if (!line) { return; }
            if (line.includes(':')) {
              const splitByColon = line.split(':');
              const splitByDot = splitByColon[1].trim().split('•');
              splitByDot.forEach((element: string) => {
                if (element.trim()) {
                  const splitByComma = element.split(',');
                  familyHistory.push({
                    label: (splitByComma.shift() || '').trim(),
                    value: splitByComma.length ? splitByComma.toString().trim() : ' '
                  });
                }
              });
            } else {
              familyHistory.push({ label: line.replace('•', '').trim(), value: '' });
            }
          });
        }
      });
    });

    return { patientHistory, familyHistory };
  }

  private buildImageSources(res: ObsApiResponseModel, visitUuid: string): string[] {
    return (res.results || [])
      .filter(obs => obs.encounter?.visit?.uuid === visitUuid)
      .map(obs => `${this.baseURL}/obs/${obs.uuid}/value`);
  }

  private buildDocuments(res: ObsApiResponseModel, visitUuid: string): DocItem[] {
    return (res.results || [])
      .filter(obs => obs.encounter?.visit?.uuid === visitUuid)
      .map(obs => ({ type: 'image' as const, src: `${this.baseURL}/obs/${obs.uuid}/value` }));
  }

  private personAttr(patient: PatientModel, attrType: string): string {
    let val = 'NA';
    patient?.person?.attributes?.forEach((attr: any) => {
      if (attr.attributeType?.display === attrType) { val = attr.value; }
    });
    return val;
  }

  private patientIdentifier(patient: PatientModel, identifierType: string): string {
    let identifier = '';
    patient?.identifiers?.forEach((idf: any) => {
      if (idf.identifierType?.display === identifierType) { identifier = idf.identifier; }
    });
    return identifier;
  }

  private parseAllergyNames(value?: string): string[] {
    if (!value || /no known/i.test(value)) { return []; }
    return value.split(',').map(s => s.trim()).filter(Boolean);
  }

  private mapGender(gender?: string): string {
    if (!gender) { return ''; }
    const g = gender.toUpperCase();
    if (g === 'M' || g === 'MALE') { return 'Male'; }
    if (g === 'F' || g === 'FEMALE') { return 'Female'; }
    if (g === 'O' || g === 'OTHER') { return 'Other'; }
    return gender;
  }

  private valOrEmpty(v: string): string {
    return v && v !== 'NA' ? v : '';
  }

  private maskVisitId(uuid: string): string {
    if (!uuid) { return ''; }
    return uuid.replace(uuid.substring(0, uuid.length - 4), '*****').toUpperCase();
  }

  private titleCase(s: string): string {
    return (s || '').replace(/\w\S*/g, t => t.charAt(0).toUpperCase() + t.slice(1).toLowerCase());
  }

  private formatDate(d: any): string {
    if (!d) { return ''; }
    const date = new Date(d);
    if (isNaN(date.getTime())) { return ''; }
    return date.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' });
  }

  private formatDateTime(d: any): string {
    if (!d) { return ''; }
    const date = new Date(d);
    if (isNaN(date.getTime())) { return ''; }
    return date.toLocaleString('en-US', {
      month: 'short', day: '2-digit', year: 'numeric', hour: 'numeric', minute: '2-digit', second: '2-digit', hour12: true
    });
  }
}
