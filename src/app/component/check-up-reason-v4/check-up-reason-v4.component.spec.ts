import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CheckUpReasonComponent } from './check-up-reason.component';

describe('CheckUpReasonComponent', () => {
  let component: CheckUpReasonComponent;
  let fixture: ComponentFixture<CheckUpReasonComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CheckUpReasonComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CheckUpReasonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
