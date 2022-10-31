import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DashboardSummaryPageComponent } from './dashboard-summary-page.component';

describe('DashboardSummaryPageComponent', () => {
  let component: DashboardSummaryPageComponent;
  let fixture: ComponentFixture<DashboardSummaryPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DashboardSummaryPageComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DashboardSummaryPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
