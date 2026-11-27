import { HttpClient } from '@angular/common/http';
import { of, throwError } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';
import { VisitSummaryHelperService } from 'src/app/services/visit-summary-helper.service';
import { VisitSummaryV2Service, CurrentVisitData } from './visit-summary-v2.service';

describe('VisitSummaryV2Service - visit note doctor', () => {
  const visitNote = (encounterProviders: any[]) => ({
    uuid: 'note-1',
    display: 'Visit Note 14/10/2026',
    encounterType: { display: 'Visit Note' },
    obs: [],
    encounterProviders
  });

  const buildService = (encounters: any[]) => {
    const visit = { uuid: 'visit-1', patient: { uuid: 'patient-1' }, encounters };
    const visitService: any = {
      fetchVisitDetails: jasmine.createSpy('fetchVisitDetails').and.returnValue(of(visit)),
      patientInfo: jasmine.createSpy('patientInfo').and.returnValue(of({ person: {}, identifiers: [] }))
    };
    const diagnosisService: any = { getObs: jasmine.createSpy('getObs').and.returnValue(of({ results: [] })) };
    const appointmentService: any = { getAppointment: jasmine.createSpy('getAppointment').and.returnValue(of(null)) };
    const appConfigService: any = { patient_vitals: [] };
    const helper = new VisitSummaryHelperService({} as HttpClient, visitService, {} as TranslateService);

    return new VisitSummaryV2Service(
      visitService, diagnosisService, appointmentService, {} as any, {} as any,
      helper, appConfigService, {} as any, {} as any, {} as any, {} as any, {} as any, {} as any
    );
  };

  const load = (encounters: any[]): CurrentVisitData => {
    let data: CurrentVisitData;
    buildService(encounters).loadCurrentVisit('visit-1').subscribe((d) => (data = d));
    return data;
  };

  it('exposes the name of the doctor on the visit note without a leading "Dr."', () => {
    const data = load([
      visitNote([{ display: 'Jane Doe: Doctor', provider: { uuid: 'doc-1', person: { display: 'Dr. Jane Doe' } } }])
    ]);

    expect(data.visitNoteExists).toBeTrue();
    expect(data.visitNoteProviderUuids).toEqual(['doc-1']);
    expect(data.visitNoteDoctorName).toBe('Jane Doe');
  });

  it('falls back to the encounter provider label when the person name is missing', () => {
    const data = load([visitNote([{ display: 'Jane Doe: Doctor', provider: { uuid: 'doc-1' } }])]);

    expect(data.visitNoteDoctorName).toBe('Jane Doe');
  });

  it('has no doctor name when the visit has no visit note', () => {
    const data = load([]);

    expect(data.visitNoteExists).toBeFalse();
    expect(data.visitNoteProviderUuids).toEqual([]);
    expect(data.visitNoteDoctorName).toBe('');
  });

  it('flags a visit as completed only when a Visit Complete encounter exists', () => {
    const completeEncounter = { uuid: 'enc-2', display: 'Visit Complete 14/10/2026', encounterType: { display: 'Visit Complete' }, obs: [], encounterProviders: [] };

    expect(load([visitNote([])]).visitCompleted).toBeFalse();
    expect(load([visitNote([]), completeEncounter]).visitCompleted).toBeTrue();
  });

  it('only reads the visit note provider, not other encounters', () => {
    const nurseEncounter = {
      uuid: 'enc-1',
      display: 'Vitals 14/10/2026',
      encounterType: { display: 'Vitals' },
      obs: [],
      encounterProviders: [{ display: 'Nurse Joy: Nurse', provider: { uuid: 'nurse-1', person: { display: 'Nurse Joy' } } }]
    };
    const data = load([nurseEncounter, visitNote([{ provider: { uuid: 'doc-1', person: { display: 'Jane Doe' } } }])]);

    expect(data.visitNoteDoctorName).toBe('Jane Doe');
  });
});

describe('VisitSummaryV2Service - Kaleyra call', () => {
  const visit: any = { uuid: 'visit-1', patient: { uuid: 'patient-1' }, location: { display: 'Clinic' } };
  let providerService: any;
  let toastr: any;
  let service: VisitSummaryV2Service;
  let started: any[];

  beforeEach(() => {
    localStorage.setItem('provider', JSON.stringify({ uuid: 'doc-1', attributes: [{ display: 'phoneNumber: 9999999999', value: '9999999999' }] }));
    localStorage.setItem('patientVisitProvider', JSON.stringify({ provider: { uuid: 'chw-1' } }));
    providerService = { kaleyraClick2Call: jasmine.createSpy('kaleyraClick2Call').and.returnValue(of({})) };
    toastr = jasmine.createSpyObj('ToastrService', ['success', 'error', 'info']);
    const helper: any = { userId: 'user-1' };
    service = new VisitSummaryV2Service(
      {} as any, {} as any, {} as any, {} as any, {} as any,
      helper, {} as any, {} as any, {} as any, providerService, {} as any, toastr, { logEvent: () => {} } as any
    );
    started = [];
    service.kaleyraCallStarted$.subscribe(call => started.push(call));
  });

  afterEach(() => {
    localStorage.removeItem('provider');
    localStorage.removeItem('patientVisitProvider');
  });

  it('announces the started call so the recorder can open', () => {
    service.startKaleyraCall(visit, '8888888888');

    expect(providerService.kaleyraClick2Call).toHaveBeenCalledWith('9999999999', '8888888888', 'doc-1:patient-1', '0', 'visit-1:chw-1');
    expect(started).toEqual([{ visitUuid: 'visit-1', patientUuid: 'patient-1', doctorUuid: 'doc-1', chwUuid: 'chw-1' }]);
  });

  it('does not announce a call that failed to start', () => {
    providerService.kaleyraClick2Call.and.returnValue(throwError(() => new Error('down')));

    service.startKaleyraCall(visit, '8888888888');

    expect(started).toEqual([]);
    expect(toastr.error).toHaveBeenCalled();
  });
});
