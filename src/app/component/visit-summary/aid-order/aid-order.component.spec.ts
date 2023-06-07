import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AidOrderComponent } from './aid-order.component';

describe('AidOrderComponent', () => {
  let component: AidOrderComponent;
  let fixture: ComponentFixture<AidOrderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AidOrderComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AidOrderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
