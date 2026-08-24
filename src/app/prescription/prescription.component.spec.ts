import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { NgbNavModule } from '@ng-bootstrap/ng-bootstrap';
import { TranslateModule } from '@ngx-translate/core';

import { PrescriptionComponent } from './prescription.component';

describe('PrescriptionComponent', () => {
  let component: PrescriptionComponent;
  let fixture: ComponentFixture<PrescriptionComponent>;
  let httpMock: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PrescriptionComponent ],
      imports: [ HttpClientTestingModule, NgbNavModule, TranslateModule.forRoot() ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PrescriptionComponent);
    component = fixture.componentInstance;
    httpMock = TestBed.inject(HttpTestingController);
  });

  it('should create', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  describe('Referred Visits', () => {

    function triggerInitAndRespondToReferred(referredResponse: any) {
      fixture.detectChanges(); // ngOnInit() -> fires getPrescriptionSentVisits/getCompletedVisits/getReferredVisits

      httpMock.expectOne(req => req.url.includes('/openmrs/getCompletedVisits'))
        .flush({ success: true, totalCount: 0, data: [] });
      httpMock.expectOne(req => req.url.includes('/openmrs/getEndedVisits'))
        .flush({ success: true, totalCount: 0, data: [] });
      httpMock.expectOne(req => req.url.includes('/openmrs/getReferredVisits'))
        .flush(referredResponse);
    }

    it('populates referredVisits/referredVisitsCount from a visit with a Routing Specialization attribute', () => {
      // A real referral always requires an existing Visit Note (see
      // createReferralEncounterForNamco() in visit-summary.component.ts), so a realistic
      // referred-visit fixture includes one.
      const referredVisit = {
        uuid: 'visit-uuid-1',
        encounters: [
          { encounter_datetime: '2026-08-19T10:00:00.000Z', obs: [], type: { name: 'ADULTINITIAL' } },
          { encounter_datetime: '2026-08-19T10:30:00.000Z', obs: [], type: { name: 'Visit Note' } },
          { encounter_datetime: '2026-08-19T11:00:00.000Z', obs: [], type: { name: 'Referral' } }
        ],
        attributes: [
          { value_reference: 'Namco _ Dermatology', attribute_type: { name: 'Routing Specialization' } }
        ],
        location: { name: 'Test Clinic' },
        patient_name: { given_name: 'John', family_name: 'Doe' },
        person: { birthdate: '2000-01-01', gender: 'M', uuid: 'p-uuid' }
      };

      triggerInitAndRespondToReferred({ success: true, totalCount: 1, data: [referredVisit] });

      expect(component.referredVisitsCount).toBe(1);
      expect(component.referredVisits.length).toBe(1);
      expect(component.referredVisits[0].routing_specialization).toBe('Namco _ Dermatology');
      expect(component.referredVisits[0].status).toBe('Referred');
      expect(component.loaded3).toBeTrue();
    });

    it('leaves referredVisits empty when the backend returns no referred visits', () => {
      triggerInitAndRespondToReferred({ success: true, totalCount: 0, data: [] });

      expect(component.referredVisitsCount).toBe(0);
      expect(component.referredVisits.length).toBe(0);
    });

    it('getReferredVisitStatus always returns "Referred", regardless of the visit\'s own encounter stage', () => {
      const inProgress: any = { encounters: [{ type: { name: 'ADULTINITIAL' } }, { type: { name: 'Visit Note' } }] };
      const waiting: any = { encounters: [{ type: { name: 'ADULTINITIAL' } }] };
      const completed: any = { encounters: [{ type: { name: 'Visit Note' } }, { type: { name: 'Visit Complete' } }] };

      expect(component.getReferredVisitStatus(inProgress)).toBe('Referred');
      expect(component.getReferredVisitStatus(waiting)).toBe('Referred');
      expect(component.getReferredVisitStatus(completed)).toBe('Referred');
    });

    it('getRoutingSpecialization returns empty string for a visit with no Routing Specialization attribute', () => {
      const visit: any = { attributes: [{ value_reference: 'General Physician', attribute_type: { name: 'Visit Speciality' } }] };
      expect(component.getRoutingSpecialization(visit)).toBe('');
    });

    it('getRoutingSpecialization returns empty string when the visit has no attributes at all', () => {
      const visit: any = {};
      expect(component.getRoutingSpecialization(visit)).toBe('');
    });

    it('applyReferredSearch filters referredVisits by patient name', () => {
      component.allReferredVisits = [
        { patient_name: { given_name: 'Alice', family_name: 'Smith' } },
        { patient_name: { given_name: 'Bob', family_name: 'Jones' } }
      ];
      component.searchTermRef = 'alice';

      component.applyReferredSearch();

      expect(component.referredVisits.length).toBe(1);
      expect(component.referredVisits[0].patient_name.given_name).toBe('Alice');
    });

    it('applyReferredSearch restores the full list when the search term is cleared', () => {
      component.allReferredVisits = [
        { patient_name: { given_name: 'Alice', family_name: 'Smith' } },
        { patient_name: { given_name: 'Bob', family_name: 'Jones' } }
      ];
      component.searchTermRef = '';

      component.applyReferredSearch();

      expect(component.referredVisits.length).toBe(2);
    });

    it('getReferredVisitsData requests the given page from the Referred Visits endpoint', () => {
      triggerInitAndRespondToReferred({ success: true, totalCount: 0, data: [] });

      component.getReferredVisitsData({ page: 2, pageSize: 10 });

      const req = httpMock.expectOne(req => req.url.includes('/openmrs/getReferredVisits') && req.url.includes('page=2'));
      expect(req.request.method).toBe('GET');
      req.flush({ success: true, totalCount: 0, data: [] });
    });
  });
});
