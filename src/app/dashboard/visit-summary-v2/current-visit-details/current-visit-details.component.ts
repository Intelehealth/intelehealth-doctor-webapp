import { Component, EventEmitter, Input, Output } from '@angular/core';
import {
  ComplaintDetail, DetailRow, DocItem, SymptomGroup, VitalCell
} from '../visit-summary-v2.models';

@Component({
  selector: 'app-current-visit-details',
  templateUrl: './current-visit-details.component.html',
  styleUrls: ['./current-visit-details.component.scss']
})
export class CurrentVisitDetailsComponent {
  @Input() consultationDetails: DetailRow[] = [];
  @Input() chiefComplaints: string[] = [];
  @Input() complaintDetails: ComplaintDetail[] = [];
  @Input() associatedSymptoms: SymptomGroup[] = [];
  @Input() patientHistory: DetailRow[] = [];
  @Input() familyHistory: DetailRow[] = [];
  @Input() vitals: VitalCell[] = [];
  @Input() generalExams: DetailRow[] = [];
  @Input() eyeImages: string[] = [];
  @Input() abdomenFindings: string[] = [];
  @Input() documents: DocItem[] = [];
  @Input() chwNote = '';
  @Input() specializations: string[] = [];

  referToSpecialist = true;
  selectedSpecialization: string | null = null;

  @Output() startVisit = new EventEmitter<void>();
  @Output() reassign = new EventEmitter<string>();
}
