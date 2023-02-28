import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConfirmHoursOffComponent } from './confirm-hours-off.component';

describe('ConfirmHoursOffComponent', () => {
  let component: ConfirmHoursOffComponent;
  let fixture: ComponentFixture<ConfirmHoursOffComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ConfirmHoursOffComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ConfirmHoursOffComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
