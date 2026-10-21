import { HttpClientTestingModule } from '@angular/common/http/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { TestBed, fakeAsync, tick } from '@angular/core/testing';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { ToastrService } from 'ngx-toastr';
import { NgxRolesService } from 'ngx-permissions';
import { of } from 'rxjs';
import { PageTitleService } from 'src/app/core/page-title/page-title.service';
import { VisitService } from 'src/app/services/visit.service';
import { AppointmentService } from 'src/app/services/appointment.service';
import { DiagnosisService } from 'src/app/services/diagnosis.service';
import { CoreService } from 'src/app/services/core/core.service';
import { EncounterService } from 'src/app/services/encounter.service';
import { LinkService } from 'src/app/services/link.service';
import { TranslationService } from 'src/app/services/translation.service';
import { MindmapService } from 'src/app/services/mindmap.service';
import { AppConfigService } from 'src/app/services/app-config.service';
import { AnalyticsService } from 'src/app/services/analytics.service';
import { WebrtcService } from 'src/app/services/webrtc.service';
import { ProviderService } from 'src/app/services/provider.service';
import { InsightService } from 'src/app/services/insight.service';
import { QueueService } from 'src/app/services/queue.service';
import { VisitSummaryComponent } from './visit-summary.component';
import { VisitSummaryHelperService } from 'src/app/services/visit-summary-helper.service';

/**
 * Covers the "visit already in progress with Dr. X" state of the original visit summary screen.
 * The component has ~20 injected services, so they are stubbed. getVisit() runs for real; the
 * component methods it fans out to are spied out (see COLLABORATORS) because they are covered
 * elsewhere and need unrelated data. Only the visit note doctor name and the banner getter are asserted.
 */
/** Methods getVisit() calls that are unrelated to the in-progress message. */
const COLLABORATORS: (keyof VisitSummaryComponent)[] = [
  'checkVisitStatus', 'getAbhaDetails', 'getPastVisitHistory', 'maybeAutoStartCall',
  'checkIfPatientInteractionPresent', 'checkIfDiagnosisPresent', 'checkIfMedicationPresent',
  'checkIfAdditionalInstructionPresent', 'getAdvicesList', 'checkIfAdvicePresent', 'getTestsList',
  'checkIfTestPresent', 'checkIfReferralPresent', 'checkIfFollowUpPresent', 'checkIfReferralConsentPresent',
  'checkIfPatientCallDurationPresent', 'checkIfCallStatusPresent', 'checkIfDiscussionSummaryPresent',
  'getFrequencyList', 'getAdditionalNote', 'getAppointment', 'getVisitProvider', 'getVitalObs',
  'getCheckUpReason', 'getPhysicalExamination', 'getEyeImages', 'getMedicalHistory',
  'getVisitAdditionalDocs', 'logUserEvent', 'checkOpenChatBoxFlag', 'lazyLoadDDx'
];

