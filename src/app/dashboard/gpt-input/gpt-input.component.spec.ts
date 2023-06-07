import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GptInputComponent } from './gpt-input.component';

describe('GptInputComponent', () => {
  let component: GptInputComponent;
  let fixture: ComponentFixture<GptInputComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ GptInputComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GptInputComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
