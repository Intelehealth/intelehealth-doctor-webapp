import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AiLlmComponent } from './ai-llm.component';

describe('AiLlmComponent', () => {
  let component: AiLlmComponent;
  let fixture: ComponentFixture<AiLlmComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [AiLlmComponent]
    });
    fixture = TestBed.createComponent(AiLlmComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
