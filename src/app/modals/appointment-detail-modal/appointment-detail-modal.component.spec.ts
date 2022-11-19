import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AppointmentDetailModalComponent } from './appointment-detail-modal.component';

describe('AppointmentDetailModalComponent', () => {
  let component: AppointmentDetailModalComponent;
  let fixture: ComponentFixture<AppointmentDetailModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AppointmentDetailModalComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AppointmentDetailModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
