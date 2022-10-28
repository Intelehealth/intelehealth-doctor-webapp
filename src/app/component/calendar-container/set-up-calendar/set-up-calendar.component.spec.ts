import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SetUpCalendarComponent } from './set-up-calendar.component';

describe('SetUpCalendarComponent', () => {
  let component: SetUpCalendarComponent;
  let fixture: ComponentFixture<SetUpCalendarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SetUpCalendarComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SetUpCalendarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
