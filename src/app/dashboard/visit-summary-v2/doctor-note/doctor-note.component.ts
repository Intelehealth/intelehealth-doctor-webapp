import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { Router } from '@angular/router';
import { Subject, of } from 'rxjs';
import { debounceTime, distinctUntilChanged, switchMap } from 'rxjs/operators';
import { doctorDetails } from 'src/config/constant';
import { getCacheData } from 'src/app/utils/utility-functions';
import { CoreService } from 'src/app/services/core/core.service';
import {
  DiagnosisOption, DraftAdvice, DraftDiagnosis, DraftMedication, DraftReferral,
  DraftTest, DraftTextItem, VisitSummaryV2Service
} from '../visit-summary-v2.service';
import {
  AdviceBundle, AiDiagnosisState, AiDiagnosisSuggestion, AiMedicationState, AiMedicationSuggestion,
  AyuSuggestedQuestion, SelectedDiagnosis, SelectedMedicine
} from '../visit-summary-v2.models';
import {
  ADVICE_BUNDLES, AI_SUGGESTION_DELAY_MS, CONTEXT_CHIPS, DAY_OPTIONS, DEFAULT_AI_CLINICAL_SUMMARY,
  DEFAULT_AI_DIAGNOSIS_SUGGESTIONS, DEFAULT_AI_MEDICATION_SUGGESTIONS, DEFAULT_AYU_SUGGESTED_QUESTIONS,
  DEFAULT_DIAGNOSIS_CODE, DEFAULT_DIAGNOSIS_STATUS, DEFAULT_DIAGNOSIS_TYPE, DEFAULT_MEDICINE_DURATION_UNIT,
  DIAGNOSIS_SEARCH_DEBOUNCE_MS, DIAGNOSIS_SEARCH_MIN_LENGTH, DIAGNOSIS_STATUSES, DIAGNOSIS_TYPES,
  DOSE_OPTIONS, DRUG_OPTIONS, DURATION_UNIT_OPTIONS, FACILITY_OPTIONS, FREQUENCY_OPTIONS,
  INSTRUCTION_OPTIONS, QUICK_ADVICES, QUICK_DIAGNOSES, QUICK_MEDICINES, REFERRAL_PRIORITIES,
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

  readonly contextChips = CONTEXT_CHIPS;
  readonly diagnosisTypes = DIAGNOSIS_TYPES;
  readonly diagnosisStatuses = DIAGNOSIS_STATUSES;
  readonly quickDiagnoses = QUICK_DIAGNOSES;
  readonly drugOptions = DRUG_OPTIONS;
  readonly doseOptions = DOSE_OPTIONS;
  readonly durationUnitOptions = DURATION_UNIT_OPTIONS;
  readonly instructionOptions = INSTRUCTION_OPTIONS;
  readonly frequencyOptions = FREQUENCY_OPTIONS;
  readonly quickMedicines = QUICK_MEDICINES;
  readonly timingOptions = TIMING_OPTIONS;
  readonly dayOptions = DAY_OPTIONS;
  readonly quickAdvices = QUICK_ADVICES;
  readonly adviceBundles = ADVICE_BUNDLES;
  readonly facilityOptions = FACILITY_OPTIONS;
  readonly referralPriorities = REFERRAL_PRIORITIES;

  spokenToPatient = true;
  ayuQuestionsExpanded = false;
  ayuSuggestedQuestions: AyuSuggestedQuestion[] = DEFAULT_AYU_SUGGESTED_QUESTIONS.map(q => ({ ...q }));
  ayuRefineText = '';

  hasEnoughInfo = true;

  aiDiagnosisState: AiDiagnosisState = 'ready';
  aiSummaryExpanded = false;
  improveExpanded = true;
  improveContextText = '';
  selectedContextChips: string[] = [];
  whySuggestion: AiDiagnosisSuggestion | null = null;
  selectedDiagnoses: SelectedDiagnosis[] = [];

  aiClinicalSummary = DEFAULT_AI_CLINICAL_SUMMARY;
  aiSuggestions: AiDiagnosisSuggestion[] = [...DEFAULT_AI_DIAGNOSIS_SUGGESTIONS];

  selectedDiagnosis: DiagnosisOption | null = null;
  diagnosisResults: DiagnosisOption[] = [];
  private diagnosisSearch$ = new Subject<string>();
  newDiagnosisType = DEFAULT_DIAGNOSIS_TYPE;
  newDiagnosisStatus = DEFAULT_DIAGNOSIS_STATUS;
  addedDiagnoses: DraftDiagnosis[] = [];
  private editDiagnosisUuid = '';
  private editDiagnosisIndex = -1;

  noteSharedWithPatient = true;
  newNoteText = '';
  outcomeNotes: DraftTextItem[] = [];

  aiMedicationState: AiMedicationState = 'ready';
  whyMedication: AiMedicationSuggestion | null = null;
  searchedDrug: string | null = null;
  selectedMedicines: SelectedMedicine[] = [];

  aiMedicationSuggestions: AiMedicationSuggestion[] = [...DEFAULT_AI_MEDICATION_SUGGESTIONS];

  newMedicine: { drug: string | null; dose: string | null; frequency: string | null; durationNo: string; durationUnit: string | null; instructRemark: string | null } =
    { drug: null, dose: null, frequency: null, durationNo: '', durationUnit: null, instructRemark: null };
  addedMedicines: DraftMedication[] = [];
  private editMedicineUuid = '';
  private editMedicineIndex = -1;
  medInstructionText = '';
  medInstructions: DraftTextItem[] = [];

  newAdviceText: string | null = null;
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
  minFollowUpDate = new Date().toISOString().slice(0, 10);

  uploadedDocs: { name: string }[] = [];

  private provider = getCacheData(true, doctorDetails.PROVIDER);

  constructor(
    private v2Service: VisitSummaryV2Service,
    private coreService: CoreService,
    private router: Router
  ) {}

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
  }

  ngOnInit(): void {
    this.diagnosisSearch$.pipe(
      debounceTime(DIAGNOSIS_SEARCH_DEBOUNCE_MS),
      distinctUntilChanged(),
      switchMap(term => term && term.length >= DIAGNOSIS_SEARCH_MIN_LENGTH ? this.v2Service.searchDiagnosis(term) : of([]))
    ).subscribe(results => { this.diagnosisResults = results; });

    this.v2Service.getAdvicesList().subscribe(list => { this.adviceOptions = list; });
    this.v2Service.getTestsList().subscribe(list => { this.testOptions = list; });
    this.referralSpecialityOptions = this.v2Service.getReferralSpecialities();
    this.followUpTimeSlots = this.v2Service.getFollowUpTimeSlots();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if ((changes['visitUuid'] || changes['patientUuid']) && this.patientUuid && this.visitUuid) {
      this.loadDraft();
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
    });
  }

  private canWrite(): boolean {
    return !!(this.patientUuid && this.visitNoteUuid);
  }

  onDiagnosisSearch(event: { term: string }): void {
    this.diagnosisSearch$.next(event.term);
  }

  isDiagnosisSelected(name: string): boolean {
    return this.selectedDiagnoses.some(d => d.name.toLowerCase() === name.toLowerCase());
  }

  toggleAiSuggestion(suggestion: AiDiagnosisSuggestion): void {
    this.toggleSelectedDiagnosis(suggestion.name, 'ai');
  }

  toggleQuickDiagnosis(name: string): void {
    this.toggleSelectedDiagnosis(name, 'manual');
  }

  private toggleSelectedDiagnosis(name: string, source: 'ai' | 'manual', code = DEFAULT_DIAGNOSIS_CODE): void {
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

  onDiagnosisPicked(option: DiagnosisOption | null): void {
    if (!option?.name) { return; }
    this.toggleSelectedDiagnosis(option.name, 'manual', option.code || DEFAULT_DIAGNOSIS_CODE);
    this.selectedDiagnosis = null;
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
      });
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
    this.aiDiagnosisState = 'loading';
    this.whySuggestion = null;
    setTimeout(() => { this.aiDiagnosisState = 'ready'; }, AI_SUGGESTION_DELAY_MS);
  }

  addDiagnosisManually(): void {
    this.aiDiagnosisState = 'ready';
    this.aiSuggestions = [];
    this.aiClinicalSummary = '';
  }

  retryAiDiagnosis(): void {
    this.aiDiagnosisState = 'loading';
    setTimeout(() => { this.aiDiagnosisState = 'ready'; }, AI_SUGGESTION_DELAY_MS);
  }

  addDiagnosis(): void {
    if (!this.selectedDiagnosis?.name || !this.canWrite()) { return; }
    const dx = {
      name: this.selectedDiagnosis.name,
      type: this.newDiagnosisType,
      status: this.newDiagnosisStatus,
      code: this.selectedDiagnosis.code || DEFAULT_DIAGNOSIS_CODE
    };
    this.v2Service.saveDiagnosis(this.patientUuid, this.visitNoteUuid, dx, this.editDiagnosisUuid || undefined).subscribe(res => {
      const item = { ...dx, uuid: res?.uuid || this.editDiagnosisUuid };
      if (this.editDiagnosisIndex > -1) {
        this.addedDiagnoses[this.editDiagnosisIndex] = item;
      } else {
        this.addedDiagnoses.push(item);
      }
      this.cancelDiagnosis();
    });
  }

  editDiagnosis(index: number): void {
    const dx = this.addedDiagnoses[index];
    this.selectedDiagnosis = { name: dx.name, code: dx.code || DEFAULT_DIAGNOSIS_CODE };
    this.diagnosisResults = [this.selectedDiagnosis];
    this.newDiagnosisType = dx.type;
    this.newDiagnosisStatus = dx.status;
    this.editDiagnosisIndex = index;
    this.editDiagnosisUuid = dx.uuid || '';
  }

  cancelDiagnosis(): void {
    this.selectedDiagnosis = null;
    this.diagnosisResults = [];
    this.newDiagnosisType = DEFAULT_DIAGNOSIS_TYPE;
    this.newDiagnosisStatus = DEFAULT_DIAGNOSIS_STATUS;
    this.editDiagnosisIndex = -1;
    this.editDiagnosisUuid = '';
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
    return this.selectedMedicines.some(m => m.drug.toLowerCase() === name.toLowerCase());
  }

  toggleAiMedication(suggestion: AiMedicationSuggestion): void {
    this.toggleSelectedMedicine(suggestion.name, 'ai');
  }

  toggleQuickMedicine(name: string): void {
    this.toggleSelectedMedicine(name, 'manual');
  }

  private toggleSelectedMedicine(drug: string, source: 'ai' | 'manual'): void {
    const index = this.selectedMedicines.findIndex(m => m.drug.toLowerCase() === drug.toLowerCase());
    if (index > -1) {
      this.selectedMedicines.splice(index, 1);
      return;
    }
    this.selectedMedicines.push({ drug, source, timing: '', strength: '', days: '', remarks: '', editing: true });
  }

  toggleMedicationWhy(suggestion: AiMedicationSuggestion, event: Event): void {
    event.stopPropagation();
    this.whyMedication = this.whyMedication === suggestion ? null : suggestion;
  }

  onMedicinePicked(drug: string | null): void {
    if (!drug) { return; }
    this.toggleSelectedMedicine(drug, 'manual');
    this.searchedDrug = null;
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
        durationUnit: DEFAULT_MEDICINE_DURATION_UNIT,
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
    this.aiMedicationState = 'loading';
    setTimeout(() => { this.aiMedicationState = 'ready'; }, AI_SUGGESTION_DELAY_MS);
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

  onAdvicePicked(value: string | null): void {
    if (!value) { return; }
    this.toggleAdvice(value);
    this.newAdviceText = null;
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
    this.newAdviceText = null;
    this.selectedAdvices = [];
    this.openBundle = null;
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
      this.v2Service.completeVisit(this.visitUuid, this.patientUuid, this.provider).subscribe((res) => {
        if (res) {
          this.coreService.openSharePrescriptionSuccessModal().subscribe((result: string | boolean) => {
            if (result === 'view') {
              this.coreService.openVisitPrescriptionModal({ uuid: this.visitUuid });
            } else if (result === 'dashboard') {
              this.router.navigate(['/dashboard']);
            }
          });
        }
      });
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
