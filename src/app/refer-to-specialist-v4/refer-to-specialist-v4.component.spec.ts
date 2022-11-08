import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReferToSpecialistV4Component } from './refer-to-specialist-v4.component';

describe('ReferToSpecialistV4Component', () => {
  let component: ReferToSpecialistV4Component;
  let fixture: ComponentFixture<ReferToSpecialistV4Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ReferToSpecialistV4Component ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ReferToSpecialistV4Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
