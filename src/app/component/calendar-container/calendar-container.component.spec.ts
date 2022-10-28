import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CalendarContainerComponent } from './calendar-container.component';

describe('CalendarContainerComponent', () => {
  let component: CalendarContainerComponent;
  let fixture: ComponentFixture<CalendarContainerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CalendarContainerComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CalendarContainerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
