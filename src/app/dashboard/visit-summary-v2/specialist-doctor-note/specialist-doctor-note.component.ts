import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { Router } from '@angular/router';
import { Subject, of } from 'rxjs';
import { debounceTime, distinctUntilChanged, finalize, switchMap } from 'rxjs/operators';
import { doctorDetails } from 'src/config/constant';
import { environment } from 'src/environments/environment';
import { getCacheData } from 'src/app/utils/utility-functions';
import { VisitModel } from 'src/app/model/model';
import { CoreService } from 'src/app/services/core/core.service';
import {
  DiagnosisOption, DraftAdvice, DraftDiagnosis, DraftInstruction, DraftMedication, DraftReferral,
  DraftTest, DraftTextItem, VisitSummaryV2Service
} from '../visit-summary-v2.service';
import {
  DAY_OPTIONS, DEFAULT_DIAGNOSIS_CODE,
  DEFAULT_MEDICINE_DURATION_UNIT, DEFAULT_REFERRAL_PRIORITY, DIAGNOSIS_SEARCH_DEBOUNCE_MS,
  DIAGNOSIS_SEARCH_MIN_LENGTH, DIAGNOSIS_TYPES, DOSE_OPTIONS, DRUG_OPTIONS, FACILITY_OPTIONS,
  REFERRAL_PRIORITIES, TIMING_OPTIONS
} from '../doctor-note/doctor-note.constants';
import { FOLLOW_UP_TYPES, FOLLOW_UP_TYPE_TELEMEDICINE, SPECIALIST_DIAGNOSIS_STATUSES } from './specialist-doctor-note.constants';

/**
 * The NAMCO specialist's own note, saved against their "Specialist Visit Note" encounter.
 * Plain entry forms only (no AI), per the Specialist Doctor's Note design.
 */
@Component({
  selector: 'app-specialist-doctor-note',
  templateUrl: './specialist-doctor-note.component.html',
  styleUrls: ['./specialist-doctor-note.component.scss']
})
export class SpecialistDoctorNoteComponent implements OnInit, OnChanges {
  @Input() patientUuid!: string;
  @Input() visitUuid!: string;
  @Input() visitNoteUuid!: string;
  /** Encounters the note obs are read from: own Specialist Visit Note + the visit's Referral encounter. */
  @Input() noteEncounterUuids: string[] = [];
  @Input() patientPhoneNo = '';
  @Input() visit!: VisitModel;
  @Input() visitCompleted = false;

  readonly diagnosisTypes = DIAGNOSIS_TYPES;
  readonly diagnosisStatuses = SPECIALIST_DIAGNOSIS_STATUSES;
  readonly drugOptions = DRUG_OPTIONS;
  readonly doseOptions = DOSE_OPTIONS;
  readonly timingOptions = TIMING_OPTIONS;
  readonly dayOptions = DAY_OPTIONS;
  readonly facilityOptions = FACILITY_OPTIONS;
  readonly referralPriorities = REFERRAL_PRIORITIES;
  readonly followUpTypes = FOLLOW_UP_TYPES;
  readonly isTurnServer = !!environment.isTurnServer;

  prescriptionShared = false;
  collapsed: Record<string, boolean> = {};

  // Radios start unselected — nothing is pre-picked for the specialist.
  spokenToPatient: boolean | null = null;
  private patientInteractionUuid = '';
  savingPatientInteraction = false;
  /** The answer last saved from this note — Save stays disabled until the doctor changes it. */
  savedSpokenToPatient: boolean | null = null;

  hasEnoughInfo: boolean | null = null;
  newDiagnosis: { option: DiagnosisOption | null; type: string | null; status: string | null } =
    { option: null, type: null, status: null };
  diagnosisResults: DiagnosisOption[] = [];
  diagnosisSearching = false;
  readonly diagnosisSearch$ = new Subject<string>();
  diagnoses: DraftDiagnosis[] = [];

  newNoteText = '';
  notes: DraftTextItem[] = [];

  newMedicine: { drug: string | null; dose: string | null; frequency: string | null; instructRemark: string; durationNo: string | null } =
    { drug: null, dose: null, frequency: null, instructRemark: '', durationNo: null };
  medicines: DraftMedication[] = [];
  medInstructionText = '';
  savingMedInstruction = false;
  medInstructions: DraftInstruction[] = [];

