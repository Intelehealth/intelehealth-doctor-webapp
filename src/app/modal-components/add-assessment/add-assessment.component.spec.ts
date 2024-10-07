import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddAssessmentComponent } from './add-assessment.component';

describe('AddAssessmentComponent', () => {
  let component: AddAssessmentComponent;
  let fixture: ComponentFixture<AddAssessmentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AddAssessmentComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AddAssessmentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
