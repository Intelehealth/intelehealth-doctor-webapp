import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DiagnosisV4Component } from './diagnosis-v4.component';

describe('DiagnosisV4Component', () => {
  let component: DiagnosisV4Component;
  let fixture: ComponentFixture<DiagnosisV4Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DiagnosisV4Component ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DiagnosisV4Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
