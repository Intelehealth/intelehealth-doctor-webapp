import { Component, Input } from '@angular/core';
import { DocItem, PastVisit } from '../visit-summary-v2.models';
import { CoreService } from 'src/app/services/core/core.service';

@Component({
  selector: 'app-past-visits',
  templateUrl: './past-visits.component.html',
  styleUrls: ['./past-visits.component.scss']
})
export class PastVisitsComponent {
  @Input() visit!: PastVisit;

  pastTopTabs = ['Past visits', 'Prescription'];
  activePastTab = 'Past visits';

  constructor(private coreService: CoreService) {}

  previewEyeImages(index: number): void {
    this.coreService.openImagesPreviewModal({
      startIndex: index,
      source: (this.visit?.eyeImages || []).map(src => ({ src }))
    }).subscribe();
  }

  previewDocument(doc: DocItem): void {
    const images = (this.visit?.documents || []).filter(d => d.type === 'image');
    const startIndex = images.indexOf(doc);
    if (startIndex < 0) { return; }
    this.coreService.openImagesPreviewModal({
      startIndex,
      source: images.map(d => ({ src: d.src }))
    }).subscribe();
  }

  setPastTab(tab: string): void {
    this.activePastTab = tab;
    const id = tab === 'Prescription' ? 'section-prescription' : 'section-past-visit';
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }
}
