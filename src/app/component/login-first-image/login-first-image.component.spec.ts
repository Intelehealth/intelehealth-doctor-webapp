import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LoginFirstImageComponent } from './login-first-image.component';

describe('LoginFirstImageComponent', () => {
  let component: LoginFirstImageComponent;
  let fixture: ComponentFixture<LoginFirstImageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ LoginFirstImageComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(LoginFirstImageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
