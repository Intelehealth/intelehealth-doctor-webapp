import { HttpErrorResponse } from '@angular/common/http';
import { of, throwError } from 'rxjs';
import { QueueEntryLookup, QueueGateResult, QueueService } from './queue.service';
import { SKIP_ERROR_INTERCEPTOR } from '../core/interceptors/error-interceptor.context';

describe('QueueService', () => {
  let http: any;
  let appConfig: any;
  let service: QueueService;

  beforeEach(() => {
    http = {
      get: jasmine.createSpy('get'),
      post: jasmine.createSpy('post'),
      patch: jasmine.createSpy('patch')
    };
    appConfig = { qms_section: true };
    service = new QueueService(http, appConfig);
    spyOn(service, 'currentUserUuid').and.returnValue('doc-1');
  });

  describe('prepareVisitNote', () => {
    const entry = (overrides: Partial<QueueEntryLookup> = {}): QueueEntryLookup => ({
      queueEntryId: 7,
      visitUuid: 'visit-1',
      status: 'QUEUED',
      position: 1,
      assignedDoctorUuid: null,
      ...overrides
    });
    const lookupReturns = (value: QueueEntryLookup) => http.get.and.returnValue(of({ success: true, data: value }));
    const claimFails = (status: number, code?: string) =>
      http.post.and.returnValue(throwError(new HttpErrorResponse({ status, error: code ? { code } : null })));
    const run = (): QueueGateResult => {
      let result: QueueGateResult;
      service.prepareVisitNote('visit-1').subscribe(r => result = r);
      return result;
    };

    it('allows without calling the queue when QMS is disabled', () => {
      appConfig.qms_section = false;

      expect(run()).toEqual({ allowed: true });
      expect(http.get).not.toHaveBeenCalled();
    });

    it('allows when the visit lookup fails', () => {
      http.get.and.returnValue(throwError(new HttpErrorResponse({ status: 404 })));

      expect(run()).toEqual({ allowed: true });
    });

    it('blocks when the patient is not next in queue', () => {
      lookupReturns(entry({ position: 3 }));

      const result = run();
      expect(result.allowed).toBeFalse();
      expect(result.title).toBe('Not next in queue');
      expect(http.post).not.toHaveBeenCalled();
    });

    it('claims the entry at position 1 and reports the claim', () => {
      lookupReturns(entry());
      http.post.and.returnValue(of({ success: true, data: entry({ status: 'ASSIGNED', assignedDoctorUuid: 'doc-1' }) }));

      expect(run()).toEqual({ allowed: true, claimedQueueEntryId: 7 });
      expect(http.post.calls.mostRecent().args[0]).toContain('/queue/7/claim');
    });

    it('blocks with the server reason when the claim conflicts', () => {
      lookupReturns(entry());
      claimFails(409, 'CASE_ALREADY_CLAIMED');

      expect(run()).toEqual({
        allowed: false,
        title: 'Unable to claim visit',
        message: 'This visit was just claimed by another doctor'
      });
    });

    it('blocks on a 403 from the claim', () => {
      lookupReturns(entry());
      claimFails(403);

      expect(run().allowed).toBeFalse();
    });

    it('blocks on a 400 from the claim', () => {
      lookupReturns(entry());
      claimFails(400, 'VALIDATION_ERROR');

      const result = run();
      expect(result.allowed).toBeFalse();
      expect(result.message).toBe("This visit can't be claimed right now");
    });

    it('allows when the queue server is down (5xx or network error)', () => {
      lookupReturns(entry());
      claimFails(503);
      expect(run()).toEqual({ allowed: true });

      claimFails(0);
      expect(run()).toEqual({ allowed: true });
    });

    it('blocks when another doctor already has the visit', () => {
      lookupReturns(entry({ status: 'ASSIGNED', position: null, assignedDoctorUuid: 'doc-2' }));

      const result = run();
      expect(result.allowed).toBeFalse();
      expect(result.message).toBe('This visit is already with another doctor');
      expect(http.post).not.toHaveBeenCalled();
    });

    it('allows without claiming when the visit is already assigned to this doctor', () => {
      lookupReturns(entry({ status: 'CALL_CONNECTED', position: null, assignedDoctorUuid: 'doc-1' }));

      expect(run()).toEqual({ allowed: true });
      expect(http.post).not.toHaveBeenCalled();
    });

    it('blocks when the visit was cancelled', () => {
      lookupReturns(entry({ status: 'CANCELLED', position: null }));

      const result = run();
      expect(result.allowed).toBeFalse();
      expect(result.message).toBe('This visit was cancelled');
    });

    it('keeps the global error interceptor off the lookup and claim', () => {
      lookupReturns(entry());
      http.post.and.returnValue(of({ success: true, data: entry() }));
      run();

      expect(http.get.calls.mostRecent().args[1].context.get(SKIP_ERROR_INTERCEPTOR)).toBeTrue();
      expect(http.post.calls.mostRecent().args[2].context.get(SKIP_ERROR_INTERCEPTOR)).toBeTrue();
    });
  });

  describe('getDoctorVisits', () => {
    it('leaves the global error interceptor on for the queue list', () => {
      service.getDoctorVisits('doc-1', 'General Physician');

      const [, options] = http.get.calls.mostRecent().args;
      expect(options.context).toBeUndefined();
    });

    it('asks for one page of the doctor queue', () => {
      service.getDoctorVisits('doc-1', 'General Physician', 5, 10);

      const [url, options] = http.get.calls.mostRecent().args;
      expect(url).toContain('/queue/doctor/doc-1/visits');
      expect(options.params.get('speciality')).toBe('General Physician');
      expect(options.params.get('limit')).toBe('5');
      expect(options.params.get('offset')).toBe('10');
    });

    it('does not ask for an ETA the queue screen never shows', () => {
      service.getDoctorVisits('doc-1', 'General Physician');

      const [, options] = http.get.calls.mostRecent().args;
      expect(options.params.has('includeEta')).toBeFalse();
    });
  });

  describe('updateDoctorStatus', () => {
    it('sends the status and speciality', () => {
      service.updateDoctorStatus('doc-1', 'online', 'General Physician');

      const [url, body] = http.patch.calls.mostRecent().args;
      expect(url).toContain('/doctor/doc-1/status');
      expect(body).toEqual({ status: 'online', speciality: 'General Physician' });
    });

    it('sends the break end so the server knows when the doctor is back', () => {
      const endsAt = new Date('2026-10-09T10:30:00.000Z');

      service.updateDoctorStatus('doc-1', 'away', 'General Physician', endsAt);

      const [, body] = http.patch.calls.mostRecent().args;
      expect(body.status).toBe('away');
      expect(body.breakEndsAt).toBe('2026-10-09T10:30:00.000Z');
    });

    it('leaves the break end out when there is no break', () => {
      service.updateDoctorStatus('doc-1', 'offline', 'General Physician', null);

      const [, body] = http.patch.calls.mostRecent().args;
      expect('breakEndsAt' in body).toBeFalse();
    });
  });
});
