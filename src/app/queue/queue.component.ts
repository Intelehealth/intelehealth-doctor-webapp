import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { EndShiftComponent } from './modals/end-shift/end-shift.component';
import { PauseQueueComponent } from './modals/pause-queue/pause-queue.component';
import { CallNotHappenedComponent } from './modals/call-not-happened/call-not-happened.component';
import { CallDoneComponent } from './modals/call-done/call-done.component';
import { DoctorAvailability, QueuePatient, QueueStatus, QUEUE_STATUS_LABELS } from './queue.model';
import { getCacheData } from '../utils/utility-functions';
import { doctorDetails } from 'src/config/constant';

const MOCK_QUEUE: QueuePatient[] = [
  { visitUuid: 'v1', patientUuid: 'p1', name: 'Suresh Deshmukh', gender: 'F', age: '24y', status: 'on_call', hw: 'Priya', location: 'TM Clinic 1', chiefComplaint: 'Fever' },
  { visitUuid: 'v2', patientUuid: 'p2', name: 'Aman Sharma', gender: 'M', age: '18y', status: 'next_in_queue', hw: 'Ramesh', location: 'TM Clinic 2', chiefComplaint: 'Fever & Cough' },
  { visitUuid: 'v3', patientUuid: 'p3', name: 'Suresh Deshmane', gender: 'M', age: '12d 6h', status: 'waiting', hw: 'Dipali', location: 'TM Clinic 1', chiefComplaint: 'Fever, Headache & Cough' },
  { visitUuid: 'v4', patientUuid: 'p4', name: 'Nikita Agrawal', gender: 'F', age: '48y', status: 'waiting', hw: 'Jitesh', location: 'TM Clinic 3', chiefComplaint: 'Back pain' },
  { visitUuid: 'v5', patientUuid: 'p5', name: 'Nitin Wagh', gender: 'M', age: '18m 15d', status: 'waiting', hw: 'Manda', location: 'TM Clinic 2', chiefComplaint: 'Runny nose' },
  { visitUuid: 'v1', patientUuid: 'p1', name: 'Suresh Deshmukh', gender: 'F', age: '24y', status: 'on_call', hw: 'Priya', location: 'TM Clinic 1', chiefComplaint: 'Fever' },
  { visitUuid: 'v2', patientUuid: 'p2', name: 'Aman Sharma', gender: 'M', age: '18y', status: 'next_in_queue', hw: 'Ramesh', location: 'TM Clinic 2', chiefComplaint: 'Fever & Cough' },
  { visitUuid: 'v3', patientUuid: 'p3', name: 'Suresh Deshmane', gender: 'M', age: '12d 6h', status: 'waiting', hw: 'Dipali', location: 'TM Clinic 1', chiefComplaint: 'Fever, Headache & Cough' },
  { visitUuid: 'v4', patientUuid: 'p4', name: 'Nikita Agrawal', gender: 'F', age: '48y', status: 'waiting', hw: 'Jitesh', location: 'TM Clinic 3', chiefComplaint: 'Back pain' },
  { visitUuid: 'v5', patientUuid: 'p5', name: 'Nitin Wagh', gender: 'M', age: '18m 15d', status: 'waiting', hw: 'Manda', location: 'TM Clinic 2', chiefComplaint: 'Runny nose' }
];

@Component({
  selector: 'app-queue',
  templateUrl: './queue.component.html',
  styleUrls: ['./queue.component.scss']
})
export class QueueComponent implements OnInit {

  displayedColumns: string[] = ['patient', 'age', 'status', 'hw', 'location', 'chiefComplaint', 'actions'];
  statusLabels = QUEUE_STATUS_LABELS;

  allPatients: QueuePatient[] = [];
  availability: DoctorAvailability = 'available';

  breakEndsAt: Date | null = null;

  pageIndex = 0;
  pageSize = 5;

  constructor(private dialog: MatDialog, private router: Router) { }

  ngOnInit(): void {
    this.loadQueue();
  }

  /**
  * Time-of-day greeting shown above the doctor's name
  * @return {string}
  */
  get greeting(): string {
    const hour = new Date().getHours();
    if (hour < 12) {
      return 'Good Morning';
    }
    return hour < 17 ? 'Good Afternoon' : 'Good Evening';
  }

  /**
  * Logged-in doctor's display name
  * @return {string}
  */
  get doctorName(): string {
    return getCacheData(true, doctorDetails.PROVIDER)?.person?.display ?? '';
  }

