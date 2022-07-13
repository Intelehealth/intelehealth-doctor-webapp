import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FoodAllergyComponent } from './food-allergy.component';

describe('FoodAllergyComponent', () => {
  let component: FoodAllergyComponent;
  let fixture: ComponentFixture<FoodAllergyComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FoodAllergyComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FoodAllergyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
