import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PhysicalExaminationV4Component } from './physical-examination-v4.component';

describe('PhysicalExaminationV4Component', () => {
  let component: PhysicalExaminationV4Component;
  let fixture: ComponentFixture<PhysicalExaminationV4Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PhysicalExaminationV4Component ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PhysicalExaminationV4Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
