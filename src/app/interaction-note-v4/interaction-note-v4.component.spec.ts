import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InteractionNoteV4Component } from './interaction-note-v4.component';

describe('InteractionNoteV4Component', () => {
  let component: InteractionNoteV4Component;
  let fixture: ComponentFixture<InteractionNoteV4Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ InteractionNoteV4Component ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(InteractionNoteV4Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
