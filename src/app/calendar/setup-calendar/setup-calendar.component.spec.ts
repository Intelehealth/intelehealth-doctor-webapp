import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SetupCalendarComponent } from './setup-calendar.component';

describe('SetupCalendarComponent', () => {
  let component: SetupCalendarComponent;
  let fixture: ComponentFixture<SetupCalendarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SetupCalendarComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SetupCalendarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
