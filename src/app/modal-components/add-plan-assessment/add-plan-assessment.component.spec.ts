import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddPlanAssessmentComponent } from './add-plan-assessment.component';

describe('AddPlanAssessmentComponent', () => {
  let component: AddPlanAssessmentComponent;
  let fixture: ComponentFixture<AddPlanAssessmentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AddPlanAssessmentComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AddPlanAssessmentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
