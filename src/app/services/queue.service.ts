import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';
import { environment } from "../../environments/environment";
import { AppConfigService } from './app-config.service';

export interface QueueEntryStatus {
  queueEntryId: number;
  visitUuid: string;
  status: string;
  /** Live 1-based rank; null once the case has left the waiting lanes */
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

/** Reasons QMS rejects a claim with 409, keyed by error code */
const CLAIM_CONFLICT_MESSAGES: { [code: string]: string } = {
  CASE_ALREADY_CLAIMED: 'This visit was just claimed by another doctor',
  CASE_CANCELLED: 'This visit was cancelled',
  DOCTOR_NOT_ONLINE: 'You must be online in the queue to claim this visit',
  INVALID_STATE_TRANSITION: 'This visit can\'t be claimed right now'
};

@Injectable({
  providedIn: 'root'
})
export class QueueService {
  private baseURL = environment.qmsURL;

  constructor(private http: HttpClient, private appConfigService: AppConfigService) { }

  /**
  * Whether the queue management system is enabled from configuration
  * @return {boolean}
  */
  get isQmsEnabled(): boolean {
    return !!this.appConfigService.qms_section;
  }

  /**
  * Get queue entry details for a visit
  * @param {string} visitUuid - Visit uuid
  * @return {Observable<QueueEntryStatus>}
  */
  getQueueByVisit(visitUuid: string): Observable<QueueEntryStatus> {
    return this.http.get<{ success: boolean; data: QueueEntryStatus }>(`${this.baseURL}/queue/visit/${visitUuid}`)
      .pipe(map((res) => res?.data));
  }

  /**
  * Claim a waiting queue entry for the logged-in doctor (doctor is taken from the token)
  * @param {number} queueEntryId - Queue entry id
  * @return {Observable<QueueEntryStatus>}
  */
  claimQueueEntry(queueEntryId: number): Observable<QueueEntryStatus> {
    return this.http.post<{ success: boolean; data: QueueEntryStatus }>(`${this.baseURL}/queue/${queueEntryId}/claim`, {})
      .pipe(map((res) => res?.data));
  }

  /**
  * Hand a claimed queue entry back to the queue. Errors are swallowed: this is best-effort cleanup.
  * @param {number} queueEntryId - Queue entry id
  * @param {string} reason - Why the case is being released
  * @return {Observable<QueueEntryStatus | null>}
  */
  releaseQueueEntry(queueEntryId: number, reason: string): Observable<QueueEntryStatus | null> {
    return this.http.post<{ success: boolean; data: QueueEntryStatus }>(`${this.baseURL}/queue/${queueEntryId}/release`, { reason })
      .pipe(map((res) => res?.data), catchError(() => of(null)));
  }

  /**
  * Check whether the visit note can be started and, if the visit is next in queue, claim it.
  * - QMS disabled: allowed, old behaviour.
  * - Position > 1: blocked, patient is not next in queue.
  * - Position 1 (still waiting): claimed first; a 409 from claim blocks with its reason.
  * - Already out of the waiting lanes (position null): allowed without claiming.
  * Any other failure (QMS down, visit not queued) falls back to the old behaviour and allows it.
  * @param {string} visitUuid - Visit uuid
  * @return {Observable<QueueGateResult>}
  */
  prepareVisitNote(visitUuid: string): Observable<QueueGateResult> {
    if (!this.isQmsEnabled || !visitUuid) {
      return of({ allowed: true });
    }
    return this.getQueueByVisit(visitUuid).pipe(
      catchError(() => of(null)),
      switchMap((entry: QueueEntryStatus | null) => {
        if (!entry || entry.position == null) {
          return of({ allowed: true });
        }
        if (entry.position > 1) {
          return of({ allowed: false, title: 'Not next in queue', message: 'You can\'t start this visit as this patient is not next in queue' });
        }
        return this.claimQueueEntry(entry.queueEntryId).pipe(
          map(() => ({ allowed: true, claimedQueueEntryId: entry.queueEntryId })),
          catchError((err: HttpErrorResponse) => of(err?.status === 409
            ? { allowed: false, title: 'Unable to claim visit', message: CLAIM_CONFLICT_MESSAGES[err?.error?.code] ?? 'This visit can\'t be claimed right now' }
            : { allowed: true }))
        );
      })
    );
  }
}
