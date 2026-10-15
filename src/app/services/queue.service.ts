
import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';

import { environment } from '../../environments/environment';
import { AppConfigService } from './app-config.service';
import {
  DoctorStatus,
  DoctorStatusResponse,
  QueueVisitsResponse
} from '../queue/queue.model';

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
  INVALID_STATE_TRANSITION: "This visit can't be claimed right now"
};

@Injectable({
  providedIn: 'root'
})
export class QueueService {
  private qmsBaseURL = environment.qmsURL;
  private queueBaseURL = environment.queueURL;

  constructor(
    private http: HttpClient,
    private appConfigService: AppConfigService
  ) {}

  /**
   * Whether the queue management system is enabled from configuration.
   */
  get isQmsEnabled(): boolean {
    return !!this.appConfigService.qms_section;
  }

  /**
   * Get queue entry details for a visit.
   */
  getQueueByVisit(visitUuid: string): Observable<QueueEntryStatus> {
    return this.http
      .get<{ success: boolean; data: QueueEntryStatus }>(
        `${this.qmsBaseURL}/queue/visit/${visitUuid}`
      )
      .pipe(map(res => res?.data));
  }

  /**
   * Claim a waiting queue entry for the logged-in doctor.
   */
  claimQueueEntry(queueEntryId: number): Observable<QueueEntryStatus> {
    return this.http
      .post<{ success: boolean; data: QueueEntryStatus }>(
        `${this.qmsBaseURL}/queue/${queueEntryId}/claim`,
        {}
      )
      .pipe(map(res => res?.data));
  }

  /**
   * Hand a claimed queue entry back to the queue.
   * Errors are swallowed because this is best-effort cleanup.
   */
  releaseQueueEntry(
    queueEntryId: number,
    reason: string
  ): Observable<QueueEntryStatus | null> {
    return this.http
      .post<{ success: boolean; data: QueueEntryStatus }>(
        `${this.qmsBaseURL}/queue/${queueEntryId}/release`,
        { reason }
      )
      .pipe(
        map(res => res?.data),
        catchError(() => of(null))
      );
  }

  /**
   * Check whether a visit note can be started.
   *
   * QMS disabled: allow the existing workflow.
   * Position > 1: block because the patient is not next in queue.
   * Position 1: claim the queue entry before starting the note.
   * Position null: allow because the case has left the waiting lanes.
   * Other lookup/claim failures: preserve the existing fallback behaviour.
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
          return of({
            allowed: false,
            title: 'Not next in queue',
            message:
              "You can't start this visit as this patient is not next in queue"
          });
        }

        return this.claimQueueEntry(entry.queueEntryId).pipe(
          map(() => ({
            allowed: true,
            claimedQueueEntryId: entry.queueEntryId
          })),
          catchError((err: HttpErrorResponse) =>
            of(
              err?.status === 409
                ? {
                    allowed: false,
                    title: 'Unable to claim visit',
                    message:
                      CLAIM_CONFLICT_MESSAGES[err?.error?.code] ??
                      "This visit can't be claimed right now"
                  }
                : { allowed: true }
            )
          )
        );
      })
    );
  }

  /**
   * Get visits assigned to a doctor, filtered by speciality.
   */
  getDoctorVisits(
    doctorUuid: string,
    speciality: string,
    limit = 50,
    offset = 0
  ): Observable<QueueVisitsResponse> {
    const params = new HttpParams()
      .set('speciality', speciality)
      .set('limit', `${limit}`)
      .set('offset', `${offset}`);

    return this.http.get<QueueVisitsResponse>(
      `${this.queueBaseURL}/queue/doctor/${doctorUuid}/visits`,
      { params }
    );
  }

  /**
   * Update a doctor's queue availability/status.
   */
  updateDoctorStatus(
    doctorUuid: string,
    status: DoctorStatus,
    speciality: string,
    breakEndsAt: Date | null = null
  ): Observable<DoctorStatusResponse> {
    const body: {
      status: DoctorStatus;
      speciality: string;
      breakEndsAt?: string;
    } = {
      status,
      speciality
    };

    if (breakEndsAt) {
      body.breakEndsAt = breakEndsAt.toISOString();
    }

    return this.http.patch<DoctorStatusResponse>(
      `${this.queueBaseURL}/doctor/${doctorUuid}/status`,
      body
    );
  }
}
