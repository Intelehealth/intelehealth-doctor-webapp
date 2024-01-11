import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PrescribeMedicationComponent } from './prescribe-medication.component';

describe('PrescribeMedicationComponent', () => {
  let component: PrescribeMedicationComponent;
  let fixture: ComponentFixture<PrescribeMedicationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PrescribeMedicationComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PrescribeMedicationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
