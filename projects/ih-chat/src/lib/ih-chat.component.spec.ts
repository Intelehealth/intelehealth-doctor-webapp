import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IhChatComponent } from './ih-chat.component';

describe('IhChatComponent', () => {
  let component: IhChatComponent;
  let fixture: ComponentFixture<IhChatComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [IhChatComponent]
    });
    fixture = TestBed.createComponent(IhChatComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
