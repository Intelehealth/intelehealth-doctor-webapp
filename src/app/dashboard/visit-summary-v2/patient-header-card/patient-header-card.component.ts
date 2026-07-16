import { Component, Input } from '@angular/core';
import { Patient } from '../visit-summary-v2.models';

@Component({
  selector: 'app-patient-header-card',
  templateUrl: './patient-header-card.component.html',
  styleUrls: ['./patient-header-card.component.scss']
})
export class PatientHeaderCardComponent {
  @Input() patient!: Patient;

  showFullDetails = false;
  fullDetailsTabs = ['Address', 'Other'];
  activeFullDetailsTab = 'Address';

  toggleFullDetails(): void {
    this.showFullDetails = !this.showFullDetails;
  }

  setFullDetailsTab(tab: string): void {
    this.activeFullDetailsTab = tab;
  }
}
