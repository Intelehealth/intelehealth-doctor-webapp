import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FollowUpV4Component } from './follow-up-v4.component';

describe('FollowUpV4Component', () => {
  let component: FollowUpV4Component;
  let fixture: ComponentFixture<FollowUpV4Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FollowUpV4Component ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FollowUpV4Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
