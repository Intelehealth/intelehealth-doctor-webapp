import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SharePrescriptionSuccessComponent } from './share-prescription-success.component';

describe('SharePrescriptionSuccessComponent', () => {
  let component: SharePrescriptionSuccessComponent;
  let fixture: ComponentFixture<SharePrescriptionSuccessComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SharePrescriptionSuccessComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SharePrescriptionSuccessComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
