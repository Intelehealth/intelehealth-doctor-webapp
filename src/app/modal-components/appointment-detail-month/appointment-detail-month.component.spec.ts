import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AppointmentDetailMonthComponent } from './appointment-detail-month.component';

describe('AppointmentDetailMonthComponent', () => {
  let component: AppointmentDetailMonthComponent;
  let fixture: ComponentFixture<AppointmentDetailMonthComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AppointmentDetailMonthComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AppointmentDetailMonthComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
