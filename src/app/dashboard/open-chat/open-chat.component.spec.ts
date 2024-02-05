import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OpenChatComponent } from './open-chat.component';

describe('OpenChatComponent', () => {
  let component: OpenChatComponent;
  let fixture: ComponentFixture<OpenChatComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [OpenChatComponent]
    });
    fixture = TestBed.createComponent(OpenChatComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
