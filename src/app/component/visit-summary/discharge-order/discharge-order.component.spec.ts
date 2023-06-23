import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DischargeOrderComponent } from './discharge-order.component';

describe('DischargeOrderComponent', () => {
  let component: DischargeOrderComponent;
  let fixture: ComponentFixture<DischargeOrderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DischargeOrderComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DischargeOrderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
