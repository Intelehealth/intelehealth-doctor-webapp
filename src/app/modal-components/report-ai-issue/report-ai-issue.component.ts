import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { AiIssueReportService } from 'src/app/services/ai-issue-report.service';
import { CoreService } from 'src/app/services/core/core.service';

export interface ReportAiIssueDialogData {
  visitUuid: string;
  doctorUuid: string;
  patientUuid: string;
  aiSurface: 'ddx' | 'ddx_questions' | 'ttx_medication' | 'ttx_advice' | 'ttx_test' | 'ttx_referral' | 'ttx_followup';
  suggestionRef?: string;
  rawSuggestion?: any;
  doctorName?: string;
  patientOpenMrsId?: string;
}

export const AI_ISSUE_REASONS = [
  { code: 'incorrect_suggestion', label: 'Incorrect suggestion' },
  { code: 'potentially_unsafe', label: 'Potentially unsafe' },
  { code: 'not_relevant', label: 'Not relevant' },
  { code: 'other', label: 'Other' },
];

@Component({
  selector: 'app-report-ai-issue',
  templateUrl: './report-ai-issue.component.html',
  styleUrls: ['./report-ai-issue.component.scss'],
})
export class ReportAiIssueComponent {
  reasons = AI_ISSUE_REASONS;
  selectedReason: string | null = null;
  details = '';
  submitting = false;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: ReportAiIssueDialogData,
    private dialogRef: MatDialogRef<ReportAiIssueComponent>,
    private aiIssueReportService: AiIssueReportService,
    private coreService: CoreService,
  ) { }

  selectReason(code: string): void {
    this.selectedReason = code;
  }

  submit(): void {
    if (!this.selectedReason || this.submitting) return;
    this.submitting = true;
    const payload = {
      visit_uuid: this.data.visitUuid,
      doctor_uuid: this.data.doctorUuid,
      patient_uuid: this.data.patientUuid,
      ai_surface: this.data.aiSurface,
      reason: this.selectedReason,
      details: this.details?.trim() || undefined,
      suggestion_ref: this.data.suggestionRef,
      raw_suggestion: this.data.rawSuggestion,
      doctor_name: this.data.doctorName,
      patient_openmrs_id: this.data.patientOpenMrsId,
    };
    this.aiIssueReportService.create(payload).subscribe({
      next: () => {
        this.submitting = false;
        this.coreService.showToast('success', 'We recorded this report and will review it asap!', 'Reported', 'reportAiIssueSuccessToast');
        this.dialogRef.close(true);
      },
      error: () => {
        this.submitting = false;
        this.coreService.showToast('error', 'Could not submit the report. Please try again.', 'Error', 'reportAiIssueErrorToast');
      }
    });
  }

  close(): void {
    this.dialogRef.close(false);
  }
}
