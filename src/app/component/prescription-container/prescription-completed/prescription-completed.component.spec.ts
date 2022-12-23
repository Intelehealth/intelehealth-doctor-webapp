import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PrescriptionCompletedComponent } from './prescription-completed.component';

describe('PrescriptionCompletedComponent', () => {
  let component: PrescriptionCompletedComponent;
  let fixture: ComponentFixture<PrescriptionCompletedComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PrescriptionCompletedComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PrescriptionCompletedComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
