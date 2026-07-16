import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { Router } from '@angular/router';
import { Subject, of } from 'rxjs';
import { debounceTime, distinctUntilChanged, switchMap } from 'rxjs/operators';
import { doctorDetails, facility, refer_prioritie } from 'src/config/constant';
import medicines from 'src/app/core/data/medicines';
import doses from 'src/app/core/data/dose';
import durationUnits from 'src/app/core/data/durationUnitList';
import instructionRemarks from 'src/app/core/data/instructionRemarks';
import { getCacheData } from 'src/app/utils/utility-functions';
import { CoreService } from 'src/app/services/core/core.service';
import {
  DiagnosisOption, DraftAdvice, DraftDiagnosis, DraftMedication, DraftReferral,
  DraftTest, DraftTextItem, VisitSummaryV2Service
} from '../visit-summary-v2.service';

@Component({
  selector: 'app-doctor-note',
  templateUrl: './doctor-note.component.html',
  styleUrls: ['./doctor-note.component.scss']
})
export class DoctorNoteComponent implements OnChanges, OnInit {
  @Input() patientUuid!: string;
  @Input() visitUuid!: string;
  @Input() visitNoteUuid!: string;

  spokenToPatient = true;

  hasEnoughInfo = true;
  selectedDiagnosis: DiagnosisOption | null = null;
  diagnosisResults: DiagnosisOption[] = [];
  private diagnosisSearch$ = new Subject<string>();
  newDiagnosisType = 'Primary';
  newDiagnosisStatus = 'Provisional';
  addedDiagnoses: DraftDiagnosis[] = [];
  private editDiagnosisUuid = '';
  private editDiagnosisIndex = -1;

  noteSharedWithPatient = true;
  newNoteText = '';
  outcomeNotes: DraftTextItem[] = [];

  drugOptions: string[] = medicines.map(m => m.name);
  doseOptions: string[] = doses.map(d => d.name);
  durationUnitOptions: string[] = durationUnits.map(u => u.name);
  instructionOptions: string[] = instructionRemarks.map(i => i.name);
  frequencyOptions: string[] = [
    'Once daily', 'Twice daily', 'Three times daily', 'Four times daily',
    'Every 30 minutes', 'Every hour', 'Every four hours', 'Every eight hours',
    'Twice daily before meals', 'Twice daily after meals'
  ];
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

  newTestText: string | null = null;
  testOptions: string[] = [];
  tests: DraftTest[] = [];

  referralSpecialityOptions: string[] = [];
  facilityOptions: string[] = facility.facilities.map(f => f.name);
  referralPriorities: string[] = refer_prioritie.refer_priorities.map(p => p.name);
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

  ngOnInit(): void {
    this.diagnosisSearch$.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      switchMap(term => term && term.length >= 3 ? this.v2Service.searchDiagnosis(term) : of([]))
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

  addDiagnosis(): void {
    if (!this.selectedDiagnosis?.name || !this.canWrite()) { return; }
    const dx = {
      name: this.selectedDiagnosis.name,
      type: this.newDiagnosisType,
      status: this.newDiagnosisStatus,
      code: this.selectedDiagnosis.code || 'NA'
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
    this.selectedDiagnosis = { name: dx.name, code: dx.code || 'NA' };
    this.diagnosisResults = [this.selectedDiagnosis];
    this.newDiagnosisType = dx.type;
    this.newDiagnosisStatus = dx.status;
    this.editDiagnosisIndex = index;
    this.editDiagnosisUuid = dx.uuid || '';
  }

  cancelDiagnosis(): void {
    this.selectedDiagnosis = null;
    this.diagnosisResults = [];
    this.newDiagnosisType = 'Primary';
    this.newDiagnosisStatus = 'Provisional';
    this.editDiagnosisIndex = -1;
    this.editDiagnosisUuid = '';
  }

  deleteDiagnosis(index: number, uuid?: string): void {
    this.removeItem(this.addedDiagnoses, index, uuid);
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

  addAdvice(): void {
    if (!this.newAdviceText || !this.canWrite()) { return; }
    const value = this.newAdviceText;
    if (this.advices.find(a => a.value === value)) {
      this.coreService.showToast('warning', 'Advice already added, please add another advice.', 'Already Added', 'warning-advice-toast');
      return;
    }
    this.v2Service.saveAdvice(this.patientUuid, this.visitNoteUuid, value).subscribe(res => {
      this.advices.push({ value, uuid: res?.uuid || '' });
      this.newAdviceText = null;
    });
  }

  deleteAdvice(index: number, uuid?: string): void {
    this.removeItem(this.advices, index, uuid);
  }

  cancelAdvice(): void {
    this.newAdviceText = null;
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
