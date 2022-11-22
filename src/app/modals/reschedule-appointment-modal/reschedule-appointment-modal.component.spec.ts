import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RescheduleAppointmentModalComponent } from './reschedule-appointment-modal.component';

describe('RescheduleAppointmentModalComponent', () => {
  let component: RescheduleAppointmentModalComponent;
  let fixture: ComponentFixture<RescheduleAppointmentModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ RescheduleAppointmentModalComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(RescheduleAppointmentModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
