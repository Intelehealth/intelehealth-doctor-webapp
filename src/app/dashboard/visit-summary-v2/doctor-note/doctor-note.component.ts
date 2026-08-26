import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { Router } from '@angular/router';
import { Subject, of } from 'rxjs';
import { debounceTime, distinctUntilChanged, switchMap } from 'rxjs/operators';
import { doctorDetails } from 'src/config/constant';
import { getCacheData } from 'src/app/utils/utility-functions';
import { PatientModel, VisitModel } from 'src/app/model/model';
import { CoreService } from 'src/app/services/core/core.service';
import { ReportAiIssueDialogData } from 'src/app/modal-components/report-ai-issue/report-ai-issue.component';
import {
  DiagnosisOption, DraftAdvice, DraftDiagnosis, DraftMedication, DraftReferral,
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
  ADVICE_SEARCH_MAX_RESULTS, ADVICE_SEARCH_MIN_LENGTH, REFERRAL_PRIORITIES,
  TIMING_OPTIONS
} from './doctor-note.constants';

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

  spokenToPatient = true;
  patientInteractionUuid = '';
  prescriptionShared = false;
  savingPatientInteraction = false;
  ayuQuestionsExpanded = false;
  ayuSuggestedQuestions: AyuSuggestedQuestion[] = [];
  ayuRefineText = '';
  private ayuNoteUuid = '';

  hasEnoughInfo = true;

  aiDiagnosisState: AiDiagnosisState = 'loading';
  aiSummaryExpanded = false;
  improveExpanded = true;
  improveContextText = '';
  selectedContextChips: string[] = [];
  whySuggestion: AiDiagnosisSuggestion | null = null;
  selectedDiagnoses: SelectedDiagnosis[] = [];

  aiClinicalSummary = '';
  aiSuggestions: AiDiagnosisSuggestion[] = [];

  diagnosisSearchTerm = '';
  diagnosisSearching = false;
  diagnosisResults: DiagnosisOption[] = [];
  private diagnosisSearch$ = new Subject<string>();
  addedDiagnoses: DraftDiagnosis[] = [];

  newNoteText = '';
  outcomeNotes: DraftTextItem[] = [];

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

  newMedicine: { drug: string | null; dose: string | null; frequency: string | null; durationNo: string; durationUnit: string | null; instructRemark: string | null } =
    { drug: null, dose: null, frequency: null, durationNo: '', durationUnit: null, instructRemark: null };
  addedMedicines: DraftMedication[] = [];
  private editMedicineUuid = '';
  private editMedicineIndex = -1;
  medInstructionText = '';
  medInstructions: DraftTextItem[] = [];

  adviceSearchTerm = '';
  adviceResults: string[] = [];
  adviceOptions: string[] = [];
  advices: DraftAdvice[] = [];
  selectedAdvices: string[] = [];
  openBundle: AdviceBundle | null = null;

  newTestText: string | null = null;
  testOptions: string[] = [];
  tests: DraftTest[] = [];

  referralSpecialityOptions: string[] = [];
  newReferral: { speciality: string | null; facility: string | null; priority: string | null; reason: string } =
    { speciality: null, facility: null, priority: null, reason: '' };
  referrals: DraftReferral[] = [];

  wantFollowUp = false;
  followUpType: string | null = null;
  followUpDate = '';
  followUpTime: string | null = null;
  followUpReason = '';
  followUpUuid = '';
  followUpTimeSlots: string[] = [];
  readonly quickFollowUpDays = [3, 7, 10, 30];
  minFollowUpDate = new Date().toISOString().slice(0, 10);

  private provider = getCacheData(true, doctorDetails.PROVIDER);

  constructor(
    private v2Service: VisitSummaryV2Service,
    private coreService: CoreService,
    private router: Router
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

  get whatsAppLink(): string | null {
    if (!this.patientPhoneNo) {
      return null;
    }
    return `https://wa.me/${this.patientPhoneNo.replace(/[^\d]/g, '')}`;
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
      this.loadAiDiagnosis(notes);
    });
  }

  private buildAyuNotes(): string {
    const answered = this.ayuSuggestedQuestions
      .filter(q => !!q.answer)
      .map(q => `${q.question} ${q.answer}`);
    return [...answered, this.ayuRefineText].filter(Boolean).join('\n');
  }

  savePatientInteraction(): void {
    if (!this.visitUuid || this.savingPatientInteraction) { return; }
    this.savingPatientInteraction = true;
    this.v2Service.savePatientInteraction(
      this.visitUuid, this.spokenToPatient ? 'Yes' : 'No', this.patientInteractionUuid
    ).subscribe({
      next: (res: any) => {
        this.patientInteractionUuid = res?.uuid || this.patientInteractionUuid;
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
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['visitCompleted'] && this.visitCompleted) {
      this.prescriptionShared = true;
    }
    if ((changes['visitUuid'] || changes['patientUuid']) && this.patientUuid && this.visitUuid) {
      this.loadDraft();
    }
    if (changes['visit'] && this.visit) {
      this.loadPatientInteraction();
    }
    if ((changes['visit'] || changes['patientInfo']) && this.visit && this.patientInfo) {
      this.loadInteractionNote();
    }
  }

  private loadDraft(): void {
    this.v2Service.loadDraftNote(this.patientUuid, this.visitUuid).subscribe(draft => {
      this.addedDiagnoses = draft.diagnoses;
      this.addedMedicines = draft.medications;
      this.advices = draft.advices;
      this.tests = draft.tests;
      this.referrals = draft.referrals;
      this.outcomeNotes = draft.notes;
      this.medInstructions = draft.additionalInstruction ? [draft.additionalInstruction] : [];
      if (draft.followUp) {
        this.wantFollowUp = draft.followUp.wantFollowUp;
        this.followUpDate = draft.followUp.date;
        this.followUpTime = draft.followUp.time || null;
        this.followUpReason = draft.followUp.reason;
        this.followUpType = draft.followUp.type || null;
        this.followUpUuid = draft.followUp.uuid;
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
    if (!this.canWrite()) { return; }
    [...this.selectedDiagnoses].forEach(dx => {
      const payload = { name: dx.name, type: dx.type, status: dx.status, code: dx.code || DEFAULT_DIAGNOSIS_CODE };
      this.v2Service.saveDiagnosis(this.patientUuid, this.visitNoteUuid, payload).subscribe(res => {
        this.addedDiagnoses.push({ ...payload, uuid: res?.uuid || '' });
        const index = this.selectedDiagnoses.findIndex(d => d.name === dx.name);
        if (index > -1) { this.selectedDiagnoses.splice(index, 1); }
        this.loadAiTreatment();
      });
    });
  }

  private loadAiTreatment(): void {
    const diagnosis = this.addedDiagnoses.map(d => d.name).join(', ');
    if (!diagnosis || !this.visit || !this.patientInfo) { return; }
    this.aiMedicationState = 'loading';
    this.v2Service.loadAiTreatment(this.patientInfo, this.visit, diagnosis, this.visitCompleted).subscribe({
      next: result => {
        this.aiMedicationSuggestions = result.medicines;
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

  isContextChipOn(chip: string): boolean {
    return this.selectedContextChips.includes(chip);
  }

  toggleContextChip(chip: string): void {
    const index = this.selectedContextChips.indexOf(chip);
    if (index > -1) {
      this.selectedContextChips.splice(index, 1);
    } else {
      this.selectedContextChips.push(chip);
    }
  }

  updateAiSuggestions(): void {
    this.whySuggestion = null;
    this.loadAiDiagnosis(this.buildAiNotes());
  }

  addDiagnosisManually(): void {
    this.aiDiagnosisState = 'ready';
    this.aiSuggestions = [];
    this.aiClinicalSummary = '';
  }

  retryAiDiagnosis(): void {
    this.loadAiDiagnosis(this.buildAiNotes());
  }

  private buildAiNotes(): string {
    return [this.buildAyuNotes(), this.improveContextText, ...this.selectedContextChips]
      .filter(Boolean).join('\n');
  }

  private loadAiDiagnosis(notes = ''): void {
    if (!this.visit || !this.patientInfo) { return; }
    this.aiDiagnosisState = 'loading';
    this.v2Service.loadAiDiagnosis(this.patientInfo, this.visit, notes, this.visitCompleted).subscribe({
      next: result => {
        this.aiClinicalSummary = result.summary;
        this.aiSuggestions = result.suggestions;
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
    this.removeItem(this.addedDiagnoses, index, uuid);
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
      durationUnit: suggestion?.durationUnit || '',
      remarks: suggestion?.remarks || '',
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
    if (!m.timing && !m.strength && !m.days && !m.remarks) {
      this.selectedMedicines.splice(index, 1);
      return;
    }
    m.editing = false;
  }

  removeSelectedMedicine(index: number): void {
    this.selectedMedicines.splice(index, 1);
  }

  submitSelectedMedicines(): void {
    if (!this.canWrite() || !this.canSubmitMedicines) { return; }
    [...this.selectedMedicines].forEach(m => {
      const med = {
        drug: m.drug,
        dose: m.strength,
        frequency: m.timing,
        durationNo: m.days,
        durationUnit: m.durationUnit || DEFAULT_MEDICINE_DURATION_UNIT,
        instructRemark: m.remarks
      };
      this.v2Service.saveMedication(this.patientUuid, this.visitNoteUuid, med).subscribe(res => {
        this.addedMedicines.push({ ...med, uuid: res?.uuid || '' });
        const index = this.selectedMedicines.findIndex(x => x.drug === m.drug);
        if (index > -1) { this.selectedMedicines.splice(index, 1); }
      });
    });
  }

  addMedicationManually(): void {
    this.aiMedicationState = 'ready';
    this.aiMedicationSuggestions = [];
  }

  retryAiMedication(): void {
    this.loadAiTreatment();
  }

  addMedicine(): void {
    if (!this.canWrite()) { return; }
    const m = this.newMedicine;
    if (!m.drug || !m.dose || !m.durationNo || !/^[0-9]+$/.test(m.durationNo) || !m.durationUnit) { return; }
    const med = {
      drug: m.drug || '', dose: m.dose || '', frequency: m.frequency || '',
      durationNo: m.durationNo || '', durationUnit: m.durationUnit || '', instructRemark: m.instructRemark || ''
    };
    this.v2Service.saveMedication(this.patientUuid, this.visitNoteUuid, med, this.editMedicineUuid || undefined).subscribe(res => {
      const item = { ...med, uuid: res?.uuid || this.editMedicineUuid };
      if (this.editMedicineIndex > -1) {
        this.addedMedicines[this.editMedicineIndex] = item;
      } else {
        this.addedMedicines.push(item);
      }
      this.cancelMedicine();
    });
  }

  editMedicine(index: number): void {
    const m = this.addedMedicines[index];
    this.newMedicine = {
      drug: m.drug || null, dose: m.dose || null, frequency: m.frequency || null,
      durationNo: m.durationNo || '', durationUnit: m.durationUnit || null, instructRemark: m.instructRemark || null
    };
    this.editMedicineIndex = index;
    this.editMedicineUuid = m.uuid || '';
  }

  cancelMedicine(): void {
    this.newMedicine = { drug: null, dose: null, frequency: null, durationNo: '', durationUnit: null, instructRemark: null };
    this.editMedicineIndex = -1;
    this.editMedicineUuid = '';
  }

  deleteMedicine(index: number, uuid?: string): void {
    this.removeItem(this.addedMedicines, index, uuid);
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
    this.removeItem(this.advices, index, uuid);
  }

  cancelAdvice(): void {
    this.clearAdviceSearch();
    this.selectedAdvices = [];
    this.openBundle = null;
  }

  isTestAdded(value: string): boolean {
    return this.tests.some(t => t.value.toLowerCase() === value.toLowerCase());
  }

  addAiTest(value: string): void {
    if (this.isTestAdded(value)) { return; }
    this.newTestText = value;
    this.addTest();
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

  addTest(): void {
    if (!this.newTestText || !this.canWrite()) { return; }
    const value = this.newTestText;
    if (this.tests.find(t => t.value === value)) {
      this.coreService.showToast('warning', 'Test already added, please add another test.', 'Already Added', 'warning-test-toast');
      return;
    }
    this.v2Service.saveTest(this.patientUuid, this.visitNoteUuid, value).subscribe(res => {
      this.tests.push({ value, uuid: res?.uuid || '' });
      this.newTestText = null;
    });
  }

  deleteTest(index: number, uuid?: string): void {
    this.removeItem(this.tests, index, uuid);
  }

  cancelTest(): void {
    this.newTestText = null;
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
    this.removeItem(this.referrals, index, uuid);
  }

  cancelReferral(): void {
    this.newReferral = { speciality: null, facility: null, priority: null, reason: '' };
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
    this.removeItem(this.outcomeNotes, index, uuid);
  }

  cancelNote(): void {
    this.newNoteText = '';
  }

  addMedInstruction(): void {
    if (!this.medInstructionText || !this.canWrite()) { return; }
    const value = this.medInstructionText;
    const existingUuid = this.medInstructions[0]?.uuid;
    this.v2Service.saveAdditionalInstruction(this.patientUuid, this.visitNoteUuid, value, existingUuid).subscribe(res => {
      this.medInstructions = [{ value, uuid: res?.uuid || existingUuid }];
      this.medInstructionText = '';
    });
  }

  deleteMedInstruction(index: number, uuid?: string): void {
    this.removeItem(this.medInstructions, index, uuid);
  }

  cancelMedInstruction(): void {
    this.medInstructionText = '';
  }

  saveFollowUp(): void {
    if (!this.canWrite()) { return; }
    if (!this.wantFollowUp) {
      if (this.followUpUuid) {
        this.v2Service.deleteObs(this.followUpUuid).subscribe(() => { this.followUpUuid = ''; });
      }
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
      .subscribe(res => { this.followUpUuid = res?.uuid || this.followUpUuid; });
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
      this.wantFollowUp = false;
      this.followUpType = null;
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
    this.coreService.openSharePrescriptionConfirmModal().subscribe((confirmed: boolean) => {
      if (!confirmed) { return; }
      this.completeVisitAndShare();
    });
  }

  private completeVisitAndShare(): void {
    this.v2Service.completeVisit(this.visitUuid, this.patientUuid, this.provider).subscribe({
      next: (res) => {
        if (!res) { this.showSharePrescriptionError(); return; }
        this.prescriptionShared = true;
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
