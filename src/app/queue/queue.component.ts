import { Component, NgZone, OnDestroy, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { EndShiftComponent } from './modals/end-shift/end-shift.component';
import { PauseQueueComponent } from './modals/pause-queue/pause-queue.component';
import { CallNotHappenedComponent } from './modals/call-not-happened/call-not-happened.component';
import { CallDoneComponent } from './modals/call-done/call-done.component';
import { ToastrService } from 'ngx-toastr';
import { TranslateService } from '@ngx-translate/core';
import { DoctorStatus, DoctorStatusResponse, QueuePatient, QueueStatus, QueueVisitEntry, QueueVisitsResponse, QUEUE_STATUS_LABELS } from './queue.model';
import { getAge, getCacheData, getSpecialization } from '../utils/utility-functions';
import { doctorDetails, visitTypes } from 'src/config/constant';
import { VisitService } from '../services/visit.service';
import { QueueService } from '../services/queue.service';

const QUEUE_VISIT_REPRESENTATION = 'custom:(uuid,location:(display),' +
  'patient:(uuid,person:(display,gender,age,birthdate)),' +
  'encounters:(uuid,encounterType:(display),obs:(uuid,display,value,concept:(display)),' +
  'encounterProviders:(provider:(uuid,person:(uuid,display)))))';

@Component({
  selector: 'app-queue',
  templateUrl: './queue.component.html',
  styleUrls: ['./queue.component.scss']
})
export class QueueComponent implements OnInit, OnDestroy {

  displayedColumns: string[] = ['patient', 'age', 'status', 'hw', 'location', 'chiefComplaint', 'actions'];
  statusLabels = QUEUE_STATUS_LABELS;

  allPatients: QueuePatient[] = [];
  loadingQueue = false;
  availability: DoctorStatus = 'online';
  statusUpdating = false;

  breakEndsAt: Date | null = null;
  breakRemainingMs = 0;
  autoResumeFailed = false;
  private breakTicker: ReturnType<typeof setInterval> | null = null;

  pageIndex = 0;
  pageSize = 5;

  constructor(
    private dialog: MatDialog,
    private router: Router,
    private queueService: QueueService,
    private visitService: VisitService,
    private zone: NgZone,
    private toastr: ToastrService,
    private translateService: TranslateService) { }

  ngOnInit(): void {
    this.loadQueue();
  }

  ngOnDestroy(): void {
    this.stopBreakTimer();
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

  loadQueue(): void {
    const doctorUuid = this.doctorUuid;
    const speciality = this.speciality;
    if (!doctorUuid || !speciality) {
      return;
    }
    this.loadingQueue = true;
    this.queueService.getDoctorVisits(doctorUuid, speciality).subscribe({
      next: (res: QueueVisitsResponse) => {
        this.loadingQueue = false;
        const current = res?.data?.currentVisit;
        const items = (res?.data?.items ?? []).filter((item: QueueVisitEntry) => item?.queueEntryId !== current?.queueEntryId);
        const entries = [current, ...items].filter(Boolean) as QueueVisitEntry[];
        this.allPatients = entries.map((entry: QueueVisitEntry) => this.toQueuePatient(entry));
        this.pageIndex = 0;
        this.hydrateVisiblePage();
      },
      error: () => {
        this.loadingQueue = false;
        this.allPatients = [];
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
    this.pagedPatients.filter((row: QueuePatient) => !row.loaded).forEach((row: QueuePatient) => {
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
        const parts = `${this.visitService.getData(obs)?.value ?? ''}`.split('<b>');
        for (let i = 0; i < parts.length; i++) {
          const title = parts[i]?.split('<')[0];
          if (title && title.length > 1 && !title.match(visitTypes.ASSOCIATED_SYMPTOMS)) {
            complaints.push(title.trim());
          }
        }
      });
    });
    return complaints.join(', ');
  }

  get pagedPatients(): QueuePatient[] {
    const start = this.pageIndex * this.pageSize;
    return this.allPatients.slice(start, start + this.pageSize);
  }

  get totalPages(): number {
    return Math.max(1, Math.ceil(this.allPatients.length / this.pageSize));
  }

  get pageNumbers(): number[] {
    return Array.from({ length: this.totalPages }, (_, i) => i);
  }

  goToPage(page: number): void {
    if (page < 0 || page >= this.totalPages) {
      return;
    }
    this.pageIndex = page;
    this.hydrateVisiblePage();
  }

  get queueDisabled(): boolean {
    return this.availability !== 'online';
  }

  statusClass(status: QueueStatus): string {
    return `status-${status.replace(/_/g, '-')}`;
  }

  private startBreakTimer(): void {
    this.stopBreakTimer();
    if (!this.breakEndsAt) {
      return;
    }
    this.tickBreak();
    this.zone.runOutsideAngular(() => {
      this.breakTicker = setInterval(() => this.zone.run(() => this.tickBreak()), 1000);
    });
  }

  get breakBannerVisible(): boolean {
    return this.availability === 'away' && (!!this.breakEndsAt || this.autoResumeFailed);
  }

  private tickBreak(): void {
    if (!this.breakEndsAt) {
      this.stopBreakTimer();
      return;
    }
    this.breakRemainingMs = Math.max(0, this.breakEndsAt.getTime() - Date.now());
    if (this.breakRemainingMs > 0) {
      return;
    }
    this.breakEndsAt = null;
    this.stopBreakTimer();
    this.updateStatus('online', null, true);
  }

  private stopBreakTimer(): void {
    if (this.breakTicker) {
      clearInterval(this.breakTicker);
      this.breakTicker = null;
    }
    this.breakRemainingMs = 0;
  }

  get breakCountdown(): string {
    const totalSeconds = Math.ceil(this.breakRemainingMs / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${`${seconds}`.padStart(2, '0')}`;
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

    const previousStatus = this.availability;
    const previousBreakEndsAt = this.breakEndsAt;
    this.stopBreakTimer();
    this.autoResumeFailed = false;
    this.availability = status;
    this.breakEndsAt = breakEndsAt;
    this.statusUpdating = true;

    this.queueService.updateDoctorStatus(doctorUuid, status, speciality).subscribe({
      next: (res: DoctorStatusResponse) => {
        this.statusUpdating = false;
        this.availability = res?.data?.status ?? status;
        if (this.availability === 'away' && this.breakEndsAt) {
          this.startBreakTimer();
        } else {
          this.breakEndsAt = null;
        }
        if (isAutoResume && this.availability === 'online') {
          this.toastr.success(this.translateService.instant('Your break is over, you are back online.'),
            this.translateService.instant('Break ended'));
        }
        if (res?.data?.heldInConsult && res?.data?.requestedStatus !== res?.data?.status) {
          this.toastr.info(this.translateService.instant('You will be moved once your ongoing consultation ends.'),
            this.translateService.instant('Status change pending'));
        }
      },
      error: (err: unknown) => {
        this.statusUpdating = false;
        this.availability = previousStatus;
        this.breakEndsAt = previousBreakEndsAt;
        if (previousStatus === 'away' && previousBreakEndsAt) {
          this.startBreakTimer();
        }
        this.autoResumeFailed = isAutoResume;
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
