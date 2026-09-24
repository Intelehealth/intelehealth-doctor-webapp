import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

export type OverrideReasonSurface = 'diagnosis' | 'medication';

export interface OverrideReasonItem {
  surface: OverrideReasonSurface;
  surfaceLabel: string;
  selectedValue: string;
  target?: { overrideReason?: string };
  reason?: string;
  touched?: boolean;
  index?: number;
}

export interface OverrideReasonGroup {
  surfaceLabel: string;
  items: OverrideReasonItem[];
}

export interface DdxTtxOverrideReasonDialogData {
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

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: DdxTtxOverrideReasonDialogData,
    private dialogRef: MatDialogRef<DdxTtxOverrideReasonComponent>,
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
    if (!this.allFilled) return;
    this.dialogRef.close(this.items.map(item => ({ ...item, reason: item.reason.trim() })));
  }

  close(): void {
    this.dialogRef.close(null);
  }
}
