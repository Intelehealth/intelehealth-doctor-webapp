import { Component, EventEmitter, Input, Output } from '@angular/core';
import { SectionNavItem, TimelineGroup } from '../visit-summary-v2.models';

@Component({
  selector: 'app-visit-sidebar',
  templateUrl: './visit-sidebar.component.html',
  styleUrls: ['./visit-sidebar.component.scss']
})
export class VisitSidebarComponent {
  @Input() visitScopeTabs: string[] = [];
  @Input() activeVisitScope!: string;

  @Input() sections: SectionNavItem[] = [];
  @Input() doctorNoteNav: SectionNavItem[] = [];
  @Input() activeSection!: string;
  @Input() visitNoteStarted = false;

  @Input() pastVisitsTimeline: TimelineGroup[] = [];
  @Input() activePastVisitKey!: string;

  @Output() scopeChange = new EventEmitter<string>();
  @Output() sectionSelect = new EventEmitter<string>();
  @Output() pastVisitSelect = new EventEmitter<string>();
}
