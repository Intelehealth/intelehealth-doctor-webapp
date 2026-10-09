import { QueueService } from './queue.service';

describe('QueueService', () => {
  let http: any;
  let service: QueueService;

  beforeEach(() => {
    http = {
      get: jasmine.createSpy('get'),
      patch: jasmine.createSpy('patch')
    };
    service = new QueueService(http);
  });

  describe('getDoctorVisits', () => {
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
