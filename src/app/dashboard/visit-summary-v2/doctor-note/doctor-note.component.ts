import { Component, Input, OnChanges, OnInit, SimpleChanges, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { Subject, forkJoin, of } from 'rxjs';
import { debounceTime, distinctUntilChanged, finalize, switchMap, tap } from 'rxjs/operators';
import { doctorDetails } from 'src/config/constant';
import { environment } from 'src/environments/environment';
import { getCacheData, isFeaturePresent, isNamcoDoctor } from 'src/app/utils/utility-functions';
import { FOLLOW_UP_TYPE_TELEMEDICINE, FOLLOW_UP_TYPES } from '../specialist-doctor-note/specialist-doctor-note.constants';
import { PatientModel, VisitModel } from 'src/app/model/model';
import { CoreService } from 'src/app/services/core/core.service';
import { AppConfigService } from 'src/app/services/app-config.service';
import { QueueService } from 'src/app/services/queue.service';
import { ReportAiIssueDialogData } from 'src/app/modal-components/report-ai-issue/report-ai-issue.component';
import {
  DiagnosisOption, DraftAdvice, DraftDiagnosis, DraftInstruction, DraftMedication, DraftReferral,
  DraftTest, DraftTextItem, VisitSummaryV2Service
} from '../visit-summary-v2.service';
import {
  AdviceBundle, AiDiagnosisState, AiDiagnosisSuggestion, AiFollowUp, AiMedicationState, AiMedicationSuggestion,
  AyuSuggestedQuestion, SelectedDiagnosis, SelectedMedicine
} from '../visit-summary-v2.models';
import {
  ADVICE_BUNDLES, CONTEXT_CHIPS, DAY_OPTIONS,
  DEFAULT_DIAGNOSIS_CODE, DEFAULT_DIAGNOSIS_STATUS, DEFAULT_DIAGNOSIS_TYPE, DEFAULT_MEDICINE_DURATION_UNIT,
  DIAGNOSIS_SEARCH_DEBOUNCE_MS, DIAGNOSIS_SEARCH_MIN_LENGTH, DIAGNOSIS_STATUSES, DIAGNOSIS_TYPES,
  DOSE_OPTIONS, DRUG_OPTIONS, DURATION_UNIT_OPTIONS, FACILITY_OPTIONS, FREQUENCY_OPTIONS,
  INSTRUCTION_OPTIONS, MEDICINE_SEARCH_MAX_RESULTS, MEDICINE_SEARCH_MIN_LENGTH,
  ADVICE_SEARCH_MAX_RESULTS, ADVICE_SEARCH_MIN_LENGTH, DEFAULT_REFERRAL_PRIORITY, REFERRAL_PRIORITIES,
  TIMING_OPTIONS
} from './doctor-note.constants';
import { NamcoReferralOutComponent } from '../namco-referral-out/namco-referral-out.component';

type HistoryNoteKind = 'family' | 'pastMedical';

import { followUpDateToString } from '../follow-up-date';

@Component({
  selector: 'app-doctor-note',
  templateUrl: './doctor-note.component.html',
  styleUrls: ['./doctor-note.component.scss']
})
export class DoctorNoteComponent implements OnChanges, OnInit {
  @Input() patientUuid!: string;
  @Input() visitUuid!: string;
  @Input() visitNoteUuid!: string;
  @Input() patientPhoneNo = '';
  @Input() visit!: VisitModel;
  @Input() patientInfo!: PatientModel;
  @Input() visitCompleted = false;
  @Input() visitReferred = false;

  /** Kaleyra call to the visit's health worker — hidden for MCC users, as in the old Visit Summary. */
  hwPhoneNo = '';
  readonly isMCCUser = this.v2Service.isMCCUser();
  /** "Connect with patient" (call / WhatsApp the patient) isn't used in the NAS project. */
  readonly connectWithPatientEnabled = environment.brandName !== 'NAS';

  readonly contextChips = CONTEXT_CHIPS;
  readonly diagnosisTypes = DIAGNOSIS_TYPES;
  readonly diagnosisStatuses = DIAGNOSIS_STATUSES;
  readonly drugOptions = DRUG_OPTIONS;
  readonly doseOptions = DOSE_OPTIONS;
  readonly durationUnitOptions = DURATION_UNIT_OPTIONS;
  readonly instructionOptions = INSTRUCTION_OPTIONS;
  readonly frequencyOptions = FREQUENCY_OPTIONS;
  readonly timingOptions = TIMING_OPTIONS;
  readonly dayOptions = DAY_OPTIONS;
  readonly adviceBundles = ADVICE_BUNDLES;
  readonly facilityOptions = FACILITY_OPTIONS;
  readonly referralPriorities = REFERRAL_PRIORITIES;

  spokenToPatient: boolean  = null;
  patientInteractionUuid = '';
  prescriptionShared = false;
  savingPatientInteraction = false;
  savedSpokenToPatient: boolean | null = null;
  ayuQuestionsExpanded = false;
  ayuSuggestedQuestions: AyuSuggestedQuestion[] = [];
  ayuRefineText = '';
  private ayuNoteUuid = '';

  hasEnoughInfo = true;

  aiDiagnosisState: AiDiagnosisState = 'loading';
  aiSummaryExpanded = false;
  whySuggestion: AiDiagnosisSuggestion | null = null;
  selectedDiagnoses: SelectedDiagnosis[] = [];

  aiClinicalSummary = '';
  aiResponseReceived = false;
  aiSuggestions: AiDiagnosisSuggestion[] = [];
  /** Raw AI diagnoses / medications (AI rank order) — sent with the doctor's choices to /ddx/manual and /ttx/manual. */
  private aiDiagnosisRaw: any[] = [];
  private aiMedicationRaw: any[] = [];

  diagnosisSearchTerm = '';
  diagnosisSearching = false;
  diagnosisResults: DiagnosisOption[] = [];
  private diagnosisSearch$ = new Subject<string>();
  addedDiagnoses: DraftDiagnosis[] = [];

  newNoteText = '';
  outcomeNotes: DraftTextItem[] = [];

  /** Shown when enabled in Patient Visit Summary config, as in the old Visit Summary. */
  familyHistoryNotesEnabled = false;
  pastMedicalHistoryNotesEnabled = false;
  historyNotes: Record<HistoryNoteKind, DraftTextItem[]> = { family: [], pastMedical: [] };
  newHistoryNoteText: Record<HistoryNoteKind, string> = { family: '', pastMedical: '' };

  aiMedicationState: AiMedicationState = 'ready';
  whyMedication: AiMedicationSuggestion | null = null;
  medicineSearchTerm = '';
  medicineResults: string[] = [];
  selectedMedicines: SelectedMedicine[] = [];

  aiMedicationSuggestions: AiMedicationSuggestion[] = [];
  aiAdvices: string[] = [];
  aiTests: string[] = [];
  aiReferrals: { speciality: string; facility: string; priority: string; reason: string }[] = [];
  aiFollowUp: AiFollowUp | null = null;

  addedMedicines: DraftMedication[] = [];
  medInstructionText = '';
  savingMedInstruction = false;
  medInstructions: DraftInstruction[] = [];

  adviceSearchTerm = '';
  adviceResults: string[] = [];
  adviceOptions: string[] = [];
  advices: DraftAdvice[] = [];
  selectedAdvices: string[] = [];
  openBundle: AdviceBundle | null = null;

  testOptions: string[] = [];
  testSearchTerm = '';
  testResults: string[] = [];
  selectedTests: string[] = [];
  tests: DraftTest[] = [];

  referralSpecialityOptions: string[] = [];
  newReferral: { speciality: string | null; facility: string | null; priority: string | null; reason: string } =
    { speciality: null, facility: null, priority: DEFAULT_REFERRAL_PRIORITY, reason: '' };
  referrals: DraftReferral[] = [];

  /** Referring (non-NAMCO) doctor with the NAMCO referral flow on — Referral section is app-namco-referral-out. */
  namcoReferralEnabled = false;
  private isReferringToNamco = false;
  @ViewChild(NamcoReferralOutComponent) private namcoReferral?: NamcoReferralOutComponent;

  wantFollowUp: boolean | null = null;
  /** On a turn server the Type isn't asked and is always Telemedicine, as in the old Visit Summary. */
  private readonly defaultFollowUpType: string | null = environment.isTurnServer ? FOLLOW_UP_TYPE_TELEMEDICINE : null;
  followUpType: string | null = this.defaultFollowUpType;
  readonly followUpTypes = FOLLOW_UP_TYPES;
  /**
  * Follow-up Type (In person / Telemedicine) — same rule as the old Visit Summary for a normal doctor:
  * only with the "followUpType" feature on and not on a turn server. Drives both the selector and the
  * Type column, so the column is shown only when there is a Type to pick.
  */
  readonly followUpTypeEnabled = isFeaturePresent('followUpType') && !environment.isTurnServer;
  followUpDate = '';
  followUpTime: string | null = null;
  followUpReason = '';
  followUpUuid = '';
  savedFollowUpYes = false;
  followUpTimeSlots: string[] = [];
  readonly quickFollowUpDays = [3, 7, 10, 30];
  minFollowUpDate = followUpDateToString(new Date());

  private provider = getCacheData(true, doctorDetails.PROVIDER);

  constructor(
    private v2Service: VisitSummaryV2Service,
    private coreService: CoreService,
    private router: Router,
    private appConfigService: AppConfigService,
    private queueService: QueueService
  ) {}

  private getPatientOpenMrsId(): string {
    const identifiers = (this.patientInfo as any)?.identifiers || [];
    const idf = identifiers.find((i: any) => i.identifierType?.display === 'OpenMRS ID');
    return idf?.identifier || '';
  }

  openReportIssue(aiSurface: ReportAiIssueDialogData['aiSurface'], item?: any): void {
    const doctor = getCacheData(true, doctorDetails.PROVIDER);
    this.coreService.openReportAiIssueModal({
      visitUuid: this.visitUuid || this.visit?.uuid,
      doctorUuid: doctor?.uuid,
      patientUuid: this.patientUuid || this.visit?.patient?.uuid,
      aiSurface,
      suggestionRef: item?.diagnosis || item?.name || item?.speciality || item?.duration || (typeof item === 'string' ? item : undefined),
      rawSuggestion: item,
      doctorName: getCacheData(true, doctorDetails.USER)?.person?.display,
      patientOpenMrsId: this.getPatientOpenMrsId(),
    }).subscribe();
  }

  /** Collapsed state per section, keyed like the sidebar ids without the "dn-" prefix. */
  collapsed: Record<string, boolean> = {};

  toggleSection(key: string): void {
    this.collapsed[key] = !this.collapsed[key];
  }

  /** Open a section (e.g. when it's picked from the sidebar). */
  expandSection(key: string): void {
    this.collapsed[key] = false;
    // With NAMCO referral on, the Referral section is the NAMCO Referral-Out card instead.
    if (key === 'referral') { this.namcoReferral?.expand(); }
  }

  get whatsAppLink(): string | null {
    return this.v2Service.whatsAppLink(this.patientPhoneNo);
  }

  startKaleyraCall(): void {
    this.v2Service.startKaleyraCall(this.visit, this.hwPhoneNo);
  }

  answerAyuQuestion(q: AyuSuggestedQuestion, answer: string): void {
    q.answer = answer;
    q.editing = false;
  }

  editAyuQuestion(q: AyuSuggestedQuestion): void {
    q.editing = true;
  }

  saveAyuQuestions(): void {
    this.ayuSuggestedQuestions.forEach(q => { q.editing = false; });
    const notes = this.buildAyuNotes();
    if (!notes || !this.canWrite()) { return; }
    this.v2Service.saveInteractionNote(this.patientUuid, this.visitNoteUuid, notes, this.ayuNoteUuid).subscribe(res => {
      this.ayuNoteUuid = res?.uuid || this.ayuNoteUuid;
      this.loadAiDiagnosis(notes, true);
    });
  }

  private buildAyuNotes(): string {
    const answered = this.ayuSuggestedQuestions
      .filter(q => !!q.answer)
      .map(q => `${q.question} ${q.answer}`);
    return [...answered, this.ayuRefineText].filter(Boolean).join('\n');
  }

  savePatientInteraction(): void {
    if (!this.visitUuid || this.savingPatientInteraction || this.spokenToPatient === null) { return; }
    this.savingPatientInteraction = true;
    this.v2Service.savePatientInteraction(
      this.visitUuid, this.spokenToPatient ? 'Yes' : 'No', this.patientInteractionUuid
    ).subscribe({
      next: (res: any) => {
        this.patientInteractionUuid = res?.uuid || this.patientInteractionUuid;
        this.savedSpokenToPatient = this.spokenToPatient;
        this.savingPatientInteraction = false;
        this.coreService.showToast('success', 'Patient interaction saved', 'Saved', 'success-patient-interaction-toast');
      },
      error: () => {
        this.savingPatientInteraction = false;
        this.coreService.showToast('error', 'Could not save patient interaction', 'Error', 'error-patient-interaction-toast');
      }
    });
  }

  private loadPatientInteraction(): void {
    const attr = this.v2Service.getPatientInteraction(this.visit);
    this.patientInteractionUuid = attr.uuid;
    if (attr.value) {
      this.spokenToPatient = attr.value.toLowerCase() === 'yes';
      this.savedSpokenToPatient = this.spokenToPatient;
    }
  }

  private loadInteractionNote(): void {
    this.aiDiagnosisState = 'loading';
    this.v2Service.loadInteractionNote(this.patientUuid, this.visitUuid).subscribe({
      next: note => {
        this.ayuNoteUuid = note.uuid;
        this.loadAiDiagnosis(note.value);
      },
      error: () => this.loadAiDiagnosis()
    });
  }

  ngOnInit(): void {
    this.diagnosisSearch$.pipe(
      debounceTime(DIAGNOSIS_SEARCH_DEBOUNCE_MS),
      distinctUntilChanged(),
      switchMap(term => term && term.length >= DIAGNOSIS_SEARCH_MIN_LENGTH ? this.v2Service.searchDiagnosis(term) : of([]))
    ).subscribe(results => {
      this.diagnosisResults = results;
      this.diagnosisSearching = false;
    });

    this.v2Service.getAdvicesList().subscribe(list => { this.adviceOptions = list; });
    this.v2Service.getTestsList().subscribe(list => { this.testOptions = list; });
    this.referralSpecialityOptions = this.v2Service.getReferralSpecialities();
    this.followUpTimeSlots = this.v2Service.getFollowUpTimeSlots();
    // The Referral Consent step only applies to the referring (non-NAMCO) doctor.
    this.namcoReferralEnabled = !!this.appConfigService?.namco_referral_section && !isNamcoDoctor(this.provider);
    this.familyHistoryNotesEnabled = !!this.appConfigService?.patient_visit_summary?.family_history_notes;
    this.pastMedicalHistoryNotesEnabled = !!this.appConfigService?.patient_visit_summary?.past_medical_history_notes;
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['visitCompleted'] && this.visitCompleted) {
      this.prescriptionShared = true;
    }
    if ((changes['visitUuid'] || changes['patientUuid'] || changes['visitNoteUuid']) && this.patientUuid && this.visitUuid) {
      this.loadDraft();
    }
    if (changes['visit'] && this.visit) {
      this.loadPatientInteraction();
      this.hwPhoneNo = this.v2Service.getHwPhoneNo(this.visit);
    }
    if ((changes['visit'] || changes['patientInfo']) && this.visit && this.patientInfo) {
      this.loadInteractionNote();
    }
  }

  private loadDraft(): void {
    this.v2Service.loadDraftNote(this.patientUuid, this.visitUuid, [this.visitNoteUuid].filter(Boolean)).subscribe(draft => {
      this.addedDiagnoses = draft.diagnoses;
      this.addedMedicines = draft.medications;
      this.advices = draft.advices;
      this.tests = draft.tests;
      this.referrals = draft.referrals;
      this.outcomeNotes = draft.notes;
      this.historyNotes = { family: draft.familyHistoryNotes, pastMedical: draft.pastMedicalHistoryNotes };
      this.medInstructions = draft.additionalInstruction ? [draft.additionalInstruction] : [];
      if (draft.followUp) {
        this.wantFollowUp = draft.followUp.wantFollowUp;
        this.followUpDate = draft.followUp.date;
        this.followUpTime = draft.followUp.time || null;
        this.followUpReason = draft.followUp.reason;
        this.followUpType = draft.followUp.type || null;
        this.followUpUuid = draft.followUp.uuid;
        this.savedFollowUpYes = draft.followUp.wantFollowUp;
        this.followUpTimeSlots = this.v2Service.getFollowUpTimeSlots(this.followUpDate);
      }
      if (this.addedDiagnoses.length) {
        this.loadAiTreatment();
      }
    });
  }

  private canWrite(): boolean {
    return !!(this.patientUuid && this.visitNoteUuid);
  }

  onDiagnosisSearch(term: string): void {
    this.diagnosisSearchTerm = term;
    if (!term || term.length < DIAGNOSIS_SEARCH_MIN_LENGTH) {
      this.diagnosisResults = [];
      this.diagnosisSearching = false;
    } else {
      this.diagnosisSearching = true;
    }
    this.diagnosisSearch$.next(term);
  }

  clearDiagnosisSearch(): void {
    this.onDiagnosisSearch('');
  }

  confidenceLabel(suggestion: { confidence: number | null }): string {
    return suggestion.confidence === null ? '' : `${suggestion.confidence}%`;
  }

  isDiagnosisSelected(name: string): boolean {
    return this.isDiagnosisPending(name) || this.isDiagnosisAdded(name);
  }

  private isDiagnosisPending(name: string): boolean {
    return this.selectedDiagnoses.some(d => d.name.toLowerCase() === name.toLowerCase());
  }

  private isDiagnosisAdded(name: string): boolean {
    return this.addedDiagnoses.some(d => d.name.toLowerCase() === name.toLowerCase());
  }

  toggleAiSuggestion(suggestion: AiDiagnosisSuggestion): void {
    this.toggleSelectedDiagnosis(suggestion.name, 'ai');
  }

  toggleSearchResult(option: DiagnosisOption): void {
    this.toggleSelectedDiagnosis(option.name, 'manual', option.code || DEFAULT_DIAGNOSIS_CODE);
  }

  private toggleSelectedDiagnosis(name: string, source: 'ai' | 'manual', code = DEFAULT_DIAGNOSIS_CODE): void {
    if (this.isDiagnosisAdded(name)) {
      this.coreService.showToast('warning', 'Diagnosis already added, please add another diagnosis.', 'Already Added', 'warning-diagnosis-toast');
      return;
    }
    const index = this.selectedDiagnoses.findIndex(d => d.name.toLowerCase() === name.toLowerCase());
    if (index > -1) {
      this.selectedDiagnoses.splice(index, 1);
      return;
    }
    this.selectedDiagnoses.push({ name, code, source, type: DEFAULT_DIAGNOSIS_TYPE, status: DEFAULT_DIAGNOSIS_STATUS });
  }

  toggleWhy(suggestion: AiDiagnosisSuggestion, event: Event): void {
    event.stopPropagation();
    this.whySuggestion = this.whySuggestion === suggestion ? null : suggestion;
  }

  removeSelectedDiagnosis(index: number): void {
    this.selectedDiagnoses.splice(index, 1);
  }

  submitSelectedDiagnoses(): void {
    if (!this.canWrite() || !this.selectedDiagnoses.length) { return; }
    const saves = [...this.selectedDiagnoses].map(dx => {
      const payload = { name: dx.name, type: dx.type, status: dx.status, code: dx.code || DEFAULT_DIAGNOSIS_CODE };
      return this.v2Service.saveDiagnosis(this.patientUuid, this.visitNoteUuid, payload).pipe(tap(res => {
        this.addedDiagnoses.push({ ...payload, uuid: res?.uuid || '' });
        const index = this.selectedDiagnoses.findIndex(d => d.name === dx.name);
        if (index > -1) { this.selectedDiagnoses.splice(index, 1); }
      }));
    });
    // Once saved: send all the visit's diagnoses + the AI list to /ddx/manual (as the old Visit Summary
    // does when new diagnoses are saved), then refresh the AI medication for the new diagnoses.
    forkJoin(saves).subscribe(() => {
      this.sendManualDiagnoses();
      this.loadAiTreatment();
    });
  }

  private sendManualDiagnoses(): void {
    // Not sent when diagnoses are captured as secondary-level free text (old dp_diagnosis_secondary).
    if (isFeaturePresent('dp_diagnosis_secondary')) { return; }
    this.v2Service.sendManualDiagnoses(this.visitUuid, this.addedDiagnoses, this.aiDiagnosisRaw).subscribe();
  }

  private loadAiTreatment(): void {
    const diagnosis = this.addedDiagnoses.map(d => d.name).join(', ');
    if (!diagnosis || !this.visit || !this.patientInfo) { return; }
    this.aiMedicationState = 'loading';
    this.v2Service.loadAiTreatment(this.patientInfo, this.visit, diagnosis, this.visitCompleted).subscribe({
      next: result => {
        this.aiMedicationSuggestions = result.medicines;
        this.aiMedicationRaw = result.rawMedicines || [];
        this.aiAdvices = result.advices;
        this.aiTests = result.tests;
        this.aiReferrals = result.referrals;
        this.aiFollowUp = result.followUp;
        this.aiMedicationState = 'ready';
      },
      error: () => {
        this.aiMedicationState = 'error';
      }
    });
  }

  addDiagnosisManually(): void {
    this.aiDiagnosisState = 'ready';
    this.aiSuggestions = [];
    this.aiClinicalSummary = '';
    this.aiResponseReceived = false;
  }

  retryAiDiagnosis(): void {
    this.loadAiDiagnosis(this.buildAyuNotes(), true);
  }

  private loadAiDiagnosis(notes = '', recompute = false): void {
    if (!this.visit || !this.patientInfo) { return; }
    this.aiDiagnosisState = 'loading';
    this.aiResponseReceived = false;
    this.v2Service.loadAiDiagnosis(this.patientInfo, this.visit, notes, this.visitCompleted, recompute && !!notes.trim()).subscribe({
      next: result => {
        this.aiResponseReceived = true;
        this.aiClinicalSummary = result.summary;
        this.aiSuggestions = result.suggestions;
        this.aiDiagnosisRaw = result.raw || [];
        this.ayuSuggestedQuestions = result.questions;
        this.aiDiagnosisState = 'ready';
      },
      error: () => {
        this.aiDiagnosisState = 'error';
      }
    });
  }

  editDiagnosis(index: number): void {
    const dx = this.addedDiagnoses[index];
    if (!dx || this.isDiagnosisPending(dx.name)) { return; }
    const pullIntoEditor = () => {
      this.addedDiagnoses.splice(index, 1);
      this.selectedDiagnoses.push({
        name: dx.name,
        code: dx.code || DEFAULT_DIAGNOSIS_CODE,
        source: 'manual',
        type: dx.type,
        status: dx.status
      });
    };
    if (dx.uuid) {
      this.v2Service.deleteObs(dx.uuid).subscribe(() => pullIntoEditor());
      return;
    }
    pullIntoEditor();
  }

  deleteDiagnosis(index: number, uuid?: string): void {
    this.v2Service.removeDraftItem(this.addedDiagnoses, index, uuid);
  }

  get medicationPanelState(): AiMedicationState {
    const hasDiagnosis = this.selectedDiagnoses.length > 0 || this.addedDiagnoses.length > 0;
    return !hasDiagnosis && this.aiMedicationState === 'ready' ? 'no-diagnosis' : this.aiMedicationState;
  }

  get canSubmitMedicines(): boolean {
    return this.selectedMedicines.length > 0 &&
      this.selectedMedicines.every(m => !!m.timing && !!m.strength && !!m.days);
  }

  isMedicineSelected(name: string): boolean {
    return this.isMedicinePending(name) || this.isMedicineAdded(name);
  }

  private isMedicinePending(name: string): boolean {
    return this.selectedMedicines.some(m => m.drug.toLowerCase() === name.toLowerCase());
  }

  private isMedicineAdded(name: string): boolean {
    return this.addedMedicines.some(m => m.drug.toLowerCase() === name.toLowerCase());
  }

  toggleAiMedication(suggestion: AiMedicationSuggestion): void {
    this.toggleSelectedMedicine(suggestion.name, 'ai', suggestion);
  }

  onMedicineSearch(term: string): void {
    this.medicineSearchTerm = term;
    const query = (term || '').trim().toLowerCase();
    if (query.length < MEDICINE_SEARCH_MIN_LENGTH) {
      this.medicineResults = [];
      return;
    }
    const starts = this.drugOptions.filter(d => d.toLowerCase().startsWith(query));
    const contains = this.drugOptions.filter(d => !d.toLowerCase().startsWith(query) && d.toLowerCase().includes(query));
    this.medicineResults = [...starts, ...contains].slice(0, MEDICINE_SEARCH_MAX_RESULTS);
    if (!this.medicineResults.some(d => d.toLowerCase() === query)) {
      this.medicineResults.push(term.trim());
    }
  }

  clearMedicineSearch(): void {
    this.onMedicineSearch('');
  }

  toggleMedicineResult(name: string): void {
    this.toggleSelectedMedicine(name, 'manual');
  }

  private toggleSelectedMedicine(drug: string, source: 'ai' | 'manual', suggestion?: AiMedicationSuggestion): void {
    if (this.isMedicineAdded(drug)) {
      this.coreService.showToast('warning', 'Medicine already added, please add another medicine.', 'Already Added', 'warning-medicine-toast');
      return;
    }
    const index = this.selectedMedicines.findIndex(m => m.drug.toLowerCase() === drug.toLowerCase());
    if (index > -1) {
      this.selectedMedicines.splice(index, 1);
      return;
    }
    this.selectedMedicines.push({
      drug,
      source,
      timing: suggestion?.timing || '',
      strength: suggestion?.strength || '',
      days: suggestion?.days || '',
      durationUnit: suggestion?.durationUnit || DEFAULT_MEDICINE_DURATION_UNIT,
      remarks: suggestion?.remarks || null,
      editing: !suggestion?.timing || !suggestion?.strength || !suggestion?.days
    });
  }

  toggleMedicationWhy(suggestion: AiMedicationSuggestion, event: Event): void {
    event.stopPropagation();
    this.whyMedication = this.whyMedication === suggestion ? null : suggestion;
  }


  cancelMedicineEdit(index: number): void {
    const m = this.selectedMedicines[index];
    if (!m) { return; }
    if (m.uuid) {
      this.restoreEditedMedicine(index);
      return;
    }
    if (!m.timing && !m.strength && !m.days && !m.remarks) {
      this.selectedMedicines.splice(index, 1);
      return;
    }
    m.editing = false;
  }

  removeSelectedMedicine(index: number): void {
    if (this.selectedMedicines[index]?.uuid) {
      this.restoreEditedMedicine(index);
      return;
    }
    this.selectedMedicines.splice(index, 1);
  }

  submitSelectedMedicines(): void {
    if (!this.canWrite() || !this.canSubmitMedicines) { return; }
    const batch = [...this.selectedMedicines];
    const hasNew = batch.some(m => !m.uuid);
    const saves = batch.map(m => {
      const med = {
        drug: m.drug,
        dose: m.strength,
        frequency: m.timing,
        durationNo: m.days,
        durationUnit: m.durationUnit || DEFAULT_MEDICINE_DURATION_UNIT,
        instructRemark: m.remarks || ''
      };
      return this.v2Service.saveMedication(this.patientUuid, this.visitNoteUuid, med, m.uuid || undefined).pipe(tap(res => {
        const saved = { ...med, uuid: res?.uuid || m.uuid || '' };
        if (m.uuid) {
          this.addedMedicines.splice(Math.min(m.addedIndex ?? this.addedMedicines.length, this.addedMedicines.length), 0, saved);
        } else {
          this.addedMedicines.push(saved);
        }
        const index = this.selectedMedicines.indexOf(m);
        if (index > -1) { this.selectedMedicines.splice(index, 1); }
      }));
    });
    // Once saved: when new medications were added, send all the visit's medications + the AI list to
    // /ttx/manual (as the old Visit Summary does); editing an existing one doesn't send.
    forkJoin(saves).subscribe(() => {
      if (hasNew) {
        this.v2Service.sendManualTreatment(this.visitUuid, this.addedMedicines, this.aiMedicationRaw).subscribe();
      }
    });
  }

  addMedicationManually(): void {
    this.aiMedicationState = 'ready';
    this.aiMedicationSuggestions = [];
  }

  retryAiMedication(): void {
    this.loadAiTreatment();
  }

  editMedicine(index: number): void {
    const m = this.addedMedicines[index];
    if (!m || this.selectedMedicines.some(s => s.uuid && s.uuid === m.uuid)) { return; }
    this.addedMedicines.splice(index, 1);
    // The card edits only the no. of days, so a saved '2 Weeks' opens as 14 days.
    const duration = this.v2Service.toDurationInDays(m.durationNo, m.durationUnit);
    this.selectedMedicines.push({
      drug: m.drug,
      source: 'manual',
      timing: m.frequency || '',
      strength: m.dose || '',
      days: duration.durationNo,
      durationUnit: duration.durationUnit || DEFAULT_MEDICINE_DURATION_UNIT,
      remarks: m.instructRemark || null,
      editing: true,
      uuid: m.uuid,
      addedIndex: index
    });
  }

  private restoreEditedMedicine(index: number): void {
    const m = this.selectedMedicines[index];
    if (!m?.uuid) { return; }
    this.selectedMedicines.splice(index, 1);
    const original = {
      drug: m.drug, dose: m.strength, frequency: m.timing, durationNo: m.days,
      durationUnit: m.durationUnit || '', instructRemark: m.remarks || '', uuid: m.uuid
    };
    this.addedMedicines.splice(Math.min(m.addedIndex ?? this.addedMedicines.length, this.addedMedicines.length), 0, original);
  }

  deleteMedicine(index: number, uuid?: string): void {
    this.v2Service.removeDraftItem(this.addedMedicines, index, uuid);
  }

  toggleBundle(bundle: AdviceBundle): void {
    this.openBundle = this.openBundle === bundle ? null : bundle;
  }

  isAdviceSelected(value: string): boolean {
    return this.selectedAdvices.includes(value) || this.advices.some(a => a.value === value);
  }

  toggleAdvice(value: string): void {
    if (this.advices.some(a => a.value === value)) {
      this.coreService.showToast('warning', 'Advice already added, please add another advice.', 'Already Added', 'warning-advice-toast');
      return;
    }
    const index = this.selectedAdvices.indexOf(value);
    if (index > -1) {
      this.selectedAdvices.splice(index, 1);
    } else {
      this.selectedAdvices.push(value);
    }
  }

  onAdviceSearch(term: string): void {
    this.adviceSearchTerm = term;
    const query = (term || '').trim().toLowerCase();
    if (query.length < ADVICE_SEARCH_MIN_LENGTH) {
      this.adviceResults = [];
      return;
    }
    const starts = this.adviceOptions.filter(a => a.toLowerCase().startsWith(query));
    const contains = this.adviceOptions.filter(a => !a.toLowerCase().startsWith(query) && a.toLowerCase().includes(query));
    this.adviceResults = [...starts, ...contains].slice(0, ADVICE_SEARCH_MAX_RESULTS);
    if (!this.adviceResults.some(a => a.toLowerCase() === query)) {
      this.adviceResults.push(term.trim());
    }
  }

  clearAdviceSearch(): void {
    this.onAdviceSearch('');
  }

  removeSelectedAdvice(index: number): void {
    this.selectedAdvices.splice(index, 1);
  }

  addAdvice(): void {
    if (!this.selectedAdvices.length || !this.canWrite()) { return; }
    [...this.selectedAdvices].forEach(value => {
      this.v2Service.saveAdvice(this.patientUuid, this.visitNoteUuid, value).subscribe(res => {
        this.advices.push({ value, uuid: res?.uuid || '' });
        const index = this.selectedAdvices.indexOf(value);
        if (index > -1) { this.selectedAdvices.splice(index, 1); }
      });
    });
  }

  deleteAdvice(index: number, uuid?: string): void {
    this.v2Service.removeDraftItem(this.advices, index, uuid);
  }

  cancelAdvice(): void {
    this.clearAdviceSearch();
    this.selectedAdvices = [];
    this.openBundle = null;
  }

  isTestAdded(value: string): boolean {
    return this.tests.some(t => t.value.trim().toLowerCase() === value.trim().toLowerCase());
  }

  isTestSelected(value: string): boolean {
    return this.selectedTests.some(t => t.toLowerCase() === value.toLowerCase()) || this.isTestAdded(value);
  }

  toggleTest(value: string): void {
    if (this.isTestAdded(value)) {
      this.coreService.showToast('warning', 'Test already added, please add another test.', 'Already Added', 'warning-test-toast');
      return;
    }
    const index = this.selectedTests.findIndex(t => t.toLowerCase() === value.toLowerCase());
    if (index > -1) {
      this.selectedTests.splice(index, 1);
    } else {
      this.selectedTests.push(value);
    }
  }

  onTestSearch(term: string): void {
    this.testSearchTerm = term;
    this.testResults = this.v2Service.searchOptions(this.testOptions, term);
  }

  clearTestSearch(): void {
    this.onTestSearch('');
  }

  removeSelectedTest(index: number): void {
    this.selectedTests.splice(index, 1);
  }

  /** Follow-up doesn't apply once the patient is handed off to a NAMCO specialist. */
  get isNamcoReferralConfirmed(): boolean {
    return !!this.namcoReferral?.confirmedNamcoReferral;
  }

  applyAiReferral(referral: { speciality: string; facility: string; priority: string; reason: string }): void {
    this.newReferral = {
      speciality: referral.speciality || null,
      facility: referral.facility || null,
      priority: this.newReferral.priority,
      reason: referral.reason || ''
    };
  }

  applyAiFollowUp(): void {
    if (!this.aiFollowUp) { return; }
    this.wantFollowUp = true;
    this.followUpReason = this.aiFollowUp.reason || this.followUpReason;
  }

  /** Save every selected test (like "Add Advice"). */
  addTest(): void {
    if (!this.selectedTests.length || !this.canWrite()) { return; }
    [...this.selectedTests].forEach(value => {
      this.v2Service.saveTest(this.patientUuid, this.visitNoteUuid, value).subscribe(res => {
        this.tests.push({ value, uuid: res?.uuid || '' });
        const index = this.selectedTests.indexOf(value);
        if (index > -1) { this.selectedTests.splice(index, 1); }
      });
    });
    this.clearTestSearch();
  }

  deleteTest(index: number, uuid?: string): void {
    this.v2Service.removeDraftItem(this.tests, index, uuid);
  }

  cancelTest(): void {
    this.clearTestSearch();
    this.selectedTests = [];
  }

  addReferral(): void {
    if (!this.newReferral.speciality || !this.canWrite()) { return; }
    if (this.referrals.find(r => r.speciality === this.newReferral.speciality)) {
      this.coreService.showToast('warning', 'Referral already added, please add another referral.', 'Already Added', 'warning-referral-toast');
      return;
    }
    const ref = {
      speciality: this.newReferral.speciality || '',
      facility: this.newReferral.facility || '',
      priority: this.newReferral.priority || '',
      reason: this.newReferral.reason || ''
    };
    this.v2Service.saveReferral(this.patientUuid, this.visitNoteUuid, ref).subscribe(res => {
      this.referrals.push({ ...ref, uuid: res?.uuid || '' });
      this.cancelReferral();
    });
  }

  deleteReferral(index: number, uuid?: string): void {
    this.v2Service.removeDraftItem(this.referrals, index, uuid);
  }

  cancelReferral(): void {
    this.newReferral = { speciality: null, facility: null, priority: DEFAULT_REFERRAL_PRIORITY, reason: '' };
  }

  addNote(): void {
    if (!this.newNoteText || !this.canWrite()) { return; }
    const value = this.newNoteText;
    this.v2Service.saveNote(this.patientUuid, this.visitNoteUuid, value).subscribe(res => {
      this.outcomeNotes.push({ value, uuid: res?.uuid || '' });
      this.newNoteText = '';
    });
  }

  deleteNote(index: number, uuid?: string): void {
    this.v2Service.removeDraftItem(this.outcomeNotes, index, uuid);
  }

  cancelNote(): void {
    this.newNoteText = '';
  }

  addHistoryNote(kind: HistoryNoteKind): void {
    const value = this.newHistoryNoteText[kind];
    if (!value?.trim() || !this.canWrite()) { return; }
    const save$ = kind === 'family'
      ? this.v2Service.saveFamilyHistoryNote(this.patientUuid, this.visitNoteUuid, value)
      : this.v2Service.savePastMedicalHistoryNote(this.patientUuid, this.visitNoteUuid, value);
    save$.subscribe(res => {
      this.historyNotes[kind].push({ value, uuid: res?.uuid || '' });
      this.newHistoryNoteText[kind] = '';
    });
  }

  deleteHistoryNote(kind: HistoryNoteKind, index: number, uuid?: string): void {
    this.v2Service.removeDraftItem(this.historyNotes[kind], index, uuid);
  }

  cancelHistoryNote(kind: HistoryNoteKind): void {
    this.newHistoryNoteText[kind] = '';
  }

  addMedInstruction(): void {
    if (!this.medInstructionText?.trim() || !this.canWrite() || this.savingMedInstruction) { return; }
    const value = this.medInstructionText;
    this.savingMedInstruction = true;
    this.v2Service.saveAdditionalInstruction(this.patientUuid, this.visitNoteUuid, value, this.medInstructions[0] || null)
      .pipe(finalize(() => { this.savingMedInstruction = false; }))
      .subscribe(saved => {
        this.medInstructions = [saved];
        this.medInstructionText = '';
      });
  }

  deleteMedInstruction(index: number, uuid?: string): void {
    this.v2Service.removeDraftItem(this.medInstructions, index, uuid);
  }

  cancelMedInstruction(): void {
    this.medInstructionText = '';
  }

  saveFollowUp(): void {
    if (!this.canWrite()) { return; }
    if (this.wantFollowUp === null) { return; }
    if (!this.wantFollowUp) {
      // Saved "No" shows in the follow-up table with "-" for type/date/time/reason, as in the old UI.
      this.followUpType = this.defaultFollowUpType;
      this.followUpDate = '';
      this.followUpTime = null;
      this.followUpReason = '';
      this.v2Service.saveNoFollowUp(this.patientUuid, this.visitNoteUuid, this.followUpUuid || undefined)
        .subscribe(res => {
          this.followUpUuid = res?.uuid || this.followUpUuid;
          this.savedFollowUpYes = false;
        });
      return;
    }
    if (!this.followUpDate) { return; }
    const fu = {
      date: this.followUpDate,
      time: this.followUpTime || '',
      reason: this.followUpReason || '',
      type: this.followUpType || ''
    };
    this.v2Service.saveFollowUp(this.patientUuid, this.visitNoteUuid, fu, this.followUpUuid || undefined)
      .subscribe(res => {
        this.followUpUuid = res?.uuid || this.followUpUuid;
        this.savedFollowUpYes = true;
      });
  }

  applyQuickFollowUp(days: number): void {
    const date = new Date();
    date.setDate(date.getDate() + days);
    this.followUpDate = date.toISOString().slice(0, 10);
    this.onFollowUpDateChange();
  }

  isQuickFollowUpActive(days: number): boolean {
    if (!this.followUpDate) { return false; }
    const date = new Date();
    date.setDate(date.getDate() + days);
    return date.toISOString().slice(0, 10) === this.followUpDate;
  }

  onFollowUpDateChange(): void {
    this.followUpTimeSlots = this.v2Service.getFollowUpTimeSlots(this.followUpDate);
    if (this.followUpTime && !this.followUpTimeSlots.includes(this.followUpTime)) {
      this.followUpTime = null;
    }
  }

  deleteFollowUp(): void {
    if (!this.followUpUuid) { return; }
    this.v2Service.deleteObs(this.followUpUuid).subscribe(() => {
      this.followUpUuid = '';
      this.savedFollowUpYes = false;
      this.wantFollowUp = null;
      this.followUpType = this.defaultFollowUpType;
      this.followUpDate = '';
      this.followUpTime = null;
      this.followUpReason = '';
    });
  }

  sharePrescription(): void {
    if (!this.canWrite()) { return; }
    if (!this.addedDiagnoses.length) {
      this.coreService.showToast('warning', 'Diagnosis not added', 'Diagnosis Required', 'warning-diagnosis-required-toast');
      return;
    }
    if (this.namcoReferral && !this.namcoReferral.validateForShare()) { return; }
    const namcoReferral = this.namcoReferral?.confirmedNamcoReferral || null;
    this.coreService.openSharePrescriptionConfirmModal({ namcoReferral }).subscribe((confirmed: boolean) => {
      if (!confirmed) { return; }
      if (namcoReferral) {
        this.referToNamco(namcoReferral);
      } else {
        this.completeVisitAndShare();
      }
    });
  }

  /**
  * Route the visit to the NAMCO specialist (Referral encounter + Routing Specialization)
  * instead of completing it.
  */
  private referToNamco(namcoReferral: DraftReferral): void {
    if (this.isReferringToNamco) { return; }
    this.isReferringToNamco = true;
    this.v2Service.createNamcoReferralEncounter(this.visit, this.provider?.uuid, namcoReferral.speciality)
      .pipe(finalize(() => { this.isReferringToNamco = false; }))
      .subscribe({
        next: (referralEncounter) => {
          if (!referralEncounter) { this.completeVisitAndShare(); return; }
          this.visitReferred = true;
          this.prescriptionShared = true;
          this.coreService.openSharePrescriptionSuccessModal({ isReferral: true }).subscribe((result: string | boolean) => {
            if (result === 'view') {
              this.coreService.openVisitPrescriptionModal({ uuid: this.visitUuid });
            } else if (result === 'dashboard') {
              this.router.navigate(['/dashboard']);
            }
          });
        },
        error: () => {
          this.coreService.openSharePrescriptionErrorModal({
            msg: 'Unable to send the referral due to poor network connection. Please try again or come back later',
            confirmBtnText: 'Try again'
          }).subscribe((retry: boolean) => {
            if (retry) { this.referToNamco(namcoReferral); }
          });
        }
      });
  }

  private completeVisitAndShare(): void {
    this.v2Service.completeVisit(this.visitUuid, this.patientUuid, this.provider).subscribe({
      next: (res) => {
        if (!res) { this.showSharePrescriptionError(); return; }
        this.prescriptionShared = true;
        this.queueService.markPrescriptionShared(this.visitUuid).subscribe();
        this.coreService.openSharePrescriptionSuccessModal().subscribe((result: string | boolean) => {
          if (result === 'view') {
            this.coreService.openVisitPrescriptionModal({ uuid: this.visitUuid });
          } else if (result === 'dashboard') {
            this.router.navigate(['/dashboard']);
          }
        });
      },
      error: () => this.showSharePrescriptionError()
    });
  }

  private showSharePrescriptionError(): void {
    this.coreService.openSharePrescriptionErrorModal({
      msg: 'Unable to send prescription due to poor network connection. Please try again or come back later',
      confirmBtnText: 'Try again'
    }).subscribe((retry: boolean) => {
      if (retry) { this.completeVisitAndShare(); }
    });
  }

  private removeItem(list: { uuid?: string }[], index: number, uuid?: string): void {
    if (uuid) {
      this.v2Service.deleteObs(uuid).subscribe(() => list.splice(index, 1));
    } else {
      list.splice(index, 1);
    }
  }
}
