import { Component, OnDestroy, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { EndShiftComponent } from './modals/end-shift/end-shift.component';
import { PauseQueueComponent } from './modals/pause-queue/pause-queue.component';
import { CallNotHappenedComponent } from './modals/call-not-happened/call-not-happened.component';
import { CallDoneComponent } from './modals/call-done/call-done.component';
import { ToastrService } from 'ngx-toastr';
import { TranslateService } from '@ngx-translate/core';
import { DoctorStatus, QueuePatient, QueueStatus, QueueVisitEntry, QueueVisitsResponse, QUEUE_STATUS_LABELS } from './queue.model';
import { getAge, getCacheData, getSpecialization } from '../utils/utility-functions';
import { doctorDetails, visitTypes } from 'src/config/constant';
import { VisitService } from '../services/visit.service';
import { QueueService } from '../services/queue.service';
import { AvailabilityState, DoctorAvailabilityService } from '../services/doctor-availability.service';

const QUEUE_VISIT_REPRESENTATION = 'custom:(uuid,location:(display),' +
  'patient:(uuid,person:(display,gender,age,birthdate)),' +
  'encounters:(uuid,encounterType:(display),obs:(uuid,display,value,concept:(display)),' +
  'encounterProviders:(provider:(uuid,person:(uuid,display)))))';

const QUEUE_REFRESH_MS = 30000;

@Component({
  selector: 'app-queue',
  templateUrl: './queue.component.html',
  styleUrls: ['./queue.component.scss']
})
export class QueueComponent implements OnInit, OnDestroy {

  displayedColumns: string[] = ['patient', 'age', 'status', 'hw', 'location', 'chiefComplaint', 'actions'];
  statusLabels = QUEUE_STATUS_LABELS;

  patients: QueuePatient[] = [];
  totalPatients = 0;
  loadingQueue = false;

  availability: DoctorStatus = 'online';
  statusUpdating = false;
  breakEndsAt: Date | null = null;
  breakCountdown = '0:00';
  autoResumeFailed = false;

  pageIndex = 0;
  pageSize = 5;

  private readonly destroy$ = new Subject<void>();
  private refreshTicker: ReturnType<typeof setInterval> | null = null;

  constructor(
    private dialog: MatDialog,
    private router: Router,
    private queueService: QueueService,
    private visitService: VisitService,
    private availabilityService: DoctorAvailabilityService,
    private toastr: ToastrService,
    private translateService: TranslateService) { }

  ngOnInit(): void {
    this.availabilityService.changes
      .pipe(takeUntil(this.destroy$))
      .subscribe((state: AvailabilityState) => this.applyAvailability(state));

    this.availabilityService.breakExpired
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => this.updateStatus('online', null, true));

    this.availabilityService.hydrate(this.doctorUuid, this.speciality)
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => this.loadQueue());

    this.startQueueRefresh();
  }

  ngOnDestroy(): void {
    this.stopQueueRefresh();
    this.destroy$.next();
    this.destroy$.complete();
  }

  private applyAvailability(state: AvailabilityState): void {
    this.availability = state.status;
    this.statusUpdating = state.updating;
    this.breakEndsAt = state.breakEndsAt;
    this.autoResumeFailed = state.autoResumeFailed;
    this.breakCountdown = this.availabilityService.breakCountdown;
  }

  get greeting(): string {
    const hour = new Date().getHours();
    if (hour < 12) {
      return 'Good Morning';
    }
    return hour < 17 ? 'Good Afternoon' : 'Good Evening';
  }

  get doctorName(): string {
    return getCacheData(true, doctorDetails.PROVIDER)?.person?.display ?? '';
  }

  private startQueueRefresh(): void {
    this.stopQueueRefresh();
    this.refreshTicker = setInterval(() => {
      if (!this.loadingQueue && this.availability === 'online') {
        this.loadQueue(this.pageIndex);
      }
    }, QUEUE_REFRESH_MS);
  }

  private stopQueueRefresh(): void {
    if (this.refreshTicker) {
      clearInterval(this.refreshTicker);
      this.refreshTicker = null;
    }
  }

  loadQueue(pageIndex = 0): void {
    const doctorUuid = this.doctorUuid;
    const speciality = this.speciality;
    if (!doctorUuid || !speciality) {
      return;
    }
    this.loadingQueue = true;
    const offset = pageIndex * this.pageSize;
    this.queueService.getDoctorVisits(doctorUuid, speciality, this.pageSize, offset).subscribe({
      next: (res: QueueVisitsResponse) => {
        this.loadingQueue = false;
        this.pageIndex = pageIndex;
        const current = pageIndex === 0 ? res?.data?.currentVisit : null;
        const items = (res?.data?.items ?? [])
          .filter((item: QueueVisitEntry) => !current || item?.queueEntryId !== current?.queueEntryId);
        const entries = [current, ...items].filter(Boolean) as QueueVisitEntry[];
        this.patients = entries.map((entry: QueueVisitEntry) => this.toQueuePatient(entry));
        this.totalPatients = res?.data?.total ?? this.patients.length;
        this.hydrateVisiblePage();
      },
      error: () => {
        this.loadingQueue = false;
        this.patients = [];
        this.totalPatients = 0;
      }
    });
  }

  private toQueuePatient(entry: QueueVisitEntry): QueuePatient {
    return {
      queueEntryId: entry.queueEntryId,
      visitUuid: entry.visitUuid,
      patientUuid: entry.patientUuid,
      name: '',
      gender: 'O',
      age: '',
      status: this.toQueueStatus(entry),
      hw: '',
      location: '',
      chiefComplaint: '',
      loaded: false
    };
  }

  private toQueueStatus(entry: QueueVisitEntry): QueueStatus {
    switch (entry.status) {
      case 'CALL_CONNECTING':
      case 'CALL_CONNECTED':
        return 'on_call';
      case 'ASSIGNED':
        return 'assigned';
      case 'CALL_COMPLETED':
        return 'awaiting_prescription';
      case 'COMPLETED':
        return 'completed';
      case 'CANCELLED':
        return 'cancelled';
      default:
        return entry.position === 1 ? 'next_in_queue' : 'waiting';
    }
  }

  private hydrateVisiblePage(): void {
    this.patients.filter((row: QueuePatient) => !row.loaded).forEach((row: QueuePatient) => {
      row.loaded = true;
      this.visitService.getVisitDetails(row.visitUuid, QUEUE_VISIT_REPRESENTATION).subscribe({
        next: (visit: any) => this.applyVisitDetails(row, visit),
        error: () => { row.loaded = false; }
      });
    });
  }

  private applyVisitDetails(row: QueuePatient, visit: any): void {
    const person = visit?.patient?.person;
    row.name = person?.display ?? '';
    row.gender = person?.gender ?? 'O';
    row.age = person?.birthdate
      ? getAge(person.birthdate, this.translateService, true)
      : (person?.age != null ? `${person.age} y` : '');
    row.location = visit?.location?.display ?? '';
    row.hw = this.getHealthWorker(visit?.encounters ?? []);
    row.chiefComplaint = this.getChiefComplaint(visit?.encounters ?? []);
  }

  private getHealthWorker(encounters: any[]): string {
    const initial = encounters.find((enc: any) => enc?.encounterType?.display === visitTypes.ADULTINITIAL) ?? encounters[0];
    return initial?.encounterProviders?.[0]?.provider?.person?.display ?? '';
  }

  private getChiefComplaint(encounters: any[]): string {
    const complaints: string[] = [];
    encounters.forEach((enc: any) => {
      if (enc?.encounterType?.display !== visitTypes.ADULTINITIAL) {
        return;
      }
      (enc.obs ?? []).forEach((obs: any) => {
        if (obs?.concept?.display !== visitTypes.CURRENT_COMPLAINT) {
          return;
        }
        complaints.push(...this.visitService.parseChiefComplaints(this.visitService.getData(obs)?.value));
      });
    });
    return complaints.join(', ');
  }

  get totalPages(): number {
    return Math.max(1, Math.ceil(this.totalPatients / this.pageSize));
  }

  get pageNumbers(): number[] {
    return Array.from({ length: this.totalPages }, (_, i) => i);
  }

  goToPage(page: number): void {
    if (page < 0 || page >= this.totalPages || page === this.pageIndex) {
      return;
    }
    this.loadQueue(page);
  }

  get queueDisabled(): boolean {
    return this.availability !== 'online';
  }

  get breakBannerVisible(): boolean {
    return this.availability === 'away' && (!!this.breakEndsAt || this.autoResumeFailed);
  }

  statusClass(status: QueueStatus): string {
    return `status-${status.replace(/_/g, '-')}`;
  }

  private get doctorUuid(): string {
    return getCacheData(true, doctorDetails.USER)?.uuid;
  }

  private get speciality(): string {
    return getSpecialization(getCacheData(true, doctorDetails.PROVIDER)?.attributes);
  }

  private updateStatus(status: DoctorStatus, breakEndsAt: Date | null = null, isAutoResume = false): void {
    const doctorUuid = this.doctorUuid;
    const speciality = this.speciality;
    if (!doctorUuid) {
      return;
    }
    if (!speciality) {
      this.toastr.warning(this.translateService.instant('Please set the speciality'), this.translateService.instant('Speciality Missing'));
      return;
    }
    if (status === this.availability && !breakEndsAt && !isAutoResume) {
      return;
    }

    this.availabilityService.update(doctorUuid, speciality, status, breakEndsAt, isAutoResume)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          const state = this.availabilityService.snapshot;
          if (isAutoResume && state.status === 'online') {
            this.toastr.success(this.translateService.instant('Your break is over, you are back online.'),
              this.translateService.instant('Break ended'));
          }
          if (state.heldInConsult) {
            this.toastr.info(this.translateService.instant('You will be moved once your ongoing consultation ends.'),
              this.translateService.instant('Status change pending'));
          }
          this.loadQueue();
        },
        error: (err: unknown) => {
          if (typeof err === 'string' && err.trim()) {
            return;
          }
          this.toastr.error(this.translateService.instant('Could not update your status, please try again.'),
            this.translateService.instant('Status update failed'));
        }
      });
  }

  setAvailable(): void {
    this.updateStatus('online');
  }

  openPauseQueue(): void {
    this.dialog.open(PauseQueueComponent, { panelClass: ['modal-md', 'queue-modal-panel'], width: '520px', hasBackdrop: true, disableClose: true })
      .afterClosed().subscribe((minutes: number | null) => {
        if (!minutes) {
          return;
        }
        this.updateStatus('away', new Date(Date.now() + minutes * 60 * 1000));
      });
  }

  openEndShift(): void {
    this.dialog.open(EndShiftComponent, { panelClass: ['modal-md', 'queue-modal-panel'], width: '520px', hasBackdrop: true, disableClose: true })
      .afterClosed().subscribe((confirmed: boolean) => {
        if (!confirmed) {
          return;
        }
        this.updateStatus('offline');
      });
  }

  viewSummary(patient: QueuePatient): void {
    this.router.navigate(['/dashboard', 'visit-summary', patient.visitUuid]);
  }

  startCall(patient: QueuePatient): void {
    this.router.navigate(['/dashboard', 'visit-summary', patient.visitUuid]);
  }

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
