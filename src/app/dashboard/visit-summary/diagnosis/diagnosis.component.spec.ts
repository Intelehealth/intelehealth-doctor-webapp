import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DiagnosisComponent } from './diagnosis.component';

describe('DiagnosisComponent', () => {
  let component: DiagnosisComponent;
  let fixture: ComponentFixture<DiagnosisComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [DiagnosisComponent]
    });
    fixture = TestBed.createComponent(DiagnosisComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
