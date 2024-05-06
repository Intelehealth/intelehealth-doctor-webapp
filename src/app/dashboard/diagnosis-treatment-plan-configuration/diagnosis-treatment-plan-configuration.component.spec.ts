import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DiagnosisTreatmentPlanConfigurationComponent } from './diagnosis-treatment-plan-configuration.component';

describe('DiagnosisTreatmentPlanConfigurationComponent', () => {
  let component: DiagnosisTreatmentPlanConfigurationComponent;
  let fixture: ComponentFixture<DiagnosisTreatmentPlanConfigurationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DiagnosisTreatmentPlanConfigurationComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DiagnosisTreatmentPlanConfigurationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
