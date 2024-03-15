import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PasswordResetSuccessComponent } from './password-reset-success.component';

describe('PasswordResetSuccessComponent', () => {
  let component: PasswordResetSuccessComponent;
  let fixture: ComponentFixture<PasswordResetSuccessComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PasswordResetSuccessComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PasswordResetSuccessComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
