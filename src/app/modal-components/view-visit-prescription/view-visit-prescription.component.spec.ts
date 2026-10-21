import { NO_ERRORS_SCHEMA } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { NEVER } from 'rxjs';
import { AppConfigService } from 'src/app/services/app-config.service';
import { DiagnosisService } from 'src/app/services/diagnosis.service';
import { ProfileService } from 'src/app/services/profile.service';
import { VisitService } from 'src/app/services/visit.service';
import { ViewVisitPrescriptionComponent } from './view-visit-prescription.component';

const NOT_AVAILABLE = 'लागू नहीं';
const tmh = (value: string) => ({ attributeType: { display: 'TMH Case Number' }, value });
const openMrsId = { identifierType: { display: 'OpenMRS ID' }, identifier: '16RGJ-8' };

describe('ViewVisitPrescriptionComponent - patient display id', () => {
  const create = (attributes: any[], identifiers: any[]): ViewVisitPrescriptionComponent => {
    const appConfigService: any = {
      patient_registration: {},
      patient_vitals: [],
      patient_visit_sections: []
    };
    const translateService: any = { instant: (key: string) => (key === 'NA' ? NOT_AVAILABLE : key) };
    const stub: any = {};
    const component = new ViewVisitPrescriptionComponent(stub, stub, stub, stub, stub, translateService, appConfigService, stub);
    component.patient = { person: { attributes }, identifiers } as any;
    return component;
  };

  it('shows the TMH Case Number when the patient has one', () => {
    expect(create([tmh('TMH-123')], [openMrsId]).getPatientDisplayId()).toBe('TMH-123');
  });

  it('falls back to the OpenMRS ID when there is no TMH Case Number, even though "NA" is translated', () => {
    expect(create([], [openMrsId]).getPatientDisplayId()).toBe('16RGJ-8');
  });

  it('falls back to the OpenMRS ID when the TMH Case Number is empty', () => {
    expect(create([tmh('')], [openMrsId]).getPatientDisplayId()).toBe('16RGJ-8');
  });

  it('falls back to the first identifier when the server did not return identifier type names', () => {
    expect(create([], [{ identifier: 'FIRST-1' }]).getPatientDisplayId()).toBe('FIRST-1');
  });

  it('shows the translated "not available" text when the patient has no ID at all', () => {
    expect(create([], []).getPatientDisplayId()).toBe(NOT_AVAILABLE);
  });

  it('labels the ID by where it came from', () => {
    expect(create([tmh('TMH-123')], [openMrsId]).getPatientDisplayIdLabel()).toBe('TMH Case Number');
    expect(create([], [openMrsId]).getPatientDisplayIdLabel()).toBe('OpenMRS ID');
    expect(create([], []).getPatientDisplayIdLabel()).toBe('TMH Case Number');
  });

  it('flags the OpenMRS ID fallback only when it is the ID being shown', () => {
    expect(create([], [openMrsId]).showsOpenMrsIdFallback()).toBeTrue();
    expect(create([tmh('TMH-123')], [openMrsId]).showsOpenMrsIdFallback()).toBeFalse();
    expect(create([], []).showsOpenMrsIdFallback()).toBeFalse();
  });
});

describe('ViewVisitPrescriptionComponent - patient ID in the rendered header', () => {
  const render = (attributes: any[], identifiers: any[], tnmStaging: boolean) => {
    TestBed.configureTestingModule({
      declarations: [ViewVisitPrescriptionComponent],
      imports: [TranslateModule.forRoot()],
      providers: [
        { provide: MAT_DIALOG_DATA, useValue: { uuid: 'visit-1' } },
        { provide: MatDialogRef, useValue: {} },
        { provide: VisitService, useValue: { fetchVisitDetails: () => NEVER } },
        { provide: ProfileService, useValue: {} },
        { provide: DiagnosisService, useValue: {} },
        {
          provide: AppConfigService,
          useValue: { patient_registration: {}, patient_vitals: [], patient_visit_sections: [], theme_config: [] }
        }
      ],
      schemas: [NO_ERRORS_SCHEMA]
    });
    TestBed.inject(TranslateService).setTranslation('en', { 'OpenMRS ID': 'OpenMRS ID', 'TMH Case Number': 'TMH Case Number' });
    TestBed.inject(TranslateService).use('en');

    const fixture = TestBed.createComponent(ViewVisitPrescriptionComponent);
    const component = fixture.componentInstance;
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
