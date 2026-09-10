import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { TranslateModule } from '@ngx-translate/core';
import { NO_ERRORS_SCHEMA } from '@angular/core';

import { SharePrescriptionComponent } from './share-prescription.component';

describe('SharePrescriptionComponent', () => {
  let component: SharePrescriptionComponent;
  let fixture: ComponentFixture<SharePrescriptionComponent>;

  function configure(dialogData: any) {
    return TestBed.configureTestingModule({
      declarations: [ SharePrescriptionComponent ],
      imports: [ TranslateModule.forRoot() ],
      schemas: [ NO_ERRORS_SCHEMA ],
      providers: [
        { provide: MAT_DIALOG_DATA, useValue: dialogData },
        { provide: MatDialogRef, useValue: { close: jasmine.createSpy('close') } },
      ],
    }).compileComponents();
  }

  it('should create', async () => {
    await configure({});
    fixture = TestBed.createComponent(SharePrescriptionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  describe('namcoReferral', () => {
    it('is null when the dialog data has no namcoReferral', async () => {
      await configure({});
      fixture = TestBed.createComponent(SharePrescriptionComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();

      expect(component.namcoReferral).toBeNull();
    });

    it('is populated from dialog data when a confirmed NAMCO referral is passed in', async () => {
      const namcoReferral = { speciality: 'Namco _ Dermatology', facility: 'NAMCO Hospital', priority: 'Elective', reason: 'Skin rash' };
      await configure({ namcoReferral });
      fixture = TestBed.createComponent(SharePrescriptionComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();

      expect(component.namcoReferral).toEqual(namcoReferral);
    });

    it('namcoReferralSpecialty strips the "Namco" prefix regardless of separator style', async () => {
      await configure({ namcoReferral: { speciality: 'Namco _ Dermatology', facility: 'NAMCO Hospital' } });
      fixture = TestBed.createComponent(SharePrescriptionComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();
      expect(component.namcoReferralSpecialty).toBe('Dermatology');
    });

    it('namcoReferralSpecialty handles the underscore-only separator style too', async () => {
      await configure({ namcoReferral: { speciality: 'Namco_Orthopaedic', facility: 'NAMCO Hospital' } });
      fixture = TestBed.createComponent(SharePrescriptionComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();
      expect(component.namcoReferralSpecialty).toBe('Orthopaedic');
    });

    it('namcoReferralSpecialty is an empty string when there is no referral at all', async () => {
      await configure({});
      fixture = TestBed.createComponent(SharePrescriptionComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();
      expect(component.namcoReferralSpecialty).toBe('');
    });
  });
});
