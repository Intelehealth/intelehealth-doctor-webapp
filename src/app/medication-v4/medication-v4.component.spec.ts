import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MedicationV4Component } from './medication-v4.component';

describe('MedicationV4Component', () => {
  let component: MedicationV4Component;
  let fixture: ComponentFixture<MedicationV4Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MedicationV4Component ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MedicationV4Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
