import { of, throwError } from 'rxjs';

import { DoctorAvailabilityService } from './doctor-availability.service';
import { DoctorStatus } from '../queue/queue.model';

describe('DoctorAvailabilityService', () => {
  let queueService: any;
  let zone: any;

  const statusResponse = (
    status: DoctorStatus,
    requestedStatus: DoctorStatus = status,
    heldInConsult = false
  ) => of({ success: true, message: 'ok', data: { status, requestedStatus, heldInConsult } } as any);

  const build = () => new DoctorAvailabilityService(queueService, zone);

  beforeEach(() => {
    localStorage.removeItem('doctorAvailability');
    queueService = {
      updateDoctorStatus: jasmine.createSpy('updateDoctorStatus').and.returnValue(statusResponse('online'))
    };
    zone = {
      run: (fn: () => void) => fn(),
      runOutsideAngular: (fn: () => void) => fn()
    };
  });

  afterEach(() => {
    localStorage.removeItem('doctorAvailability');
  });

  it('starts online when nothing was cached', () => {
    const service = build();

    expect(service.snapshot.status).toBe('online');
    expect(service.snapshot.breakEndsAt).toBeNull();
    expect(service.queueDisabled).toBeFalse();
  });

  describe('update', () => {
    it('keeps the status the server reports', () => {
      queueService.updateDoctorStatus.and.returnValue(statusResponse('away'));
      const service = build();

      service.update('doc-1', 'GP', 'away', new Date(Date.now() + 60000)).subscribe();

      expect(service.snapshot.status).toBe('away');
      expect(service.onBreak).toBeTrue();
      expect(service.queueDisabled).toBeTrue();
    });

    it('rolls back to the previous status when the call fails', () => {
      const service = build();
      queueService.updateDoctorStatus.and.returnValue(throwError(new Error('boom')));

      service.update('doc-1', 'GP', 'away', new Date(Date.now() + 60000))
        .subscribe({ error: () => {} });

      expect(service.snapshot.status).toBe('online');
      expect(service.snapshot.breakEndsAt).toBeNull();
    });

    it('flags an auto resume that failed so the doctor can resume by hand', () => {
      const service = build();
      queueService.updateDoctorStatus.and.returnValue(throwError(new Error('boom')));

      service.update('doc-1', 'GP', 'online', null, true).subscribe({ error: () => {} });

      expect(service.snapshot.autoResumeFailed).toBeTrue();
    });

    it('keeps the requested break when the server holds the doctor in a consult', () => {
      const endsAt = new Date(Date.now() + 10 * 60000);
      queueService.updateDoctorStatus.and.returnValue(statusResponse('online', 'away', true));
      const service = build();

      service.update('doc-1', 'GP', 'away', endsAt).subscribe();

      expect(service.snapshot.status).toBe('online');
      expect(service.snapshot.heldInConsult).toBeTrue();
      expect(service.snapshot.requestedStatus).toBe('away');
      expect(service.snapshot.breakEndsAt).toEqual(endsAt);
    });

    it('does not report a hold when the server applied what was asked', () => {
      queueService.updateDoctorStatus.and.returnValue(statusResponse('away', 'away', true));
      const service = build();

      service.update('doc-1', 'GP', 'away', new Date(Date.now() + 60000)).subscribe();

      expect(service.snapshot.heldInConsult).toBeFalse();
    });
  });

  describe('break timer', () => {
    beforeEach(() => jasmine.clock().install());
    afterEach(() => jasmine.clock().uninstall());

    it('counts down and then reports the break as over', () => {
      jasmine.clock().mockDate(new Date('2026-10-09T10:00:00.000Z'));
      queueService.updateDoctorStatus.and.returnValue(statusResponse('away'));
      const service = build();
      const expired = jasmine.createSpy('expired');
      service.breakExpired.subscribe(expired);

      service.update('doc-1', 'GP', 'away', new Date('2026-10-09T10:02:00.000Z')).subscribe();
      expect(service.breakCountdown).toBe('2:00');

      jasmine.clock().tick(90 * 1000);
      expect(service.breakCountdown).toBe('0:30');
      expect(expired).not.toHaveBeenCalled();

      jasmine.clock().tick(30 * 1000);
      expect(expired).toHaveBeenCalled();
      expect(service.snapshot.breakEndsAt).toBeNull();
      expect(service.breakCountdown).toBe('0:00');
    });

    it('pads the seconds in the countdown', () => {
      jasmine.clock().mockDate(new Date('2026-10-09T10:00:00.000Z'));
      queueService.updateDoctorStatus.and.returnValue(statusResponse('away'));
      const service = build();

      service.update('doc-1', 'GP', 'away', new Date('2026-10-09T10:00:05.000Z')).subscribe();

      expect(service.breakCountdown).toBe('0:05');
    });
  });

  describe('surviving navigation and reload', () => {
    it('restores a break that is still running', () => {
      const endsAt = new Date(Date.now() + 5 * 60000);
      queueService.updateDoctorStatus.and.returnValue(statusResponse('away'));
      build().update('doc-1', 'GP', 'away', endsAt).subscribe();

      const restored = build();

      expect(restored.snapshot.status).toBe('away');
      expect(restored.snapshot.breakEndsAt?.getTime()).toBe(endsAt.getTime());
      expect(restored.queueDisabled).toBeTrue();
    });

    it('does not restore a break that already ran out', () => {
      localStorage.setItem('doctorAvailability', JSON.stringify({
        status: 'away',
        breakEndsAt: new Date(Date.now() - 60000).toISOString(),
        requestedStatus: 'away',
        heldInConsult: false
      }));

      const restored = build();

      expect(restored.snapshot.breakEndsAt).toBeNull();
      expect(restored.snapshot.status).toBe('away');
    });

    it('ignores a cached break end that is not a date', () => {
      localStorage.setItem('doctorAvailability', JSON.stringify({
        status: 'away', breakEndsAt: 'not-a-date', requestedStatus: null, heldInConsult: false
      }));

      expect(build().snapshot.breakEndsAt).toBeNull();
    });

    it('restores the off-shift status after a reload', () => {
      queueService.updateDoctorStatus.and.returnValue(statusResponse('offline'));
      build().update('doc-1', 'GP', 'offline').subscribe();

      expect(build().snapshot.status).toBe('offline');
    });

    it('forgets everything once cleared', () => {
      queueService.updateDoctorStatus.and.returnValue(statusResponse('offline'));
      const service = build();
      service.update('doc-1', 'GP', 'offline').subscribe();

      service.clear();

      expect(service.snapshot.status).toBe('online');
      expect(build().snapshot.status).toBe('online');
    });
  });

  describe('hydrate', () => {
    it('does nothing without a doctor or a speciality', () => {
      const service = build();
      const emitted = jasmine.createSpy('emitted');

      service.hydrate('', '').subscribe(emitted);

      expect(emitted).toHaveBeenCalledWith(service.snapshot);
    });

    it('only runs once per session', () => {
      const service = build();
      service.hydrate('doc-1', 'GP').subscribe();
      const second = jasmine.createSpy('second');

      service.hydrate('doc-1', 'GP').subscribe(second);

      expect(second).toHaveBeenCalledWith(service.snapshot);
    });
  });
});
