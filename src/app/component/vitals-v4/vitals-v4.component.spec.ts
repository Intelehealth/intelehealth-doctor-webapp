import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VitailsV4Component } from './vitals-v4.component';

describe('VitailsV4Component', () => {
  let component: VitailsV4Component;
  let fixture: ComponentFixture<VitailsV4Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ VitailsV4Component ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(VitailsV4Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
