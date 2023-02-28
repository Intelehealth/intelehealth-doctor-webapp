import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConfirmDayOffComponent } from './confirm-day-off.component';

describe('ConfirmDayOffComponent', () => {
  let component: ConfirmDayOffComponent;
  let fixture: ComponentFixture<ConfirmDayOffComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ConfirmDayOffComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ConfirmDayOffComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
