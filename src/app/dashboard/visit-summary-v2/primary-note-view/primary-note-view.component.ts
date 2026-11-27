import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { VisitModel } from 'src/app/model/model';
import { DraftFollowUp, DraftNote, VisitSummaryV2Service } from '../visit-summary-v2.service';

/**
 * Read-only view of the referring (normal) doctor's own "Visit Note" encounter, shown to the
 * NAMCO specialist as the Primary Doctor's Note. Every call here is a read — viewing this must
 * never change the referring doctor's data.
 */
@Component({
  selector: 'app-primary-note-view',
  templateUrl: './primary-note-view.component.html',
  styleUrls: ['./primary-note-view.component.scss']
})
export class PrimaryNoteViewComponent implements OnChanges {
  @Input() patientUuid!: string;
  @Input() visitUuid!: string;
  @Input() primaryVisitNoteUuid!: string;
  @Input() visit!: VisitModel;
  @Input() patientPhoneNo = '';

  note: DraftNote | null = null;

  /** Visit-level "spoken with the patient" answer; null when not recorded. */
  spokenToPatient: boolean | null = null;

  collapsed: Record<string, boolean> = {};

  constructor(private v2Service: VisitSummaryV2Service) {}

  ngOnChanges(changes: SimpleChanges): void {
    if ((changes['primaryVisitNoteUuid'] || changes['patientUuid']) && this.patientUuid && this.primaryVisitNoteUuid) {
      this.load();
    }
    if (changes['visit'] && this.visit) {
      const value = this.v2Service.getPatientInteraction(this.visit).value;
      this.spokenToPatient = value ? value.toLowerCase() === 'yes' : null;
    }
  }

  private load(): void {
    this.v2Service.loadDraftNote(this.patientUuid, this.visitUuid, [this.primaryVisitNoteUuid])
      .subscribe(note => { this.note = note; });
  }

  get followUp(): DraftFollowUp | null {
    return this.note?.followUp || null;
  }

  get whatsAppLink(): string | null {
    return this.v2Service.whatsAppLink(this.patientPhoneNo);
  }

  toggleSection(key: string): void {
    this.collapsed[key] = !this.collapsed[key];
  }

  /** Open a section (e.g. when it's picked from the sidebar). */
  expandSection(key: string): void {
    this.collapsed[key] = false;
  }
}
