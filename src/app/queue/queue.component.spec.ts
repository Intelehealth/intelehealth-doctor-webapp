import { of, throwError, Subject } from 'rxjs';

import { QueueComponent } from './queue.component';
import { AvailabilityState } from '../services/doctor-availability.service';
import { QueueEntryStatus, QueueStatus } from './queue.model';
import { doctorDetails } from 'src/config/constant';

describe('QueueComponent', () => {
  let component: QueueComponent;
  let dialog: any;
  let router: any;
  let queueService: any;
  let visitService: any;
  let availabilityService: any;
  let toastr: any;
  let changes$: Subject<AvailabilityState>;
  let expired$: Subject<void>;
  let dialogResult$: Subject<any>;

  const state = (over: Partial<AvailabilityState> = {}): AvailabilityState => ({
    status: 'online',
    breakEndsAt: null,
    requestedStatus: null,
    heldInConsult: false,
    autoResumeFailed: false,
    updating: false,
    ...over
  });

  const entry = (over: any = {}) => ({
    queueEntryId: 1,
    visitUuid: 'visit-1',
    patientUuid: 'patient-1',
    status: 'QUEUED' as QueueEntryStatus,
    position: 2,
    ...over
  });

  const visitsResponse = (data: any) => of({ success: true, message: 'ok', data });

  beforeEach(() => {
    localStorage.setItem(doctorDetails.USER, JSON.stringify({ uuid: 'doc-1' }));
    localStorage.setItem(doctorDetails.PROVIDER, JSON.stringify({
      person: { display: 'Dr Who' },
      attributes: [{
        attributeType: { uuid: 'ed1715f5-93e2-404e-b3c9-2a2d9600f062' },
        value: 'General Physician',
        voided: false
      }]
    }));

    changes$ = new Subject<AvailabilityState>();
    expired$ = new Subject<void>();
    dialogResult$ = new Subject<any>();

    dialog = { open: jasmine.createSpy('open').and.returnValue({ afterClosed: () => dialogResult$ }) };
    router = { navigate: jasmine.createSpy('navigate') };
    queueService = {
      getDoctorVisits: jasmine.createSpy('getDoctorVisits')
        .and.returnValue(visitsResponse({ currentVisit: null, items: [], total: 0 }))
    };
    visitService = {
      getVisitDetails: jasmine.createSpy('getVisitDetails').and.returnValue(of({})),
      getData: (obs: any) => obs,
      parseChiefComplaints: jasmine.createSpy('parseChiefComplaints').and.returnValue(['Fever'])
    };
    availabilityService = {
      changes: changes$.asObservable(),
      breakExpired: expired$.asObservable(),
      breakCountdown: '0:00',
      snapshot: state(),
      hydrate: jasmine.createSpy('hydrate').and.returnValue(of(state())),
      update: jasmine.createSpy('update').and.returnValue(of({ data: { status: 'online' } }))
    };
    toastr = {
      success: jasmine.createSpy('success'),
      info: jasmine.createSpy('info'),
      warning: jasmine.createSpy('warning'),
      error: jasmine.createSpy('error')
    };

    component = new QueueComponent(
      dialog,
      router,
      queueService,
      visitService,
      availabilityService,
      toastr,
      { instant: (key: string) => key } as any
    );
  });

  afterEach(() => {
    component.ngOnDestroy();
    localStorage.removeItem(doctorDetails.USER);
    localStorage.removeItem(doctorDetails.PROVIDER);
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('ngOnInit', () => {
    it('reads the status back before loading the queue', () => {
      component.ngOnInit();

      expect(availabilityService.hydrate).toHaveBeenCalledWith('doc-1', 'General Physician');
      expect(queueService.getDoctorVisits).toHaveBeenCalled();
    });

    it('shows the status held in the service, not a fresh "online"', () => {
      const endsAt = new Date(Date.now() + 60000);
      component.ngOnInit();

      changes$.next(state({ status: 'away', breakEndsAt: endsAt, updating: true }));

      expect(component.availability).toBe('away');
      expect(component.breakEndsAt).toBe(endsAt);
      expect(component.statusUpdating).toBeTrue();
      expect(component.queueDisabled).toBeTrue();
    });

    it('sends the doctor back online when a break runs out', () => {
      component.ngOnInit();

      expired$.next();

      const [, , status, , isAutoResume] = availabilityService.update.calls.mostRecent().args;
      expect(status).toBe('online');
      expect(isAutoResume).toBeTrue();
      expect(toastr.success).toHaveBeenCalled();
    });

    it('stops listening once the screen is destroyed', () => {
      component.ngOnInit();
      component.ngOnDestroy();

      changes$.next(state({ status: 'offline' }));

      expect(component.availability).toBe('online');
    });
  });

  describe('loadQueue', () => {
    it('pins the current visit to the top of the first page without repeating it', () => {
      const current = entry({ queueEntryId: 9, visitUuid: 'visit-9', status: 'ASSIGNED' });
      queueService.getDoctorVisits.and.returnValue(visitsResponse({
        currentVisit: current,
        items: [current, entry({ queueEntryId: 1 })],
        total: 2
      }));

      component.loadQueue();

      expect(component.patients.length).toBe(2);
      expect(component.patients[0].queueEntryId).toBe(9);
      expect(component.patients.filter(p => p.queueEntryId === 9).length).toBe(1);
    });

    it('does not pin the current visit onto later pages', () => {
      queueService.getDoctorVisits.and.returnValue(visitsResponse({
        currentVisit: entry({ queueEntryId: 9 }),
        items: [entry({ queueEntryId: 1 })],
        total: 7
      }));

      component.loadQueue(1);

      expect(component.patients.length).toBe(1);
      expect(component.patients[0].queueEntryId).toBe(1);
    });

    it('takes the row count from the server instead of the rows on screen', () => {
      queueService.getDoctorVisits.and.returnValue(visitsResponse({
        currentVisit: null, items: [entry()], total: 120
      }));

      component.loadQueue();

      expect(component.totalPatients).toBe(120);
      expect(component.totalPages).toBe(24);
    });

    it('empties the table when the queue cannot be read', () => {
      queueService.getDoctorVisits.and.returnValue(throwError(new Error('boom')));

      component.loadQueue();

      expect(component.patients).toEqual([]);
      expect(component.totalPatients).toBe(0);
      expect(component.loadingQueue).toBeFalse();
    });

    it('does nothing without a doctor uuid', () => {
      localStorage.removeItem(doctorDetails.USER);

      component.loadQueue();

      expect(queueService.getDoctorVisits).not.toHaveBeenCalled();
    });

    it('fills in the patient details of the rows on screen', () => {
      queueService.getDoctorVisits.and.returnValue(visitsResponse({
        currentVisit: null, items: [entry()], total: 1
      }));
      visitService.getVisitDetails.and.returnValue(of({
        location: { display: 'Clinic A' },
        patient: { person: { display: 'Asha', gender: 'F', age: 32 } },
        encounters: []
      }));

      component.loadQueue();

      expect(component.patients[0].name).toBe('Asha');
      expect(component.patients[0].gender).toBe('F');
      expect(component.patients[0].age).toBe('32 y');
      expect(component.patients[0].location).toBe('Clinic A');
    });

    it('lets a row be retried when its details fail to load', () => {
      queueService.getDoctorVisits.and.returnValue(visitsResponse({
        currentVisit: null, items: [entry()], total: 1
      }));
      visitService.getVisitDetails.and.returnValue(throwError(new Error('boom')));

      component.loadQueue();

      expect(component.patients[0].loaded).toBeFalse();
    });
  });

  describe('chief complaint', () => {
    it('uses the shared parser so the queue matches the dashboard', () => {
      queueService.getDoctorVisits.and.returnValue(visitsResponse({
        currentVisit: null, items: [entry()], total: 1
      }));
      visitService.getVisitDetails.and.returnValue(of({
        patient: { person: {} },
        encounters: [{
          encounterType: { display: 'ADULTINITIAL' },
          obs: [{ concept: { display: 'CURRENT COMPLAINT' }, value: '►fever<b>Fever</b>' }]
        }]
      }));

      component.loadQueue();

      expect(visitService.parseChiefComplaints).toHaveBeenCalledWith('►fever<b>Fever</b>');
      expect(component.patients[0].chiefComplaint).toBe('Fever');
    });
  });

  describe('status mapping', () => {
    const cases: Array<[QueueEntryStatus, QueueStatus]> = [
      ['CALL_CONNECTING', 'on_call'],
      ['CALL_CONNECTED', 'on_call'],
      ['ASSIGNED', 'assigned'],
      ['CALL_COMPLETED', 'awaiting_prescription'],
      ['COMPLETED', 'completed'],
      ['CANCELLED', 'cancelled'],
      ['QUEUED', 'waiting'],
      ['RE_QUEUED', 'waiting'],
      ['ESCALATED', 'waiting']
    ];

    cases.forEach(([given, expected]) => {
      it(`maps ${given} to ${expected}`, () => {
        queueService.getDoctorVisits.and.returnValue(visitsResponse({
          currentVisit: null, items: [entry({ status: given })], total: 1
        }));

        component.loadQueue();

        expect(component.patients[0].status).toBe(expected);
      });
    });

    it('calls the head of the queue next in queue', () => {
      queueService.getDoctorVisits.and.returnValue(visitsResponse({
        currentVisit: null, items: [entry({ status: 'QUEUED', position: 1 })], total: 1
      }));

      component.loadQueue();

      expect(component.patients[0].status).toBe('next_in_queue');
    });

    it('turns a status into a css class', () => {
      expect(component.statusClass('awaiting_prescription')).toBe('status-awaiting-prescription');
    });
  });

  describe('paging', () => {
    beforeEach(() => {
      queueService.getDoctorVisits.and.returnValue(visitsResponse({
        currentVisit: null, items: [entry()], total: 12
      }));
      component.loadQueue();
      queueService.getDoctorVisits.calls.reset();
    });

    it('asks the server for the rows of the page', () => {
      component.goToPage(2);

      const [, , limit, offset] = queueService.getDoctorVisits.calls.mostRecent().args;
      expect(limit).toBe(5);
      expect(offset).toBe(10);
      expect(component.pageIndex).toBe(2);
    });

    it('lists a page button for every page the server reports', () => {
      expect(component.pageNumbers).toEqual([0, 1, 2]);
    });

    it('ignores a page outside the range', () => {
      component.goToPage(-1);
      component.goToPage(99);

      expect(queueService.getDoctorVisits).not.toHaveBeenCalled();
    });

    it('ignores a click on the page already shown', () => {
      component.goToPage(0);

      expect(queueService.getDoctorVisits).not.toHaveBeenCalled();
    });

    it('always reports at least one page', () => {
      queueService.getDoctorVisits.and.returnValue(visitsResponse({
        currentVisit: null, items: [], total: 0
      }));

      component.loadQueue();

      expect(component.totalPages).toBe(1);
    });
  });

  describe('updateStatus', () => {
    it('re-reads the queue after the status changes', () => {
      component.ngOnInit();
      changes$.next(state({ status: 'away' }));
      queueService.getDoctorVisits.calls.reset();
      availabilityService.snapshot = state({ status: 'online' });

      component.setAvailable();

      expect(queueService.getDoctorVisits).toHaveBeenCalled();
    });

    it('warns instead of calling the server when the speciality is missing', () => {
      localStorage.setItem(doctorDetails.PROVIDER, JSON.stringify({ person: { display: 'Dr Who' }, attributes: [] }));

      component.setAvailable();

      expect(toastr.warning).toHaveBeenCalled();
      expect(availabilityService.update).not.toHaveBeenCalled();
    });

    it('does not re-send a status the doctor already has', () => {
      component.ngOnInit();
      changes$.next(state({ status: 'online' }));

      component.setAvailable();

      expect(availabilityService.update).not.toHaveBeenCalled();
    });

    it('says so when the server will move the doctor after the consult', () => {
      availabilityService.snapshot = state({ status: 'online', heldInConsult: true, requestedStatus: 'away' });
      component.ngOnInit();
      changes$.next(state({ status: 'online' }));

      component.openPauseQueue();
      dialogResult$.next(10);

      const [, , status, breakEndsAt] = availabilityService.update.calls.mostRecent().args;
      expect(status).toBe('away');
      expect(breakEndsAt instanceof Date).toBeTrue();
      expect(toastr.info).toHaveBeenCalled();
    });

    it('shows an error when the status cannot be changed', () => {
      component.ngOnInit();
      changes$.next(state({ status: 'away' }));
      availabilityService.update.and.returnValue(throwError(new Error('boom')));

      component.setAvailable();

      expect(toastr.error).toHaveBeenCalled();
    });

    it('leaves an already reported error alone', () => {
      component.ngOnInit();
      changes$.next(state({ status: 'away' }));
      availabilityService.update.and.returnValue(throwError('already shown'));

      component.setAvailable();

      expect(toastr.error).not.toHaveBeenCalled();
    });
  });

  describe('break and shift dialogs', () => {
    it('ignores a cancelled break dialog', () => {
      component.openPauseQueue();
      dialogResult$.next(null);

      expect(availabilityService.update).not.toHaveBeenCalled();
    });

    it('ends the shift once confirmed', () => {
      component.openEndShift();
      dialogResult$.next(true);

      const [, , status] = availabilityService.update.calls.mostRecent().args;
      expect(status).toBe('offline');
    });

    it('ignores a cancelled end-shift dialog', () => {
      component.openEndShift();
      dialogResult$.next(false);

      expect(availabilityService.update).not.toHaveBeenCalled();
    });
  });

  describe('break banner', () => {
    it('is shown while a break is running', () => {
      component.ngOnInit();
      changes$.next(state({ status: 'away', breakEndsAt: new Date(Date.now() + 60000) }));

      expect(component.breakBannerVisible).toBeTrue();
    });

    it('is shown when an automatic resume failed', () => {
      component.ngOnInit();
      changes$.next(state({ status: 'away', autoResumeFailed: true }));

      expect(component.breakBannerVisible).toBeTrue();
    });

    it('is hidden while the doctor is online', () => {
      component.ngOnInit();
      changes$.next(state({ status: 'online' }));

      expect(component.breakBannerVisible).toBeFalse();
    });
  });

  describe('row actions', () => {
    const patient = () => ({ visitUuid: 'visit-1', name: 'Asha', status: 'waiting' } as any);

    it('opens the visit summary', () => {
      component.viewSummary(patient());

      expect(router.navigate).toHaveBeenCalledWith(['/dashboard', 'visit-summary', 'visit-1']);
    });

    it('opens the visit summary to start a call', () => {
      component.startCall(patient());

      expect(router.navigate).toHaveBeenCalledWith(['/dashboard', 'visit-summary', 'visit-1']);
    });

    it('goes to the prescription when the call is done', () => {
      const row = patient();
      component.markCallDone(row);
      dialogResult$.next('prescription');

      expect(row.status).toBe('completed');
      expect(router.navigate).toHaveBeenCalledWith(['/dashboard', 'visit-summary', 'visit-1']);
    });

    it('stays on the queue when the doctor picks the queue', () => {
      const row = patient();
      component.markCallDone(row);
      dialogResult$.next('queue');

      expect(row.status).toBe('completed');
      expect(router.navigate).not.toHaveBeenCalled();
    });

    it('leaves the row alone when the done dialog is cancelled', () => {
      const row = patient();
      component.markCallDone(row);
      dialogResult$.next(null);

      expect(row.status).toBe('waiting');
    });

    it('records a call that did not happen', () => {
      const row = patient();
      component.markCallDidNotHappen(row);
      dialogResult$.next('Network Issue');

      expect(row.status).toBe('completed');
      expect(router.navigate).toHaveBeenCalled();
    });

    it('leaves the row alone without a reason', () => {
      const row = patient();
      component.markCallDidNotHappen(row);
      dialogResult$.next(null);

      expect(row.status).toBe('waiting');
    });
  });

  describe('greeting', () => {
    beforeEach(() => jasmine.clock().install());
    afterEach(() => jasmine.clock().uninstall());

    it('greets by the time of day', () => {
      jasmine.clock().mockDate(new Date(2026, 9, 9, 9));
      expect(component.greeting).toBe('Good Morning');

      jasmine.clock().mockDate(new Date(2026, 9, 9, 14));
      expect(component.greeting).toBe('Good Afternoon');

      jasmine.clock().mockDate(new Date(2026, 9, 9, 20));
      expect(component.greeting).toBe('Good Evening');
    });

    it('reads the doctor name from the cached provider', () => {
      expect(component.doctorName).toBe('Dr Who');
    });
  });

  describe('automatic refresh', () => {
    beforeEach(() => jasmine.clock().install());
    afterEach(() => jasmine.clock().uninstall());

    it('re-reads the queue so new assignments appear without a reload', () => {
      component.ngOnInit();
      queueService.getDoctorVisits.calls.reset();

      jasmine.clock().tick(30000);

      expect(queueService.getDoctorVisits).toHaveBeenCalled();
    });

    it('does not refresh while the doctor is away', () => {
      component.ngOnInit();
      changes$.next(state({ status: 'away', breakEndsAt: new Date(Date.now() + 600000) }));
      queueService.getDoctorVisits.calls.reset();

      jasmine.clock().tick(30000);

      expect(queueService.getDoctorVisits).not.toHaveBeenCalled();
    });

    it('stops refreshing once the screen is destroyed', () => {
      component.ngOnInit();
      component.ngOnDestroy();
      queueService.getDoctorVisits.calls.reset();

      jasmine.clock().tick(60000);

      expect(queueService.getDoctorVisits).not.toHaveBeenCalled();
    });
  });
});
