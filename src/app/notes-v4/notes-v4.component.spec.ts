import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NotesV4Component } from './notes-v4.component';

describe('NotesV4Component', () => {
  let component: NotesV4Component;
  let fixture: ComponentFixture<NotesV4Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ NotesV4Component ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(NotesV4Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
