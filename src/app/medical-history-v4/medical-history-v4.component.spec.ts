import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MedicalHistoryV4Component } from './medical-history-v4.component';

describe('MedicalHistoryV4Component', () => {
  let component: MedicalHistoryV4Component;
  let fixture: ComponentFixture<MedicalHistoryV4Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MedicalHistoryV4Component ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MedicalHistoryV4Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
