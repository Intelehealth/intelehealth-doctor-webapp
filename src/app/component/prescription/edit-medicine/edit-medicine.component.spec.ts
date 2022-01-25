import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditMedicineComponent } from './edit-medicine.component';

describe('EditMedicineComponent', () => {
  let component: EditMedicineComponent;
  let fixture: ComponentFixture<EditMedicineComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EditMedicineComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(EditMedicineComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
