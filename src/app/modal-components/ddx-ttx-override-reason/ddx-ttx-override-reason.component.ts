import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { DdxTtxOverrideService, DdxTtxOverrideSurface, DdxTtxOverrideDiagnosis } from 'src/app/services/ddx-ttx-override.service';
import { CoreService } from 'src/app/services/core/core.service';

export interface OverrideReasonItem {
  surface: DdxTtxOverrideSurface;
  surfaceLabel: string;
  selectedValue: string;
  reason?: string;
  touched?: boolean;
  index?: number;
}

export interface OverrideReasonGroup {
  surfaceLabel: string;
  items: OverrideReasonItem[];
}

export interface DdxTtxOverrideReasonDialogData {
  visitId: number;
  doctorId: number;
  patientId: number;
  diagnosesSnapshot: DdxTtxOverrideDiagnosis[];
  items: OverrideReasonItem[];
}

@Component({
  selector: 'app-ddx-ttx-override-reason',
  templateUrl: './ddx-ttx-override-reason.component.html',
  styleUrls: ['./ddx-ttx-override-reason.component.scss'],
})
export class DdxTtxOverrideReasonComponent {
  items: OverrideReasonItem[];
  // groups holds the same item references as items, not copies.
  groups: OverrideReasonGroup[] = [];
  submitting = false;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: DdxTtxOverrideReasonDialogData,
    private dialogRef: MatDialogRef<DdxTtxOverrideReasonComponent>,
    private ddxTtxOverrideService: DdxTtxOverrideService,
    private coreService: CoreService,
  ) {
    this.items = (data.items || []).map((item, index) => ({ ...item, index, reason: item.reason || '', touched: false }));

    for (const item of this.items) {
      const group = this.groups.find(g => g.surfaceLabel === item.surfaceLabel);
      if (group) {
        group.items.push(item);
      } else {
        this.groups.push({ surfaceLabel: item.surfaceLabel, items: [item] });
      }
    }
  }

  isComplete(item: OverrideReasonItem): boolean {
    return !!item.reason?.trim();
  }

  showRequired(item: OverrideReasonItem): boolean {
    return !!item.touched && !this.isComplete(item);
  }

  get completedCount(): number {
    return this.items.filter(item => this.isComplete(item)).length;
  }

  get allFilled(): boolean {
    return this.items.length > 0 && this.completedCount === this.items.length;
  }

  submit(): void {
    if (!this.allFilled || this.submitting) return;
    this.submitting = true;

    const diagnoses = (this.data.diagnosesSnapshot || []).map(d => {
      const override = this.items.find(i => i.surface === 'diagnosis' && i.selectedValue === d.name);
      return override ? { ...d, reason: override.reason.trim() } : d;
    });

    const treatments = this.items
      .filter(i => i.surface !== 'diagnosis')
      .map(i => ({
        surface: i.surface as any,
        selected_value: i.selectedValue,
        ai_assisted: 'N' as const,
        reason: i.reason.trim(),
      }));

    this.ddxTtxOverrideService.save({
      visit_id: this.data.visitId,
      doctor_id: this.data.doctorId,
      patient_id: this.data.patientId,
      diagnoses,
      treatments,
    }).subscribe({
      next: () => {
        this.submitting = false;
        this.dialogRef.close(this.items);
      },
      error: () => {
        this.submitting = false;
        this.coreService.showToast('error', 'Could not save the reason(s). Please try again.', 'Error', 'ddxTtxOverrideReasonErrorToast');
      }
    });
  }

  close(): void {
    this.dialogRef.close(null);
  }
}
