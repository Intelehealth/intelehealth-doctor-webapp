import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CalendarMonthlyComponent } from './calendar-monthly.component';

describe('CalendarMonthlyComponent', () => {
  let component: CalendarMonthlyComponent;
  let fixture: ComponentFixture<CalendarMonthlyComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CalendarMonthlyComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CalendarMonthlyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
