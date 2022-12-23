import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PrescriptionSentComponent } from './prescription-sent.component';

describe('PrescriptionSentComponent', () => {
  let component: PrescriptionSentComponent;
  let fixture: ComponentFixture<PrescriptionSentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PrescriptionSentComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PrescriptionSentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
