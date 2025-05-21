import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AillmtxMedicationComponent } from './aillmtx-medication.component';

describe('AillmtxMedicationComponent', () => {
  let component: AillmtxMedicationComponent;
  let fixture: ComponentFixture<AillmtxMedicationComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [AillmtxMedicationComponent]
    });
    fixture = TestBed.createComponent(AillmtxMedicationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