  newAdviceText = '';
  savingAdvice = false;
  advices: DraftAdvice[] = [];

  newTestText = '';
  tests: DraftTest[] = [];

  referralSpecialityOptions: string[] = [];
  newReferral: { speciality: string | null; facility: string | null; priority: string | null; reason: string } =
    { speciality: null, facility: null, priority: DEFAULT_REFERRAL_PRIORITY, reason: '' };
  referrals: DraftReferral[] = [];

  wantFollowUp: boolean | null = null;
  followUpDate = '';
  followUpTime: string | null = null;
  followUpReason = '';
  followUpType = this.defaultFollowUpType;
  followUpUuid = '';
  savingFollowUp = false;
  followUpTimeSlots: string[] = [];
  minFollowUpDate = new Date().toISOString().slice(0, 10);

  private provider = getCacheData(true, doctorDetails.PROVIDER);

  constructor(
    private v2Service: VisitSummaryV2Service,
    private coreService: CoreService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.diagnosisSearch$.pipe(
      debounceTime(DIAGNOSIS_SEARCH_DEBOUNCE_MS),
      distinctUntilChanged(),
      switchMap(term => {
        const search = term && term.length >= DIAGNOSIS_SEARCH_MIN_LENGTH;
        this.diagnosisSearching = !!search;
        return search ? this.v2Service.searchDiagnosis(term) : of([]);
      })
    ).subscribe(results => {
      this.diagnosisResults = results;
      this.diagnosisSearching = false;
    });
    this.referralSpecialityOptions = this.v2Service.getReferralSpecialities();
    this.followUpTimeSlots = this.v2Service.getFollowUpTimeSlots();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['visitCompleted'] && this.visitCompleted) {
      this.prescriptionShared = true;
    }
    if ((changes['visitUuid'] || changes['patientUuid'] || changes['noteEncounterUuids']) && this.patientUuid && this.visitUuid) {
      this.loadDraft();
    }
    if (changes['visit'] && this.visit) {
      this.loadPatientInteraction();
    }
  }

  private loadDraft(): void {
    this.v2Service.loadDraftNote(this.patientUuid, this.visitUuid, this.noteEncounterUuids).subscribe(draft => {
      this.diagnoses = draft.diagnoses;
      this.medicines = draft.medications;
      this.advices = draft.advices;
      this.tests = draft.tests;
      this.referrals = draft.referrals;
      this.notes = draft.notes;
      this.medInstructions = draft.additionalInstruction ? [draft.additionalInstruction] : [];
      if (draft.followUp) {
        this.wantFollowUp = draft.followUp.wantFollowUp;
        this.followUpDate = draft.followUp.date;
        this.followUpTime = draft.followUp.time || null;
        this.followUpReason = draft.followUp.reason;
        this.followUpType = draft.followUp.type || this.defaultFollowUpType;
        this.followUpUuid = draft.followUp.uuid;
        this.followUpTimeSlots = this.v2Service.getFollowUpTimeSlots(this.followUpDate);
      }
    });
  }

  toggleSection(key: string): void {
    this.collapsed[key] = !this.collapsed[key];
  }

  /** Open a section (e.g. when it's picked from the sidebar). */
  expandSection(key: string): void {
    this.collapsed[key] = false;
  }

  private canWrite(): boolean {
    return !!(this.patientUuid && this.visitNoteUuid);
  }

  get whatsAppLink(): string | null {
    return this.v2Service.whatsAppLink(this.patientPhoneNo);
  }

  /**
  * "Patient interaction" is a single visit-level attribute that the referring doctor has
  * usually already answered, so their answer is not pre-selected here — only the attribute's
  * uuid is kept, so saving updates it rather than adding a second one.
  */
  private loadPatientInteraction(): void {
    this.patientInteractionUuid = this.v2Service.getPatientInteraction(this.visit).uuid;
  }

  savePatientInteraction(): void {
    if (!this.visitUuid || this.savingPatientInteraction || this.spokenToPatient === null) { return; }
    this.savingPatientInteraction = true;
    this.v2Service.savePatientInteraction(this.visitUuid, this.spokenToPatient ? 'Yes' : 'No', this.patientInteractionUuid).subscribe({
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

  addDiagnosis(): void {
    const option = this.newDiagnosis.option;
    if (!option?.name || !this.newDiagnosis.type || !this.newDiagnosis.status || !this.canWrite()) { return; }
    if (this.diagnoses.find(d => d.name === option.name)) {
      this.coreService.showToast('warning', 'Diagnosis already added, please add another diagnosis.', 'Already Added', 'warning-diagnosis-toast');
      return;
    }
    const dx = { name: option.name, type: this.newDiagnosis.type, status: this.newDiagnosis.status, code: option.code || DEFAULT_DIAGNOSIS_CODE };
    this.v2Service.saveDiagnosis(this.patientUuid, this.visitNoteUuid, dx).subscribe(res => {
      this.diagnoses.push({ ...dx, uuid: res?.uuid || '' });
      this.cancelDiagnosis();
    });
  }

  cancelDiagnosis(): void {
    this.newDiagnosis = { option: null, type: null, status: null };
    this.diagnosisResults = [];
  }

  deleteDiagnosis(index: number, uuid?: string): void {
    this.v2Service.removeDraftItem(this.diagnoses, index, uuid);
  }

  addNote(): void {
    const value = this.newNoteText.trim();
    if (!value || !this.canWrite()) { return; }
    this.v2Service.saveNote(this.patientUuid, this.visitNoteUuid, value).subscribe(res => {
      this.notes.push({ value, uuid: res?.uuid || '' });
      this.newNoteText = '';
    });
  }

  deleteNote(index: number, uuid?: string): void {
    this.v2Service.removeDraftItem(this.notes, index, uuid);
  }

  addMedicine(): void {
    const m = this.newMedicine;
    if (!m.drug || !m.dose || !m.durationNo || !/^[0-9]+$/.test(m.durationNo) || !this.canWrite()) { return; }
    const med = {
      drug: m.drug, dose: m.dose, frequency: m.frequency || '', durationNo: m.durationNo,
      durationUnit: DEFAULT_MEDICINE_DURATION_UNIT, instructRemark: m.instructRemark || ''
    };
    this.v2Service.saveMedication(this.patientUuid, this.visitNoteUuid, med).subscribe(res => {
      this.medicines.push({ ...med, uuid: res?.uuid || '' });
      this.cancelMedicine();
    });
  }

  cancelMedicine(): void {
    this.newMedicine = { drug: null, dose: null, frequency: null, instructRemark: '', durationNo: null };
  }

  deleteMedicine(index: number, uuid?: string): void {
    this.v2Service.removeDraftItem(this.medicines, index, uuid);
  }

  addMedInstruction(): void {
    const value = this.medInstructionText.trim();
    if (!value || !this.canWrite() || this.savingMedInstruction) { return; }
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

  addAdvice(): void {
    const value = this.newAdviceText.trim();
    if (!value || !this.canWrite() || this.savingAdvice) { return; }
    if (this.advices.find(a => a.value === value)) {
      this.coreService.showToast('warning', 'Advice already added, please add another advice.', 'Already Added', 'warning-advice-toast');
      return;
    }
    this.savingAdvice = true;
    this.v2Service.saveAdvice(this.patientUuid, this.visitNoteUuid, value)
      .pipe(finalize(() => { this.savingAdvice = false; }))
      .subscribe(res => {
        this.advices.push({ value, uuid: res?.uuid || '' });
        this.newAdviceText = '';
      });
  }

  deleteAdvice(index: number, uuid?: string): void {
    this.v2Service.removeDraftItem(this.advices, index, uuid);
  }

  addTest(): void {
    const value = this.newTestText.trim();
    if (!value || !this.canWrite()) { return; }
    if (this.tests.find(t => t.value === value)) {
      this.coreService.showToast('warning', 'Test already added, please add another test.', 'Already Added', 'warning-test-toast');
      return;
    }
    this.v2Service.saveTest(this.patientUuid, this.visitNoteUuid, value).subscribe(res => {
      this.tests.push({ value, uuid: res?.uuid || '' });
      this.newTestText = '';
    });
  }

  deleteTest(index: number, uuid?: string): void {
    this.v2Service.removeDraftItem(this.tests, index, uuid);
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

  cancelReferral(): void {
    this.newReferral = { speciality: null, facility: null, priority: DEFAULT_REFERRAL_PRIORITY, reason: '' };
  }

  deleteReferral(index: number, uuid?: string): void {
    this.v2Service.removeDraftItem(this.referrals, index, uuid);
  }

  /** Turn server: always Telemedicine (not asked), as in the old Visit Summary. */
  private get defaultFollowUpType(): string {
    return environment.isTurnServer ? FOLLOW_UP_TYPE_TELEMEDICINE : '';
  }

  onFollowUpDateChange(): void {
    this.followUpTimeSlots = this.v2Service.getFollowUpTimeSlots(this.followUpDate);
    if (this.followUpTime && !this.followUpTimeSlots.includes(this.followUpTime)) {
      this.followUpTime = null;
    }
  }

  onWantFollowUpChange(): void {
    if (this.wantFollowUp === false) { this.deleteFollowUp(); }
  }

  saveFollowUp(): void {
    if (!this.canWrite() || !this.followUpDate || !this.followUpTime || this.savingFollowUp) { return; }
    const fu = { date: this.followUpDate, time: this.followUpTime || '', reason: this.followUpReason || '', type: this.followUpType || '' };
    this.savingFollowUp = true;
    this.v2Service.saveFollowUp(this.patientUuid, this.visitNoteUuid, fu, this.followUpUuid || undefined)
      .pipe(finalize(() => { this.savingFollowUp = false; }))
      .subscribe(res => {
        // A follow-up uuid switches the section to its saved view.
        this.followUpUuid = res?.uuid || this.followUpUuid;
        this.coreService.showToast('success', 'Follow-up saved', 'Saved', 'success-follow-up-toast');
      });
  }

  /** Delete from the saved view — back to an unanswered "Do you want to have follow up". */
  removeFollowUp(): void {
    if (!this.followUpUuid) { return; }
    this.v2Service.deleteObs(this.followUpUuid).subscribe(() => {
      this.followUpUuid = '';
      this.wantFollowUp = null;
      this.followUpDate = '';
      this.followUpTime = null;
      this.followUpReason = '';
      this.followUpType = this.defaultFollowUpType;
    });
  }

  deleteFollowUp(): void {
    const reset = () => {
      this.followUpUuid = '';
      this.followUpDate = '';
      this.followUpTime = null;
      this.followUpReason = '';
      this.followUpType = this.defaultFollowUpType;
    };
    if (!this.followUpUuid) { reset(); return; }
    this.v2Service.deleteObs(this.followUpUuid).subscribe(() => reset());
  }

  sharePrescription(): void {
    if (!this.canWrite()) { return; }
    if (!this.diagnoses.length) {
      this.coreService.showToast('warning', 'Diagnosis not added', 'Diagnosis Required', 'warning-diagnosis-required-toast');
      return;
    }
    this.coreService.openSharePrescriptionConfirmModal().subscribe((confirmed: boolean) => {
      if (!confirmed) { return; }
      // Already completed: nothing more to post, just confirm.
      if (this.prescriptionShared) {
        this.showShareSuccess();
        return;
      }
      this.completeVisit();
    });
  }

  private completeVisit(): void {
    this.v2Service.completeVisit(this.visitUuid, this.patientUuid, this.provider).subscribe({
      next: (res) => {
        if (!res) { this.showShareError(); return; }
        this.prescriptionShared = true;
        this.showShareSuccess();
      },
      error: () => this.showShareError()
    });
  }

  private showShareSuccess(): void {
    this.coreService.openSharePrescriptionSuccessModal().subscribe((result: string | boolean) => {
      if (result === 'view') {
        this.coreService.openVisitPrescriptionModal({ uuid: this.visitUuid });
      } else if (result === 'dashboard') {
        this.router.navigate(['/dashboard']);
      }
    });
  }

  private showShareError(): void {
    this.coreService.openSharePrescriptionErrorModal({
      msg: 'Unable to send prescription due to poor network connection. Please try again or come back later',
      confirmBtnText: 'Try again'
    }).subscribe((retry: boolean) => {
      if (retry) { this.completeVisit(); }
    });
  }
}
