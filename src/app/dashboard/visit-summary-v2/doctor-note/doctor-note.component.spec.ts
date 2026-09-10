import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DoctorNoteComponent } from './doctor-note.component';

describe('DoctorNoteComponent', () => {
  let component: DoctorNoteComponent;
  let fixture: ComponentFixture<DoctorNoteComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [DoctorNoteComponent]
    });
    fixture = TestBed.createComponent(DoctorNoteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
