import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ResolutionFeedbackComponent } from './resolution-feedback.component';

describe('ResolutionFeedbackComponent', () => {
  let component: ResolutionFeedbackComponent;
  let fixture: ComponentFixture<ResolutionFeedbackComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ResolutionFeedbackComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ResolutionFeedbackComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
