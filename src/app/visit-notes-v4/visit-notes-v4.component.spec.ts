import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VisitNotesV4Component } from './visit-notes-v4.component';

describe('VisitNotesV4Component', () => {
  let component: VisitNotesV4Component;
  let fixture: ComponentFixture<VisitNotesV4Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ VisitNotesV4Component ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(VisitNotesV4Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
