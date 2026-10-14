import { HttpClient } from '@angular/common/http';
import { of } from 'rxjs';
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
      helper, appConfigService, {} as any, {} as any
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
