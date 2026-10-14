import { of } from 'rxjs';
import { VisitSummaryV2Component } from './visit-summary-v2.component';
import { VisitSummaryHelperService } from 'src/app/services/visit-summary-helper.service';
import { doctorDetails } from 'src/config/constant';

describe('VisitSummaryV2Component - in-progress visit message', () => {
  const ME = 'provider-me';

  const visitData = (overrides: any = {}) => ({
    visit: { encounters: [] },
    visitNoteExists: true,
    visitNoteUuid: 'note-1',
    patientUuid: 'patient-1',
    specializations: [],
    patient: {},
    patientModel: {},
    clinicName: '',
    visitEnded: false,
    visitNoteProviderUuids: ['provider-other'],
    visitNoteDoctorName: 'Jane Doe',
    consultationDetails: [],
    chiefComplaints: [],
    complaintDetails: [],
    associatedSymptoms: [],
    patientHistory: [],
    familyHistory: [],
    vitals: [],
    generalExams: [],
    abdomenFindings: [],
    eyeImages: [],
    documents: [],
    ...overrides
  });

  const create = (data: any, mccRole: any = null): VisitSummaryV2Component => {
    const v2Service: any = {
      loadCurrentVisit: jasmine.createSpy('loadCurrentVisit').and.returnValue(of(data)),
      loadPastVisits: jasmine.createSpy('loadPastVisits').and.returnValue(of([]))
    };
    const route: any = { snapshot: { paramMap: { get: () => 'visit-1' } } };
    const router: any = { getCurrentNavigation: () => null };
    const rolesService: any = { getRole: jasmine.createSpy('getRole').and.returnValue(mccRole) };
    const helper = new VisitSummaryHelperService({} as any, {} as any, {} as any);

    const component = new VisitSummaryV2Component(
      route, router, {} as any, v2Service, {} as any, {} as any, helper, {} as any, rolesService
    );
    component.ngOnInit();
    return component;
  };

  beforeEach(() => {
    localStorage.setItem(doctorDetails.PROVIDER, JSON.stringify({ uuid: ME }));
  });

  afterEach(() => {
    localStorage.removeItem(doctorDetails.PROVIDER);
  });

  it('shows the message, with the doctor name, when another doctor owns the visit note', () => {
    const component = create(visitData());

    expect(component.visitNoteDoctorName).toBe('Jane Doe');
    expect(component.isVisitNoteProvider).toBeFalse();
    expect(component.showVisitInProgressBanner).toBeTrue();
  });

  it('does not show the message to the doctor who started the visit note', () => {
    const component = create(visitData({ visitNoteProviderUuids: [ME] }));

    expect(component.isVisitNoteProvider).toBeTrue();
    expect(component.showVisitInProgressBanner).toBeFalse();
  });

  it('does not show the message when there is no visit note yet', () => {
    const component = create(visitData({ visitNoteExists: false, visitNoteProviderUuids: [], visitNoteDoctorName: '' }));

    expect(component.showVisitInProgressBanner).toBeFalse();
  });

  it('does not show the message when the doctor name is unknown', () => {
    const component = create(visitData({ visitNoteDoctorName: '' }));

    expect(component.showVisitInProgressBanner).toBeFalse();
  });

  it('does not show the message to MCC users, and checks the MCC role only once on init', () => {
    const component = create(visitData(), { name: 'ORGANIZATIONAL:MCC' });

    expect(component.isMCCUser).toBeTrue();
    expect(component.showVisitInProgressBanner).toBeFalse();
    expect(component.showVisitInProgressBanner).toBeFalse();
    expect(component.showVisitInProgressBanner).toBeFalse();
    expect((component as any).rolesService.getRole).toHaveBeenCalledTimes(1);
    expect((component as any).rolesService.getRole).toHaveBeenCalledWith('ORGANIZATIONAL:MCC');
  });

  it('treats a missing cached provider as not being the visit note provider', () => {
    localStorage.removeItem(doctorDetails.PROVIDER);
    const component = create(visitData({ visitNoteProviderUuids: [ME] }));

    expect(component.isVisitNoteProvider).toBeFalse();
    expect(component.showVisitInProgressBanner).toBeTrue();
  });
});
