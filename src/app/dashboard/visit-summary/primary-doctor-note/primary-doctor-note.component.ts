import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { DiagnosisService } from 'src/app/services/diagnosis.service';
import { VisitService } from 'src/app/services/visit.service';
import { AppConfigService } from 'src/app/services/app-config.service';
import {
  DiagnosisModel, EncounterModel, MedicineModel, ObsApiResponseModel, ObsModel,
  PatientModel, ReferralModel, StandardMedicineModel, TestModel, VisitModel
} from 'src/app/model/model';
import { conceptIds, visitTypes } from 'src/config/constant';
import { obsParse } from 'src/app/utils/utility-functions';

/**
 * Read-only display of the referring (normal) doctor's "Visit Note" encounter — diagnosis,
 * medications, advice, investigations, referral, discussion summary, follow-up and notes —
 * shown to a NAMCO specialist doctor as reference while they work their own Specialist Visit
 * Note. Nothing here is editable: every load method is a pure read, with no postObs/updateObs/
 * deleteObs calls, since merely viewing this tab must never mutate the referring doctor's data.
 */
@Component({
  selector: 'app-primary-doctor-note',
  templateUrl: './primary-doctor-note.component.html',
  styleUrls: ['./primary-doctor-note.component.scss']
})
export class PrimaryDoctorNoteComponent implements OnChanges {
  @Input() visit: VisitModel;
  @Input() patientInfo: PatientModel;

  /** The normal (non-NAMCO) doctor's own "Visit Note" encounter on this visit, if any. */
  primaryDoctorVisitNote: EncounterModel | null = null;

  existingDiagnosis: DiagnosisModel[] = [];
  diagnosisSecondary: { diagnosis?: string; type?: string; tnm?: string; otherStaging?: string } | null = null;

  medicines: MedicineModel[] = [];
  standardMedicines: StandardMedicineModel[] = [];

  additionalInstruction: string | null = null;
  advices: ObsModel[] = [];

  tests: TestModel[] = [];
  testSecondary: string | null = null;

  discussionSummary: string | null = null;

  referrals: ReferralModel[] = [];
  referralSecondary: string | null = null;
  referralConsent: { decision?: string; consent?: string } | null = null;

  followUp: { wantFollowUp?: string; followUpDate?: string; followUpTime?: string; followUpReason?: string; followUpType?: string } | null = null;
  followUpInstructions: string | null = null;

  notes: ObsModel[] = [];
  familyHistoryNotes: ObsModel[] = [];
  pastMedicalHistoryNotes: ObsModel[] = [];

