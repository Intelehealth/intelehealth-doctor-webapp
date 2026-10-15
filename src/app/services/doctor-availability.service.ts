import { Injectable, NgZone } from '@angular/core';
import { BehaviorSubject, Observable, Subject, of } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { DoctorStatus, DoctorStatusResponse } from '../queue/queue.model';
import { getCacheData, setCacheData, deleteCacheData, getSpecialization } from '../utils/utility-functions';
import { doctorDetails } from 'src/config/constant';
import { QueueService } from './queue.service';

const AVAILABILITY_CACHE_PREFIX = 'doctorAvailability';

export interface AvailabilityState {
  status: DoctorStatus;
  breakEndsAt: Date | null;
  requestedStatus: DoctorStatus | null;
  heldInConsult: boolean;
  autoResumeFailed: boolean;
  updating: boolean;
}

interface CachedAvailability {
  status: DoctorStatus;
  breakEndsAt: string | null;
  requestedStatus: DoctorStatus | null;
  heldInConsult: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class DoctorAvailabilityService {

  private readonly state$ = new BehaviorSubject<AvailabilityState>(this.restore());
  private readonly expired$ = new Subject<void>();
  private breakTicker: ReturnType<typeof setInterval> | null = null;
  private hydrated = false;

  constructor(private queueService: QueueService, private zone: NgZone) {
    this.startBreakTimer();
  }

  private get doctorUuid(): string {
    return getCacheData(true, doctorDetails.USER)?.uuid ?? '';
  }

  private get speciality(): string {
    return getSpecialization(getCacheData(true, doctorDetails.PROVIDER)?.attributes);
  }

  private get cacheKey(): string {
    return `${AVAILABILITY_CACHE_PREFIX}:${this.doctorUuid || 'unknown'}`;
  }

  get changes(): Observable<AvailabilityState> {
    return this.state$.asObservable();
  }

  get breakExpired(): Observable<void> {
    return this.expired$.asObservable();
  }

  get snapshot(): AvailabilityState {
    return this.state$.value;
  }

  get onBreak(): boolean {
    return this.snapshot.status === 'away';
  }

  get queueDisabled(): boolean {
    return this.snapshot.status !== 'online';
  }

  get breakRemainingMs(): number {
    const endsAt = this.snapshot.breakEndsAt;
    return endsAt ? Math.max(0, endsAt.getTime() - Date.now()) : 0;
  }

  get breakCountdown(): string {
    const totalSeconds = Math.ceil(this.breakRemainingMs / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${`${seconds}`.padStart(2, '0')}`;
  }

  hydrate(doctorUuid: string, speciality: string): Observable<AvailabilityState> {
    if (this.hydrated || !doctorUuid || !speciality) {
      return of(this.snapshot);
    }
    this.hydrated = true;
    return of(this.snapshot);
  }

  update(
    doctorUuid: string,
    speciality: string,
    status: DoctorStatus,
    breakEndsAt: Date | null = null,
    isAutoResume = false
  ): Observable<DoctorStatusResponse | null> {
    const previous = this.snapshot;
    this.stopBreakTimer();
    this.patch({
      status,
      breakEndsAt,
      requestedStatus: status,
      autoResumeFailed: false,
      updating: true
    });

    return this.queueService.updateDoctorStatus(doctorUuid, status, speciality, breakEndsAt).pipe(
      tap((res: DoctorStatusResponse) => {
        const serverStatus = res?.data?.status ?? status;
        const requestedStatus = res?.data?.requestedStatus ?? status;
        const heldInConsult = !!res?.data?.heldInConsult && requestedStatus !== serverStatus;

        this.patch({
          status: serverStatus,
          breakEndsAt: requestedStatus === 'away' ? breakEndsAt : null,
          requestedStatus,
          heldInConsult,
          updating: false
        });
        this.startBreakTimer();
      }),
      catchError((err: unknown) => {
        this.patch({
          status: previous.status,
          breakEndsAt: previous.breakEndsAt,
          requestedStatus: previous.requestedStatus,
          heldInConsult: previous.heldInConsult,
          autoResumeFailed: isAutoResume,
          updating: false
        });
        this.startBreakTimer();
        throw err;
      })
    );
  }

  clear(): void {
    this.stopBreakTimer();
    this.hydrated = false;
    deleteCacheData(this.cacheKey);
    this.state$.next({
      status: 'online',
      breakEndsAt: null,
      requestedStatus: null,
      heldInConsult: false,
      autoResumeFailed: false,
      updating: false
    });
  }

  private startBreakTimer(): void {
    this.stopBreakTimer();
    if (!this.snapshot.breakEndsAt) {
      return;
    }
    this.zone.runOutsideAngular(() => {
      this.breakTicker = setInterval(() => this.zone.run(() => this.tick()), 1000);
    });
  }

  private stopBreakTimer(): void {
    if (this.breakTicker) {
      clearInterval(this.breakTicker);
      this.breakTicker = null;
    }
  }

  private tick(): void {
    const { breakEndsAt, status } = this.snapshot;
    if (!breakEndsAt) {
      this.stopBreakTimer();
      return;
    }
    if (breakEndsAt.getTime() > Date.now()) {
      this.state$.next({ ...this.snapshot });
      return;
    }
    this.stopBreakTimer();
    this.patch({ breakEndsAt: null, status });
    this.resumeAfterBreak();
  }

  private resumeAfterBreak(): void {
    const doctorUuid = this.doctorUuid;
    const speciality = this.speciality;
    if (!doctorUuid || !speciality) {
      this.patch({ autoResumeFailed: true });
      this.expired$.next();
      return;
    }
    this.update(doctorUuid, speciality, 'online', null, true).subscribe({
      next: () => this.expired$.next(),
      error: () => this.expired$.next()
    });
  }

  private patch(changes: Partial<AvailabilityState>): void {
    const next: AvailabilityState = { ...this.snapshot, ...changes };
    this.state$.next(next);
    this.persist(next);
  }

  private persist(state: AvailabilityState): void {
    const cached: CachedAvailability = {
      status: state.status,
      breakEndsAt: state.breakEndsAt ? state.breakEndsAt.toISOString() : null,
      requestedStatus: state.requestedStatus,
      heldInConsult: state.heldInConsult
    };
    setCacheData(this.cacheKey, JSON.stringify(cached));
  }

  private restore(): AvailabilityState {
    const cached: CachedAvailability | null = getCacheData(true, this.cacheKey);
    const endsAt = cached?.breakEndsAt ? new Date(cached.breakEndsAt) : null;
    const breakEndsAt = endsAt && !isNaN(endsAt.getTime()) && endsAt.getTime() > Date.now() ? endsAt : null;
    return {
      status: cached?.status ?? 'online',
      breakEndsAt,
      requestedStatus: cached?.requestedStatus ?? null,
      heldInConsult: !!cached?.heldInConsult,
      autoResumeFailed: false,
      updating: false
    };
  }
}
