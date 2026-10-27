import { HttpClient, HttpContext, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { DoctorStatus, DoctorStatusResponse, QueueEntryStatus, QueueVisitsResponse } from '../queue/queue.model';
import { AppConfigService } from './app-config.service';
import { SKIP_ERROR_INTERCEPTOR } from '../core/interceptors/error-interceptor.context';
import { getCacheData } from '../utils/utility-functions';
import { doctorDetails } from 'src/config/constant';

/** A queue entry as returned by the visit lookup and claim endpoints */
export interface QueueEntryLookup {
  queueEntryId: number;
  visitUuid: string;
  status: QueueEntryStatus;
  /** Live 1-based rank within the speciality; null once the case has left the waiting lanes */
  position: number | null;
  assignedDoctorUuid: string | null;
}

export interface QueueGateResult {
  allowed: boolean;
  title?: string;
  message?: string;
  /** Set when the visit was claimed here, so it can be released if the visit note fails */
  claimedQueueEntryId?: number;
}

/** Reasons QMS rejects a claim, keyed by error code */
const CLAIM_ERROR_MESSAGES: { [code: string]: string } = {
  CASE_ALREADY_CLAIMED: 'This visit was just claimed by another doctor',
  CASE_CANCELLED: 'This visit was cancelled',
  DOCTOR_NOT_ONLINE: 'You must be online in the queue to claim this visit',
  INVALID_STATE_TRANSITION: "This visit can't be claimed right now"
};

const UNABLE_TO_CLAIM = 'Unable to claim visit';

@Injectable({
  providedIn: 'root'
})
export class QueueService {

  private baseURL = environment.queueURL;

  constructor(private http: HttpClient, private appConfigService: AppConfigService) { }

  /** Whether the queue management system is enabled from configuration */
  get isQmsEnabled(): boolean {
    return !!this.appConfigService.qms_section;
  }

  /** Requests whose errors are handled by the caller, so the global error interceptor stays out of the way */
  private get callerHandledErrors() {
    return { context: new HttpContext().set(SKIP_ERROR_INTERCEPTOR, true) };
  }

  /** User uuid of the logged-in doctor, which QMS stores as assignedDoctorUuid */
  currentUserUuid(): string | undefined {
    return getCacheData(true, doctorDetails.USER)?.uuid;
  }

  getQueueByVisit(visitUuid: string): Observable<QueueEntryLookup> {
    return this.http.get<{ success: boolean; data: QueueEntryLookup }>(`${this.baseURL}/queue/visit/${visitUuid}`, this.callerHandledErrors)
      .pipe(map(res => res?.data));
  }

  claimQueueEntry(queueEntryId: number): Observable<QueueEntryLookup> {
    return this.http.post<{ success: boolean; data: QueueEntryLookup }>(`${this.baseURL}/queue/${queueEntryId}/claim`, {}, this.callerHandledErrors)
      .pipe(map(res => res?.data));
  }

  /** Hand a claimed queue entry back to the queue. Best-effort cleanup, so errors are swallowed */
  releaseQueueEntry(queueEntryId: number, reason: string): Observable<QueueEntryLookup | null> {
    return this.http.post<{ success: boolean; data: QueueEntryLookup }>(`${this.baseURL}/queue/${queueEntryId}/release`, { reason }, this.callerHandledErrors)
      .pipe(map(res => res?.data), catchError(() => of(null)));
  }

  /**
   * Tell QMS the prescription was shared, which completes the visit's queue entry.
   * Call once the visit complete encounter is created. QMS takes the doctor from the token.
   * Best-effort, so errors are swallowed and a QMS outage doesn't affect sharing.
   */
  markPrescriptionShared(visitUuid: string): Observable<boolean> {
    if (!this.isQmsEnabled || !visitUuid) {
      return of(false);
    }
    return this.http.post<{ success: boolean }>(`${this.baseURL}/queue/visit/${visitUuid}/prescription-shared`, {}, this.callerHandledErrors)
      .pipe(map(res => !!res?.success), catchError(() => of(false)));
  }

  /**
   * Check whether a visit note can be started.
   *
   * QMS disabled, or the visit is not in the queue / the lookup fails: allow (existing workflow).
   * Cancelled, or assigned to another doctor: block.
   * Assigned to this doctor: allow, nothing to claim.
   * Waiting at position > 1: block, the patient is not next in queue.
   * Waiting at position 1: claim first. A 4xx from the claim blocks; an unreachable or failing
   * queue server (network error / 5xx) allows, so a QMS outage doesn't stop consultations.
   */
  prepareVisitNote(visitUuid: string): Observable<QueueGateResult> {
    if (!this.isQmsEnabled || !visitUuid) {
      return of({ allowed: true });
    }

    return this.getQueueByVisit(visitUuid).pipe(
      catchError(() => of(null)),
      switchMap((entry: QueueEntryLookup | null): Observable<QueueGateResult> => {
        if (!entry) {
          return of({ allowed: true });
        }

        if (entry.status === 'CANCELLED') {
          return of({ allowed: false, title: UNABLE_TO_CLAIM, message: CLAIM_ERROR_MESSAGES.CASE_CANCELLED });
        }

        if (entry.assignedDoctorUuid) {
          return of(entry.assignedDoctorUuid === this.currentUserUuid()
            ? { allowed: true }
            : { allowed: false, title: UNABLE_TO_CLAIM, message: 'This visit is already with another doctor' });
        }

        if (entry.position == null) {
          return of({ allowed: true });
        }

        if (entry.position > 1) {
          return of({
            allowed: false,
            title: 'Not next in queue',
            message: "You can't start this visit as this patient is not next in queue"
          });
        }

        return this.claimQueueEntry(entry.queueEntryId).pipe(
          map((): QueueGateResult => ({ allowed: true, claimedQueueEntryId: entry.queueEntryId })),
          catchError((err: HttpErrorResponse) => of(this.isQueueServerDown(err)
            ? { allowed: true }
            : {
              allowed: false,
              title: UNABLE_TO_CLAIM,
              message: CLAIM_ERROR_MESSAGES[err?.error?.code] ?? CLAIM_ERROR_MESSAGES.INVALID_STATE_TRANSITION
            }))
        );
      })
    );
  }

  private isQueueServerDown(err: HttpErrorResponse): boolean {
    return !err?.status || err.status >= 500;
  }

  getDoctorVisits(doctorUuid: string, speciality: string, limit = 50, offset = 0): Observable<QueueVisitsResponse> {
    const params = new HttpParams()
      .set('speciality', speciality)
      .set('limit', `${limit}`)
      .set('offset', `${offset}`);
    return this.http.get<QueueVisitsResponse>(`${this.baseURL}/queue/doctor/${doctorUuid}/visits`, { params });
  }

  updateDoctorStatus(
    doctorUuid: string,
    status: DoctorStatus,
    speciality: string,
    breakEndsAt: Date | null = null
  ): Observable<DoctorStatusResponse> {
    const body: { status: DoctorStatus; speciality: string; breakEndsAt?: string } = { status, speciality };
    if (breakEndsAt) {
      body.breakEndsAt = breakEndsAt.toISOString();
    }
    return this.http.patch<DoctorStatusResponse>(`${this.baseURL}/doctor/${doctorUuid}/status`, body);
  }
}
