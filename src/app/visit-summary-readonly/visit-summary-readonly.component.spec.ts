import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VisitSummaryReadonlyComponent } from './visit-summary-readonly.component';

describe('VisitSummaryReadonlyComponent', () => {
  let component: VisitSummaryReadonlyComponent;
  let fixture: ComponentFixture<VisitSummaryReadonlyComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ VisitSummaryReadonlyComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(VisitSummaryReadonlyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
