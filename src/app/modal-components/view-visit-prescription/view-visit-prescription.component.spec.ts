import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import * as pdfMake from 'pdfmake/build/pdfmake';
import { NEVER, of } from 'rxjs';
import { AppConfigService } from 'src/app/services/app-config.service';
import { DiagnosisService } from 'src/app/services/diagnosis.service';
import { ProfileService } from 'src/app/services/profile.service';
import { VisitService } from 'src/app/services/visit.service';
import { getPatientDisplayId } from 'src/app/utils/utility-functions';
import { ViewVisitPrescriptionComponent } from './view-visit-prescription.component';

const NOT_AVAILABLE = 'उपलब्ध नहीं';
const tmh = (value: string) => ({ attributeType: { display: 'TMH Case Number' }, value });
const openMrsId = { identifierType: { display: 'OpenMRS ID' }, identifier: '16RGJ-8' };

describe('ViewVisitPrescriptionComponent - patient display id', () => {
  const load = (patient: any): ViewVisitPrescriptionComponent => {
    const appConfigService: any = {
      patient_registration: { personal: [], address: [], other: [] },
      patient_vitals: [],
      patient_visit_sections: []
    };
    const translateService: any = { instant: (key: string) => (key === 'NA' ? NOT_AVAILABLE : key) };
    const visit = { uuid: 'visit-1', patient: { uuid: 'patient-1' }, location: { display: 'Clinic' }, encounters: [] };
    const visitService: any = {
      fetchVisitDetails: () => of(visit),
      patientInfo: () => of(patient)
    };
    const stub: any = {};
    const component = new ViewVisitPrescriptionComponent(stub, stub, visitService, stub, stub, translateService, appConfigService, stub);
    // The rest of the visit is parsed elsewhere; only the patient part of getVisit() matters here.
    ['checkVisitStatus', 'getVisitProvider', 'getCheckUpReason', 'getVitalObs'].forEach((name) => spyOn(component, name as any));
    component.getVisit('visit-1');
    return component;
  };

  it('stores the TMH Case Number as the display id when the patient loads', () => {
    const component = load({ person: { attributes: [tmh('TMH-123')] }, identifiers: [openMrsId] });

    expect(component.patientDisplayId).toEqual({ id: 'TMH-123', label: 'TMH Case Number' });
  });

  it('stores the OpenMRS ID instead of "NA" when there is no TMH Case Number', () => {
    const component = load({ person: { attributes: [] }, identifiers: [openMrsId] });

    expect(component.patientDisplayId).toEqual({ id: '16RGJ-8', label: 'OpenMRS ID' });
  });

  it('stores an empty id when the patient has neither ID, so the screen can show a translated "NA"', () => {
    const component = load({ person: { attributes: [] }, identifiers: [] });

    expect(component.patientDisplayId).toEqual({ id: '', label: 'TMH Case Number' });
  });

  it('does not break when an attribute or identifier comes back without a type', () => {
    const component = load({ person: { attributes: [{ value: 'orphan' }, tmh('TMH-123')] }, identifiers: [{ identifier: 'UNTYPED-1' }] });

    expect(component.patientDisplayId.id).toBe('TMH-123');
    expect(component.getPersonAttributeValue('TMH Case Number')).toBe('TMH-123');
    expect(component.getPersonAttributeValue('Telephone Number')).toBe(NOT_AVAILABLE);
    expect(component.getPatientIdentifier('OpenMRS ID')).toBe('');
  });

  describe('prescription PDF "Patient ID"', () => {
    const pdfPatientId = async (patient: any): Promise<string> => {
      const component = load(patient);
      const captured: any[] = [];
      spyOn(pdfMake, 'createPdf').and.callFake((definition: any) => {
        captured.push(definition);
        return { download: () => undefined } as any;
      });
      spyOn(component, 'toObjectUrl' as any).and.returnValue(Promise.resolve(''));
      (component as any).consultedDoctor = { attributes: [{ attributeType: { display: 'signature' }, value: '' }] };
      component.pvsConfigs = [];
      await component.downloadPrescription();
      const text = JSON.stringify(captured[0]);
      return /"Patient ID:","bold":true\},"([^"]*)"/.exec(text)?.[1]?.trim();
    };

    it('prints the TMH Case Number', async () => {
      expect(await pdfPatientId({ person: { attributes: [tmh('TMH-123')] }, identifiers: [openMrsId] })).toBe('TMH-123');
    });

    it('prints the OpenMRS ID when there is no TMH Case Number', async () => {
      expect(await pdfPatientId({ person: { attributes: [] }, identifiers: [openMrsId] })).toBe('16RGJ-8');
    });

    it('prints plain "NA", not the translated text, when there is no ID, because the PDF font cannot draw Devanagari', async () => {
      expect(await pdfPatientId({ person: { attributes: [] }, identifiers: [] })).toBe('NA');
    });
  });
});

describe('ViewVisitPrescriptionComponent - patient ID in the rendered header', () => {
  let fixture: ComponentFixture<ViewVisitPrescriptionComponent>;
  let translate: TranslateService;

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
    translate = TestBed.inject(TranslateService);
    translate.setTranslation('en', { 'OpenMRS ID': 'OpenMRS ID', 'TMH Case Number': 'TMH Case Number' });
    translate.setTranslation('hi', { 'TMH Case Number': 'टीएमएच केस नंबर', NA: NOT_AVAILABLE });
    translate.use('en');

    fixture = TestBed.createComponent(ViewVisitPrescriptionComponent);
    const component = fixture.componentInstance;
    spyOn(component, 'isFeatureAvailable').and.callFake((name: string) => name === 'tnmStaging' && tnmStaging);
    component.patient = { person: { attributes, preferredName: {} }, identifiers } as any;
    component.patientDisplayId = getPatientDisplayId(component.patient);
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

  it('shows "NA" in the page language, and follows a language switch, when the patient has no ID', () => {
    expect(render([], [], true).id).toBe('TMH Case Number: NA');

    translate.use('hi');
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('[data-test-id="etPatienOpenMRSId"]').textContent.trim())
      .toBe(`टीएमएच केस नंबर: ${NOT_AVAILABLE}`);
  });

  it('shows the plain OpenMRS ID, with no label, when tnmStaging is off', () => {
    expect(render([], [openMrsId], false)).toEqual({ id: '16RGJ-8', label: null });
  });
});
