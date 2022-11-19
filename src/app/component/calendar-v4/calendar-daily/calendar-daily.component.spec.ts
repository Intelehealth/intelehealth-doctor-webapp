import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CalendarDailyComponent } from './calendar-daily.component';

describe('CalendarDailyComponent', () => {
  let component: CalendarDailyComponent;
  let fixture: ComponentFixture<CalendarDailyComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CalendarDailyComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CalendarDailyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
