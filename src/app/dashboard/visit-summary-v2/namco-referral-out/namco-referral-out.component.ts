import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { finalize } from 'rxjs/operators';
import { CoreService } from 'src/app/services/core/core.service';
import { DraftReferral, VisitSummaryV2Service } from '../visit-summary-v2.service';
import { DEFAULT_REFERRAL_PRIORITY, FACILITY_OPTIONS, REFERRAL_PRIORITIES } from '../doctor-note/doctor-note.constants';
import {
  REFERRAL_CONSENT_NO, REFERRAL_CONSENT_OPTIONS, REFERRAL_CONSENT_YES, REFERRAL_DECISIONS,
  REFERRAL_DECISION_NAMCO, REFERRAL_DECISION_PHC,
  isNamcoFacility, isNamcoReferralTarget, isNamcoSpeciality
} from './namco-referral-out.constants';

/**
 * Referral section of the new Doctor's Note for the referring (non-NAMCO) doctor when the
 * NAMCO referral flow is enabled: referral decision (NAMCO / PHC / No referral), patient
 * consent for NAMCO, and the referral entries — filtered and validated by that decision.
 * The decision is saved as a single obs ("NAMCO:Yes", "PHC", "No referral") as soon as it's picked.
 */
@Component({
  selector: 'app-namco-referral-out',
  templateUrl: './namco-referral-out.component.html',
  styleUrls: ['./namco-referral-out.component.scss']
})
export class NamcoReferralOutComponent implements OnInit, OnChanges {
  @Input() patientUuid!: string;
  @Input() visitUuid!: string;
  @Input() visitNoteUuid!: string;
  /** Shared with the Doctor's Note, which loads the visit's referrals and reads them on share. */
  @Input() referrals: DraftReferral[] = [];
  @Input() visitReferred = false;
  @Input() prescriptionShared = false;

  readonly referralDecisions = REFERRAL_DECISIONS;
  readonly consentOptions = REFERRAL_CONSENT_OPTIONS;
  readonly decisionNamco = REFERRAL_DECISION_NAMCO;
  readonly consentNo = REFERRAL_CONSENT_NO;
  readonly referralPriorities = REFERRAL_PRIORITIES;

  decision: string | null = null;
  consent: string | null = null;
  private consentUuid = '';
  savingConsent = false;

  specialityOptions: string[] = [];
  filteredSpecialityOptions: string[] = [];
  filteredFacilityOptions: string[] = FACILITY_OPTIONS;
  newReferral: { speciality: string | null; facility: string | null; priority: string | null; reason: string } =
    { speciality: null, facility: null, priority: DEFAULT_REFERRAL_PRIORITY, reason: '' };

  constructor(
    private v2Service: VisitSummaryV2Service,
    private coreService: CoreService
  ) {}

  ngOnInit(): void {
    this.specialityOptions = this.v2Service.getReferralSpecialities();
    this.refreshOptions();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if ((changes['visitUuid'] || changes['patientUuid'] || changes['visitNoteUuid']) && this.patientUuid && this.visitUuid) {
      this.loadConsent();
    }
  }

  private loadConsent(): void {
    this.v2Service.loadReferralConsent(this.patientUuid, this.visitUuid, this.visitNoteUuid).subscribe(consent => {
      this.decision = consent?.decision || null;
      this.consent = consent?.consent || null;
      this.consentUuid = consent?.uuid || '';
      this.refreshOptions();
    });
  }

  private canWrite(): boolean {
    return !!(this.patientUuid && this.visitNoteUuid);
  }

  /**
  * Decision / consent can't change once the visit is referred / shared, or once a referral is
  * added under the current decision (remove it first).
  */
  get locked(): boolean {
    return this.savingConsent || this.visitReferred || this.prescriptionShared
      || (!!this.decision && this.referrals.length > 0);
  }

  get showLockedHint(): boolean {
    return !!this.decision && this.referrals.length > 0 && !this.visitReferred && !this.prescriptionShared;
  }

  /** Referral form: shown for "Refer to PHC", or "Refer to Namco" with consent — one NAMCO referral per visit. */
  get showForm(): boolean {
    if (this.decision === REFERRAL_DECISION_PHC) { return true; }
    return this.decision === REFERRAL_DECISION_NAMCO && this.consent === REFERRAL_CONSENT_YES && !this.hasNamcoReferral;
  }

  get showTable(): boolean {
    return this.showForm || this.referrals.length > 0;
  }

  /**
  * Recompute the "Referral to" / "Referral facility" lists. They're kept as fields (not getters)
  * because ng-select resets its options whenever it's handed a new array, which would drop a
  * click on an option. NAMCO decision (or a NAMCO Hospital facility) shows only NAMCO doctors
  * and NAMCO Hospital; PHC excludes both.
  */
  refreshOptions(): void {
    const namcoOnly = this.decision === REFERRAL_DECISION_NAMCO;
    const phc = this.decision === REFERRAL_DECISION_PHC;
    this.filteredSpecialityOptions = (namcoOnly || isNamcoFacility(this.newReferral.facility))
      ? this.specialityOptions.filter(s => isNamcoSpeciality(s))
      : phc ? this.specialityOptions.filter(s => !isNamcoSpeciality(s)) : this.specialityOptions;
    this.filteredFacilityOptions = namcoOnly
      ? FACILITY_OPTIONS.filter(f => isNamcoFacility(f))
      : phc ? FACILITY_OPTIONS.filter(f => !isNamcoFacility(f)) : FACILITY_OPTIONS;
  }

