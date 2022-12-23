import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PrescriptionContainerComponent } from './prescription-container.component';

describe('PrescriptionContainerComponent', () => {
  let component: PrescriptionContainerComponent;
  let fixture: ComponentFixture<PrescriptionContainerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PrescriptionContainerComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PrescriptionContainerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
