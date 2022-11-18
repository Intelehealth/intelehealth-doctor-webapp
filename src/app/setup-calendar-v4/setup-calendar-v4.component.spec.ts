import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SetupCalendarV4Component } from './setup-calendar-v4.component';

describe('SetupCalendarV4Component', () => {
  let component: SetupCalendarV4Component;
  let fixture: ComponentFixture<SetupCalendarV4Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SetupCalendarV4Component ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SetupCalendarV4Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
