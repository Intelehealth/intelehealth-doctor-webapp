import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VisitSummaryV4Component } from './visit-summary-v4.component';

describe('VisitSummaryV4Component', () => {
  let component: VisitSummaryV4Component;
  let fixture: ComponentFixture<VisitSummaryV4Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ VisitSummaryV4Component ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(VisitSummaryV4Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
