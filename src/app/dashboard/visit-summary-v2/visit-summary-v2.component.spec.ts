import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VisitSummaryV2Component } from './visit-summary-v2.component';

describe('VisitSummaryV2Component', () => {
  let component: VisitSummaryV2Component;
  let fixture: ComponentFixture<VisitSummaryV2Component>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [VisitSummaryV2Component]
    });
    fixture = TestBed.createComponent(VisitSummaryV2Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