  /**
  * Load today's queue.
  * @return {void}
  */
  loadQueue(): void {
    this.allPatients = MOCK_QUEUE;
    this.pageIndex = 0;
  }

  /**
  * Rows visible on the current page
  * @return {QueuePatient[]}
  */
  get pagedPatients(): QueuePatient[] {
    const start = this.pageIndex * this.pageSize;
    return this.allPatients.slice(start, start + this.pageSize);
  }

  /**
  * Total number of pages, at least 1 so the pager always renders
  * @return {number}
  */
  get totalPages(): number {
    return Math.max(1, Math.ceil(this.allPatients.length / this.pageSize));
  }

  /**
  * Page numbers for the numbered pager
  * @return {number[]}
  */
  get pageNumbers(): number[] {
    return Array.from({ length: this.totalPages }, (_, i) => i);
  }

  /**
  * Move to a page, ignoring out-of-range requests
  * @param {number} page - Zero-based page index
  * @return {void}
  */
  goToPage(page: number): void {
    if (page < 0 || page >= this.totalPages) {
      return;
    }
    this.pageIndex = page;
  }

  /**
  * CSS modifier for a status chip
  * @param {QueueStatus} status - Row status
  * @return {string}
  */
  statusClass(status: QueueStatus): string {
    return `status-${status.replace(/_/g, '-')}`;
  }

  /**
  * Set the doctor as available, cancelling any active break
  * @return {void}
  */
  setAvailable(): void {
    this.availability = 'available';
    this.breakEndsAt = null;
  }

  /**
  * Ask for a break duration and pause the queue
  * @return {void}
  */
  openPauseQueue(): void {
    this.dialog.open(PauseQueueComponent, { panelClass: ['modal-md', 'queue-modal-panel'], width: '520px', hasBackdrop: true, disableClose: true })
      .afterClosed().subscribe((minutes: number | null) => {
        if (!minutes) {
          return;
        }
        this.availability = 'on_break';
        this.breakEndsAt = new Date(Date.now() + minutes * 60 * 1000);
      });
  }

  /**
  * Confirm and end the shift for the day
  * @return {void}
  */
  openEndShift(): void {
    this.dialog.open(EndShiftComponent, { panelClass: ['modal-md', 'queue-modal-panel'], width: '520px', hasBackdrop: true, disableClose: true })
      .afterClosed().subscribe((confirmed: boolean) => {
        if (!confirmed) {
          return;
        }
        this.availability = 'off_shift';
        this.breakEndsAt = null;
      });
  }

  /**
  * Open the visit summary for a patient
  * @param {QueuePatient} patient - Selected row
  * @return {void}
  */
  viewSummary(patient: QueuePatient): void {
    this.router.navigate(['/dashboard', 'visit-summary', patient.visitUuid]);
  }

  /**
  * Start the consultation for a patient
  * @param {QueuePatient} patient - Selected row
  * @return {void}
  */
  startCall(patient: QueuePatient): void {
    this.router.navigate(['/dashboard', 'visit-summary', patient.visitUuid]);
  }

  /**
  * Mark a call as done and offer to write the prescription
  * @param {QueuePatient} patient - Selected row
  * @return {void}
  */
  markCallDone(patient: QueuePatient): void {
    this.dialog.open(CallDoneComponent, {
      panelClass: ['modal-md', 'queue-modal-panel'],
      width: '520px',
      data: { patientName: patient.name }
    }).afterClosed().subscribe((action: 'queue' | 'prescription' | null) => {
      if (!action) {
        return;
      }
      patient.status = 'completed';
      if (action === 'prescription') {
        this.router.navigate(['/dashboard', 'visit-summary', patient.visitUuid]);
      }
    });
  }

  /**
  * Capture why a call did not happen and continue to the prescription
  * @param {QueuePatient} patient - Selected row
  * @return {void}
  */
  markCallDidNotHappen(patient: QueuePatient): void {
    this.dialog.open(CallNotHappenedComponent, { panelClass: ['modal-md', 'queue-modal-panel'], width: '520px', hasBackdrop: true, disableClose: true })
      .afterClosed().subscribe((reason: string | null) => {
        if (!reason) {
          return;
        }
        patient.status = 'completed';
        this.router.navigate(['/dashboard', 'visit-summary', patient.visitUuid]);
      });
  }
}