  constructor(
    private diagnosisService: DiagnosisService,
    private visitService: VisitService,
    public appConfigService: AppConfigService,
  ) { }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.visit && this.visit) {
      this.primaryDoctorVisitNote = this.getPrimaryDoctorVisitNote(this.visit.encounters);
      if (this.primaryDoctorVisitNote) {
        this.loadDiagnosis();
        this.loadMedicines();
        this.loadAdvice();
        this.loadTests();
        this.loadReferrals();
        if (this.appConfigService?.namco_referral_section) {
          this.loadReferralConsent();
        }
        this.loadFollowUp();
        this.loadFollowUpInstructions();
        this.loadDiscussionSummary();
        this.loadNotes();
        this.loadFamilyHistoryNotes();
        this.loadPastMedicalHistoryNotes();
      }
    }
  }

  /**
   * Resolve the normal doctor's own "Visit Note" encounter — regardless of who is currently
   * logged in. This is deliberately NOT the login-dependent `getSourceEncounterUuids()` utility
   * (which resolves to the *logged-in* doctor's own encounter(s)) since a NAMCO doctor viewing
   * this tab needs the *other* doctor's encounter every time.
   */
  private getPrimaryDoctorVisitNote(encounters: EncounterModel[]): EncounterModel | null {
    return (encounters || []).find(({ display = '' }) =>
      display.includes(visitTypes.VISIT_NOTE) && !display.includes(visitTypes.SPECIALIST_VISIT_NOTE)
    ) || null;
  }

  private isFromPrimaryDoctorVisitNote(obs: ObsModel): boolean {
    return obs.encounter?.uuid === this.primaryDoctorVisitNote?.uuid;
  }

  loadDiagnosis(): void {
    this.existingDiagnosis = [];
    this.diagnosisSecondary = null;
    this.diagnosisService.getObs(this.visit.patient.uuid, conceptIds.conceptDiagnosis).subscribe((response: ObsApiResponseModel) => {
      response.results.forEach((obs: ObsModel) => {
        if (!this.isFromPrimaryDoctorVisitNote(obs)) return;
        if (obs.value.includes("}")) {
          const parsed: any = obsParse(obs.value, obs.uuid);
          if (this.appConfigService.patient_visit_summary?.dp_dignosis_secondary) {
            this.diagnosisSecondary = parsed;
          } else {
            this.existingDiagnosis.push({
              diagnosisName: parsed.diagnosis,
              diagnosisStatus: parsed.type,
              uuid: parsed.uuid,
            });
          }
        } else {
          let obsValues = obs.value.split(':');
          if (obs.value.includes("::")) {
            obsValues = obs.value.split("::").pop()?.split(":");
          }
          const obsValuesOne = obsValues?.[1]?.split('&');
          this.existingDiagnosis.push({
            diagnosisName: obsValues?.[0]?.trim() ?? '',
            diagnosisType: obsValuesOne?.[0]?.trim() ?? '',
            diagnosisStatus: obsValuesOne?.[1]?.trim() ?? '',
            uuid: obs.uuid,
          });
        }
      });
    });
  }

  loadMedicines(): void {
    // Both save paths (the regular doctor's saveAdditionalInstruction() and the AI-LLM plugin's
    // own additionalInstructionForm — see diagnosis.component.ts's checkIfMedicationPresent())
    // post the Additional Instructions text under this same conceptMed, distinguished from an
    // actual medicine only by NOT containing a colon (every real medicine value is colon-
    // separated: drug:strength:days:timing:remark:frequency, or the standard-medication
    // equivalent). This is the reliable signal — NOT the fuzzy heuristic conceptAdvice-based
    // checkIfAdditionalInstructionPresent() in the edit-mode component uses, which reads the
    // wrong concept entirely and can misclassify a short/plain Advice entry as an instruction.
    this.medicines = [];
    this.standardMedicines = [];
    this.additionalInstruction = null;
    this.diagnosisService.getObs(this.visit.patient.uuid, conceptIds.conceptMed).subscribe((response: ObsApiResponseModel) => {
      response.results.forEach((obs: ObsModel) => {
        if (!this.isFromPrimaryDoctorVisitNote(obs)) return;
        if (!obs.value.includes(':')) {
          this.additionalInstruction = obs.value;
        } else if (this.appConfigService.patient_visit_summary?.standard_medication) {
          this.standardMedicines.push(this.visitService.formatMedicineDisplay(obs.value, obs.uuid) as StandardMedicineModel);
        } else {
          this.medicines.push({
            drug: obs.value?.split(':')[0],
            strength: obs.value?.split(':')[1],
            days: obs.value?.split(':')[2],
            timing: obs.value?.split(':')[3],
            remark: obs.value?.split(':')[4],
            frequency: obs.value?.split(':')[5] ? obs.value?.split(':')[5] : "",
            uuid: obs.uuid
          });
        }
      });
    });
  }

  loadAdvice(): void {
    this.advices = [];
    this.diagnosisService.getObs(this.visit.patient.uuid, conceptIds.conceptAdvice)
      .subscribe((response: ObsApiResponseModel) => {
        response.results.forEach((obs: ObsModel) => {
          if (!this.isFromPrimaryDoctorVisitNote(obs)) return;
          if (!obs.value.includes('</a>')) {
            this.advices.push(obs);
          }
        });
      });
  }

  loadTests(): void {
    this.tests = [];
    this.testSecondary = null;
    this.diagnosisService.getObs(this.visit.patient.uuid, conceptIds.conceptTest)
      .subscribe((response: ObsApiResponseModel) => {
        response.results.forEach((obs: ObsModel) => {
          if (!this.isFromPrimaryDoctorVisitNote(obs)) return;
          if (this.appConfigService.patient_visit_summary?.dp_investigations_secondary) {
            this.testSecondary = obs.value;
          } else {
            this.tests.push(obs);
          }
        });
      });
  }

  loadDiscussionSummary(): void {
    this.discussionSummary = null;
    this.diagnosisService.getObs(this.visit.patient.uuid, conceptIds.conceptDiscussionSummary)
      .subscribe((response: ObsApiResponseModel) => {
        response.results.forEach((obs: ObsModel) => {
          if (this.isFromPrimaryDoctorVisitNote(obs)) {
            this.discussionSummary = obs.value;
          }
        });
      });
  }

  loadReferrals(): void {
    this.referrals = [];
    this.referralSecondary = null;
    this.diagnosisService.getObs(this.visit.patient.uuid, conceptIds.conceptReferral)
      .subscribe((response: ObsApiResponseModel) => {
        response.results.forEach((obs: ObsModel) => {
          if (!this.isFromPrimaryDoctorVisitNote(obs)) return;
          const obs_values = obs.value.split(':');
          if (obs_values.length > 1 && !this.appConfigService?.patient_visit_summary?.dp_referral_secondary) {
            this.referrals.push({ uuid: obs.uuid, speciality: obs_values[0].trim(), facility: obs_values[1].trim(), priority: obs_values[2].trim(), reason: obs_values[3].trim() ? obs_values[3].trim() : '-' });
          } else {
            this.referralSecondary = obs.value;
          }
        });
      });
  }

  loadReferralConsent(): void {
    this.referralConsent = null;
    this.diagnosisService.getObs(this.visit.patient.uuid, conceptIds.conceptReferralConsent)
      .subscribe((response: ObsApiResponseModel) => {
        const results = response.results || [];
        const obs = results.find((o: ObsModel) => this.isFromPrimaryDoctorVisitNote(o))
          || results.find((o: ObsModel) => o.encounter?.visit?.uuid === this.visit.uuid);
        if (obs) {
          const [decision, consent] = obs.value.split(':');
          this.referralConsent = { decision, consent: consent || null };
        }
      });
  }

  loadFollowUp(): void {
    // Mirrors checkIfFollowUpPresent() exactly: the follow-up obs is "present" (so the table
    // renders) whenever it exists at all, whether the referring doctor answered Yes or No —
    // only the Yes case additionally carries date/time/reason/type.
    this.followUp = null;
    this.diagnosisService.getObs(this.visit.patient.uuid, conceptIds.conceptFollow).subscribe((response: ObsApiResponseModel) => {
      response.results.forEach((obs: ObsModel) => {
        if (!this.isFromPrimaryDoctorVisitNote(obs)) return;
        let followUpDate: string, followUpTime: string, followUpReason: string, followUpType: string;
        let wantFollowUp = 'No';
        if (obs.value.includes('Time:') || obs.value.includes('Remark:')) {
          const result = obs.value.split(',').filter(Boolean);
          const remark = result.find((v: string) => v.includes('Remark:'))?.split('Remark:')?.[1]?.trim();
          const time = result.find((v: string) => v.includes('Time:'))?.split('Time:')?.[1]?.trim();
          const type = result.find((v: string) => v.includes('Type:'))?.split('Type:')?.[1]?.trim();
          wantFollowUp = 'Yes';
          followUpDate = result[0];
          followUpTime = time && time !== 'NA' ? time : null;
          followUpReason = remark && remark !== 'NA' ? remark : null;
          followUpType = type && type !== 'NA' && type !== 'null' ? type : null;
        }
        this.followUp = { wantFollowUp, followUpDate, followUpTime, followUpReason, followUpType };
      });
    });
  }

  loadFollowUpInstructions(): void {
    this.followUpInstructions = null;
    this.diagnosisService.getObs(this.visit.patient.uuid, conceptIds.conceptFollowUpInstruction)
      .subscribe((response: ObsApiResponseModel) => {
        response.results.forEach((obs: ObsModel) => {
          if (this.isFromPrimaryDoctorVisitNote(obs)) {
            this.followUpInstructions = obs.value;
          }
        });
      });
  }

  loadNotes(): void {
    this.notes = [];
    this.diagnosisService.getObs(this.visit.patient.uuid, conceptIds.conceptNote)
      .subscribe((response: ObsApiResponseModel) => {
        response.results.forEach((obs: ObsModel) => {
          if (this.isFromPrimaryDoctorVisitNote(obs)) {
            this.notes.push(obs);
          }
        });
      });
  }

  loadFamilyHistoryNotes(): void {
    this.familyHistoryNotes = [];
    this.diagnosisService.getObs(this.visit.patient.uuid, conceptIds.conceptFamilyHistoryNotes)
      .subscribe((response: ObsApiResponseModel) => {
        response.results.forEach((obs: ObsModel) => {
          if (this.isFromPrimaryDoctorVisitNote(obs)) {
            this.familyHistoryNotes.push(obs);
          }
        });
      });
  }

  loadPastMedicalHistoryNotes(): void {
    this.pastMedicalHistoryNotes = [];
    this.diagnosisService.getObs(this.visit.patient.uuid, conceptIds.conceptPastMedicalHistoryNotes)
      .subscribe((response: ObsApiResponseModel) => {
        response.results.forEach((obs: ObsModel) => {
          if (this.isFromPrimaryDoctorVisitNote(obs)) {
            this.pastMedicalHistoryNotes.push(obs);
          }
        });
      });
  }
}
