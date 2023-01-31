import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SharePrescriptionErrorComponent } from './share-prescription-error.component';

describe('SharePrescriptionErrorComponent', () => {
  let component: SharePrescriptionErrorComponent;
  let fixture: ComponentFixture<SharePrescriptionErrorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SharePrescriptionErrorComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SharePrescriptionErrorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
