import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AidAssessmentComponent } from './aid-assessment.component';

describe('AidAssessmentComponent', () => {
  let component: AidAssessmentComponent;
  let fixture: ComponentFixture<AidAssessmentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AidAssessmentComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AidAssessmentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
