import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PrescribePlanComponent } from './prescribe-plan.component';

describe('PrescribePlanComponent', () => {
  let component: PrescribePlanComponent;
  let fixture: ComponentFixture<PrescribePlanComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PrescribePlanComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PrescribePlanComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
