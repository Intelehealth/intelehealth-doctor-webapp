import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PrescriptionReadonlyComponent } from './prescription-readonly.component';

describe('PrescriptionReadonlyComponent', () => {
  let component: PrescriptionReadonlyComponent;
  let fixture: ComponentFixture<PrescriptionReadonlyComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PrescriptionReadonlyComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PrescriptionReadonlyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