  get hasNamcoReferral(): boolean {
    return this.referrals.some(r => isNamcoReferralTarget(r.speciality, r.facility));
  }

  /** The added NAMCO referral with patient consent — the one the visit gets routed on at share. */
  get confirmedNamcoReferral(): DraftReferral | null {
    if (this.decision !== REFERRAL_DECISION_NAMCO || this.consent !== REFERRAL_CONSENT_YES) { return null; }
    return this.referrals.find(r => isNamcoReferralTarget(r.speciality, r.facility)) || null;
  }

  onDecisionChange(decision: string): void {
    if (this.locked || !this.canWrite() || decision === this.decision) { return; }
    this.decision = decision;
    this.consent = null;
    this.cancel();
    // "Refer to Namco" is saved together with the patient's consent, once Yes/No is picked.
    if (decision !== REFERRAL_DECISION_NAMCO) { this.saveConsent(); }
  }

  onConsentChange(consent: string): void {
    if (this.locked || !this.canWrite() || consent === this.consent) { return; }
    this.consent = consent;
    this.cancel();
    this.saveConsent();
  }

  private saveConsent(): void {
    if (!this.decision) { return; }
    this.savingConsent = true;
    this.v2Service.saveReferralConsent(this.patientUuid, this.visitNoteUuid, this.decision, this.consent || '', this.consentUuid || undefined)
      .pipe(finalize(() => { this.savingConsent = false; }))
      .subscribe({
        next: res => { this.consentUuid = res?.uuid || this.consentUuid; },
        error: () => {
          this.coreService.showToast('error', 'Unable to save the referral decision, please try again.', 'Error', 'error-referral-consent-toast');
          this.loadConsent();
        }
      });
  }

  save(): void {
    if (!this.newReferral.speciality || !this.canWrite()) { return; }
    if (!this.isReferralAllowed(this.newReferral.speciality, this.newReferral.facility)) { return; }
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
      this.cancel();
    });
  }

  /** Validate against the decision. Values are checked as entered, since the dropdowns accept typed values. */
  private isReferralAllowed(speciality: string, facility: string | null): boolean {
    if (this.decision === REFERRAL_DECISION_NAMCO) {
      if (!isNamcoReferralTarget(speciality, facility)) {
        this.coreService.showToast('warning', 'For "Refer to Namco", select a Namco specialization and the Namco Hospital facility.', 'Invalid Referral', 'warning-namco-referral-target-toast');
        return false;
      }
      if (this.hasNamcoReferral) {
        this.coreService.showToast('warning', 'A NAMCO referral has already been added for this visit.', 'Referral Already Added', 'warning-referral-already-added-toast');
        return false;
      }
    } else if (isNamcoSpeciality(speciality) || isNamcoFacility(facility)) {
      this.coreService.showToast('warning', 'Select "Refer to Namco" to refer this patient to a NAMCO doctor.', 'Referral Not Allowed', 'warning-namco-referral-not-allowed-toast');
      return false;
    }
    return true;
  }

  delete(index: number): void {
    const referral = this.referrals[index];
    if (!referral) { return; }
    if (this.visitReferred && isNamcoReferralTarget(referral.speciality, referral.facility)) {
      this.coreService.showToast('warning', 'This visit has already been referred to a NAMCO doctor.', 'Referral Already Sent', 'warning-namco-referral-sent-toast');
      return;
    }
    if (referral.uuid) {
      this.v2Service.deleteObs(referral.uuid).subscribe(() => this.referrals.splice(index, 1));
    } else {
      this.referrals.splice(index, 1);
    }
  }

  cancel(): void {
    this.newReferral = { speciality: null, facility: null, priority: DEFAULT_REFERRAL_PRIORITY, reason: '' };
    this.refreshOptions();
  }

  /**
  * Share Prescription checks: a decision is picked, NAMCO has consent, and a consented NAMCO
  * referral is added. Called by the Doctor's Note before sharing.
  */
  validateForShare(): boolean {
    if (!this.decision) {
      this.coreService.showToast('warning', 'Referral consent not added', 'Referral Consent Required', 'warning-referral-consent-required-toast');
      return false;
    }
    if (this.decision === REFERRAL_DECISION_NAMCO && !this.consent) {
      this.coreService.showToast('warning', 'Patient consent is required for NAMCO referral', 'Consent Required', 'warning-consent-required-toast');
      return false;
    }
    if (this.decision === REFERRAL_DECISION_NAMCO && this.consent === REFERRAL_CONSENT_YES && !this.confirmedNamcoReferral) {
      this.coreService.showToast('warning', 'As you have provided your consent for the referral, please complete the Referral section before sharing the prescription.', 'Referral Section Required', 'warning-referral-section-required-toast');
      return false;
    }
    return true;
  }
}
