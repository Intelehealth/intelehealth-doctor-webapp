import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LoginImageContainerComponent } from './login-image-container.component';

describe('LoginImageContainerComponent', () => {
  let component: LoginImageContainerComponent;
  let fixture: ComponentFixture<LoginImageContainerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ LoginImageContainerComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(LoginImageContainerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
