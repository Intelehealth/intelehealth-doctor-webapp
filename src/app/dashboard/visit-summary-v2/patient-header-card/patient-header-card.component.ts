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
  showAllAllergies = false;
  fullDetailsTabs = ['Address', 'Other'];
  activeFullDetailsTab = 'Address';

  toggleFullDetails(): void {
    this.showFullDetails = !this.showFullDetails;
  }

  get visibleAllergies(): string[] {
    return this.showAllAllergies
      ? (this.patient?.allAllergies || []).map(a => a.name)
      : (this.patient?.allergies || []);
  }

  toggleAllAllergies(): void {
    this.showAllAllergies = !this.showAllAllergies;
  }

  setFullDetailsTab(tab: string): void {
    this.activeFullDetailsTab = tab;
  }
}
