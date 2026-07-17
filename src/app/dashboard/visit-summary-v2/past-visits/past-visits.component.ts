import { Component, Input } from '@angular/core';
import { PastVisit } from '../visit-summary-v2.models';

@Component({
  selector: 'app-past-visits',
  templateUrl: './past-visits.component.html',
  styleUrls: ['./past-visits.component.scss']
})
export class PastVisitsComponent {
  @Input() visit!: PastVisit;

  pastTopTabs = ['Past visits', 'Prescription'];
  activePastTab = 'Past visits';

  setPastTab(tab: string): void {
    this.activePastTab = tab;
    const id = tab === 'Prescription' ? 'section-prescription' : 'section-past-visit';
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }
}
