import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PrimaryDoctorNoteComponent } from './primary-doctor-note.component';

describe('PrimaryDoctorNoteComponent', () => {
  let component: PrimaryDoctorNoteComponent;
  let fixture: ComponentFixture<PrimaryDoctorNoteComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [PrimaryDoctorNoteComponent]
    });
    fixture = TestBed.createComponent(PrimaryDoctorNoteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
