import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConsultationDetailsV4Component } from './consultation-details-v4.component';

describe('ConsultationDetailsV4Component', () => {
  let component: ConsultationDetailsV4Component;
  let fixture: ComponentFixture<ConsultationDetailsV4Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ConsultationDetailsV4Component ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ConsultationDetailsV4Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
