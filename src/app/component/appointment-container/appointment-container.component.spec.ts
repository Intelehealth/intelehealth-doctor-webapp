import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AppointmentContainerComponent } from './appointment-container.component';

describe('AppointmentContainerComponent', () => {
  let component: AppointmentContainerComponent;
  let fixture: ComponentFixture<AppointmentContainerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AppointmentContainerComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AppointmentContainerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