describe('VisitSummaryComponent', () => {
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

  const create = (encounters: any[], isMCCUser = false, stopDatetime: string = null): VisitSummaryComponent => {
    const visit = { uuid: 'visit-1', patient: { uuid: 'patient-1' }, encounters, attributes: [], stopDatetime };
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
      stub, appConfigService, rolesService, stub, stub, stub, stub, stub, stub
    );

    COLLABORATORS.forEach((name) => spyOn(component, name));

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

  it('does not show the message once the visit is completed', fakeAsync(() => {
    const component = create([
      visitNote(provider('provider-other', 'Jane Doe')),
      { uuid: 'enc-2', display: 'Visit Complete 14/10/2026', encounterProviders: [] }
    ]);

    loadVisit(component);

    expect(component.visitNoteDoctorName).toBe('Jane Doe');
    expect(component.showVisitInProgressBanner).toBeFalse();
  }));

  it('does not show the message once the patient exit survey is done', fakeAsync(() => {
    const component = create([
      visitNote(provider('provider-other', 'Jane Doe')),
      { uuid: 'enc-3', display: 'Patient Exit Survey 14/10/2026', encounterProviders: [] }
    ]);

    loadVisit(component);

    expect(component.showVisitInProgressBanner).toBeFalse();
  }));

  it('does not show the message once the visit has a stop time', fakeAsync(() => {
    const component = create([visitNote(provider('provider-other', 'Jane Doe'))], false, '2026-10-14T12:00:00.000+0000');

    loadVisit(component);

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

  describe('patient display id (TMH Case Number with OpenMRS ID fallback)', () => {
    const withPatient = (attributes: any[], identifiers: any[]): VisitSummaryComponent => {
      const component: any = create([]);
      component.patient = { person: { attributes }, identifiers };
      return component;
    };
    const tmh = (value: string) => ({ attributeType: { display: 'TMH Case Number' }, value });
    const openMrsId = { identifierType: { display: 'OpenMRS ID' }, identifier: '16RGJ-8' };

    it('shows the TMH Case Number when the patient has one', () => {
      expect(withPatient([tmh('TMH-123')], [openMrsId]).getPatientDisplayId()).toBe('TMH-123');
    });

    it('falls back to the OpenMRS ID instead of "NA" when there is no TMH Case Number', () => {
      expect(withPatient([], [openMrsId]).getPatientDisplayId()).toBe('16RGJ-8');
    });

    it('falls back to the OpenMRS ID when the TMH Case Number is empty', () => {
      expect(withPatient([tmh('')], [openMrsId]).getPatientDisplayId()).toBe('16RGJ-8');
    });

    it('still shows "NA" when the patient has neither ID', () => {
      expect(withPatient([], []).getPatientDisplayId()).toBe('NA');
    });

    it('does not break when an identifier comes back without a type, and prefers the typed OpenMRS ID', () => {
      expect(withPatient([], [{ identifier: 'NO-TYPE' }, openMrsId]).getPatientDisplayId()).toBe('16RGJ-8');
    });

    it('falls back to the first identifier when the server did not return identifier type names', () => {
      const untyped = withPatient([], [{ identifier: 'FIRST-1' }]);

      expect(untyped.getPatientDisplayId()).toBe('FIRST-1');
      expect(untyped.showsOpenMrsIdFallback()).toBeTrue();
    });

    it('flags the OpenMRS ID fallback so the card can label it', () => {
      expect(withPatient([], [openMrsId]).showsOpenMrsIdFallback()).toBeTrue();
      expect(withPatient([tmh('')], [openMrsId]).showsOpenMrsIdFallback()).toBeTrue();
    });

    it('labels the ID by where it came from', () => {
      expect(withPatient([tmh('TMH-123')], [openMrsId]).getPatientDisplayIdLabel()).toBe('TMH Case Number');
      expect(withPatient([], [openMrsId]).getPatientDisplayIdLabel()).toBe('OpenMRS ID');
      expect(withPatient([], []).getPatientDisplayIdLabel()).toBe('TMH Case Number');
    });

    it('does not flag a fallback when the TMH Case Number is shown, or when there is no OpenMRS ID either', () => {
      expect(withPatient([tmh('TMH-123')], [openMrsId]).showsOpenMrsIdFallback()).toBeFalse();
      expect(withPatient([], []).showsOpenMrsIdFallback()).toBeFalse();
    });
  });
});

describe('VisitSummaryComponent - patient ID in the rendered header', () => {
  const tmh = (value: string) => ({ attributeType: { display: 'TMH Case Number' }, value });
  const openMrsId = { identifierType: { display: 'OpenMRS ID' }, identifier: '16RGJ-8' };

  const render = (attributes: any[], identifiers: any[], tnmStaging: boolean) => {
    const stub = {};
    TestBed.configureTestingModule({
      declarations: [VisitSummaryComponent],
      imports: [HttpClientTestingModule, TranslateModule.forRoot()],
      providers: [
        { provide: PageTitleService, useValue: stub },
        { provide: ActivatedRoute, useValue: { snapshot: { paramMap: { get: () => 'visit-1' }, queryParamMap: { get: () => null } } } },
        { provide: Router, useValue: { getCurrentNavigation: () => null } },
        { provide: VisitService, useValue: stub },
        { provide: AppointmentService, useValue: stub },
        { provide: DiagnosisService, useValue: stub },
        { provide: ToastrService, useValue: stub },
        { provide: CoreService, useValue: stub },
        { provide: EncounterService, useValue: stub },
        { provide: LinkService, useValue: stub },
        { provide: TranslationService, useValue: stub },
        { provide: MindmapService, useValue: stub },
        {
          provide: AppConfigService,
          useValue: {
            patient_registration: {}, patient_vitals: [], patient_diagnostics_section: false, digital_stethoscope_section: false,
            specialization: [], patient_visit_summary: {}, patient_visit_sections: []
          }
        },
        { provide: NgxRolesService, useValue: { getRole: () => null } },
        { provide: AnalyticsService, useValue: stub },
        { provide: WebrtcService, useValue: stub },
        { provide: ProviderService, useValue: stub },
        { provide: InsightService, useValue: stub },
        { provide: QueueService, useValue: stub }
      ],
      schemas: [NO_ERRORS_SCHEMA]
    });
    TestBed.inject(TranslateService).setTranslation('en', { 'OpenMRS ID': 'OpenMRS ID', 'TMH Case Number': 'TMH Case Number' });
    TestBed.inject(TranslateService).use('en');
    // The page's own startup (data loading) is out of scope here; only the patient card is rendered.
    spyOn(VisitSummaryComponent.prototype, 'ngOnInit');
    spyOn(VisitSummaryComponent.prototype, 'ngAfterViewInit');

    const fixture = TestBed.createComponent(VisitSummaryComponent);
    const component = fixture.componentInstance;
    component.isTurnServer = false;
    spyOn(component, 'isFeatureAvailable').and.callFake((name: string) => name === 'tnmStaging' && tnmStaging);
    component.patient = { person: { attributes, preferredName: {} }, identifiers } as any;
    fixture.detectChanges();

    const text = (selector: string) => fixture.nativeElement.querySelector(selector)?.textContent.trim() ?? null;
    return {
      id: text('[data-test-id="etPatienOpenMRSId"]'),
      label: text('[data-test-id="etPatientIdLabel"]')
    };
  };

  it('shows the TMH Case Number with a "TMH Case Number:" label when the patient has one', () => {
    expect(render([tmh('TMH-123')], [openMrsId], true)).toEqual({ id: 'TMH Case Number: TMH-123', label: 'TMH Case Number:' });
  });

  it('keeps the "TMH Case Number:" label, with "NA", when the patient has no ID at all', () => {
    expect(render([], [], true)).toEqual({ id: 'TMH Case Number: NA', label: 'TMH Case Number:' });
  });

  it('shows the OpenMRS ID with an "OpenMRS ID:" label instead of "NA" when there is no TMH Case Number', () => {
    const shown = render([], [openMrsId], true);

    expect(shown.id).toBe('OpenMRS ID: 16RGJ-8');
    expect(shown.label).toBe('OpenMRS ID:');
  });

  it('shows the plain OpenMRS ID, with no label, when tnmStaging is off', () => {
    expect(render([], [openMrsId], false)).toEqual({ id: '16RGJ-8', label: null });
  });
});
