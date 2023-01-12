import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SetupNewPasswordComponent } from './setup-new-password.component';

describe('SetupNewPasswordComponent', () => {
  let component: SetupNewPasswordComponent;
  let fixture: ComponentFixture<SetupNewPasswordComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SetupNewPasswordComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SetupNewPasswordComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
