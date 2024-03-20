import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HwAssessmentComponent } from './hw-assessment.component';

describe('HwAssessmentComponent', () => {
  let component: HwAssessmentComponent;
  let fixture: ComponentFixture<HwAssessmentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ HwAssessmentComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(HwAssessmentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
