import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AppointmentLibraryComponent } from './appointment-library.component';

describe('AppointmentLibraryComponent', () => {
  let component: AppointmentLibraryComponent;
  let fixture: ComponentFixture<AppointmentLibraryComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [AppointmentLibraryComponent]
    });
    fixture = TestBed.createComponent(AppointmentLibraryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
