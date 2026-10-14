import { fakeAsync, tick } from '@angular/core/testing';
import { of } from 'rxjs';
import { VisitSummaryComponent } from './visit-summary.component';
import { VisitSummaryHelperService } from 'src/app/services/visit-summary-helper.service';

/**
 * Covers the "visit already in progress with Dr. X" state of the original visit summary screen.
 * The component has ~20 injected services, so they are stubbed and every method other than
 * getVisit() is spied out; only getVisit() and the banner getter run for real.
 */
describe('VisitSummaryComponent - in-progress visit message', () => {
  const ME = 'provider-me';

  const visitNote = (...providers: any[]) => ({
    uuid: 'note-1',
    display: 'Visit Note 14/10/2026',
    encounterDatetime: '2026-10-14T10:00:00.000+0000',
    encounterProviders: providers
  });

  const provider = (uuid: string, name: string) => ({
    display: `${name}: Doctor`,
    provider: { uuid, person: { display: name } }
  });

  const create = (encounters: any[], isMCCUser = false): VisitSummaryComponent => {
    const visit = { uuid: 'visit-1', patient: { uuid: 'patient-1' }, encounters, attributes: [] };
    const visitService: any = {
      fetchVisitDetails: jasmine.createSpy('fetchVisitDetails').and.returnValue(of(visit)),
      patientInfo: jasmine.createSpy('patientInfo').and.returnValue(of({ uuid: 'patient-1' })),
      getDemarcation: jasmine.createSpy('getDemarcation').and.returnValue('')
    };
    const appConfigService: any = {
      patient_registration: {},
      patient_vitals: [],
      patient_diagnostics_section: false,
      digital_stethoscope_section: false,
      specialization: [],
      patient_visit_summary: {},
      patient_visit_sections: [],
      abha_section: false
    };
    const router: any = { getCurrentNavigation: () => null };
    const stub: any = {};
    const rolesService: any = { getRole: () => (isMCCUser ? { name: 'ORGANIZATIONAL:MCC' } : null) };
    const component: any = new VisitSummaryComponent(
      stub, stub, router, visitService, stub, stub, stub, stub, stub, stub, stub, stub,
      new VisitSummaryHelperService({} as any, {} as any, {} as any),
      stub, appConfigService, rolesService, stub, stub, stub, stub, stub
    );

    // Stub every method (not getters) except getVisit, which is the code under test.
    Object.getOwnPropertyNames(VisitSummaryComponent.prototype).forEach((name) => {
      const descriptor = Object.getOwnPropertyDescriptor(VisitSummaryComponent.prototype, name);
      if (name !== 'constructor' && name !== 'getVisit' && typeof descriptor.value === 'function') {
        spyOn(component, name);
      }
    });

    component.provider = { uuid: ME };
    return component;
  };

  const loadVisit = (component: VisitSummaryComponent) => {
    component.getVisit('visit-1');
    tick(2000);
  };

  it('names the doctor on the visit note and shows the message to a different doctor', fakeAsync(() => {
    const component = create([visitNote(provider('provider-other', 'Dr. Jane Doe'))]);

    loadVisit(component);

    expect(component.visitNoteDoctorName).toBe('Jane Doe');
    expect(component.isVisitNoteProvider).toBeFalse();
    expect(component.showVisitInProgressBanner).toBeTrue();
  }));

  it('does not show the message to the doctor who started the visit note', fakeAsync(() => {
    const component = create([visitNote(provider(ME, 'Jane Doe'))]);

    loadVisit(component);

    expect(component.visitNoteDoctorName).toBe('Jane Doe');
    expect(component.isVisitNoteProvider).toBeTrue();
    expect(component.showVisitInProgressBanner).toBeFalse();
  }));

  it('does not show the message when there is no visit note', fakeAsync(() => {
    const component = create([]);
    component.visitNoteDoctorName = 'Stale Name';

    loadVisit(component);

    expect(component.visitNoteDoctorName).toBe('');
    expect(component.showVisitInProgressBanner).toBeFalse();
  }));

  it('does not show the message to MCC users', fakeAsync(() => {
    const component = create([visitNote(provider('provider-other', 'Jane Doe'))], true);

    loadVisit(component);

    expect(component.visitNoteDoctorName).toBe('Jane Doe');
    expect(component.showVisitInProgressBanner).toBeFalse();
  }));

  it('does not show the message when the visit note provider cannot be named', fakeAsync(() => {
    const component = create([visitNote({ provider: { uuid: 'provider-other' } })]);

    loadVisit(component);

    expect(component.visitNoteDoctorName).toBe('');
    expect(component.showVisitInProgressBanner).toBeFalse();
  }));
});
