import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReferalV4Component } from './referal-v4.component';

describe('ReferalV4Component', () => {
  let component: ReferalV4Component;
  let fixture: ComponentFixture<ReferalV4Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ReferalV4Component ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ReferalV4Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
