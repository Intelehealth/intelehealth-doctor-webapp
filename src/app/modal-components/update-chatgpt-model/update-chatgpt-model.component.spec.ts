import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UpdateChatgptModelComponent } from './update-chatgpt-model.component';

describe('UpdateChatgptModelComponent', () => {
  let component: UpdateChatgptModelComponent;
  let fixture: ComponentFixture<UpdateChatgptModelComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ UpdateChatgptModelComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UpdateChatgptModelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
