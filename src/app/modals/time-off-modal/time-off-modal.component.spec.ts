import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TimeOffModalComponent } from './time-off-modal.component';

describe('TimeOffModalComponent', () => {
  let component: TimeOffModalComponent;
  let fixture: ComponentFixture<TimeOffModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TimeOffModalComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TimeOffModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
