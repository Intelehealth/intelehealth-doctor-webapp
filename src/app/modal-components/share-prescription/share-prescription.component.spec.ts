import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SharePrescriptionComponent } from './share-prescription.component';

describe('SharePrescriptionComponent', () => {
  let component: SharePrescriptionComponent;
  let fixture: ComponentFixture<SharePrescriptionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SharePrescriptionComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SharePrescriptionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
