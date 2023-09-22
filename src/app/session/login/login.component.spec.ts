import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { TranslationService } from 'src/app/services/translation.service';
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { of } from 'rxjs';
import { TranslateFakeLoader,TranslateLoader,TranslateModule,TranslateService } from '@ngx-translate/core';
import { ToastrModule } from "ngx-toastr";
import { AuthService } from 'src/app/services/auth.service';

import {
  NgxPermissionsAllowStubDirective,
  NgxPermissionsModule,
} from 'ngx-permissions';
import { LoginComponent } from './login.component';

describe('LoginComponent', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;
  let authServiceSpy = jasmine.createSpyObj('AuthService', ['login']);
  authServiceSpy.login.and.returnValue(of());

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ LoginComponent, NgxPermissionsAllowStubDirective ],
      imports: [ 
          HttpClientTestingModule, 
          FormsModule,
          ReactiveFormsModule,
          NgxPermissionsModule.forRoot(),
          ToastrModule.forRoot(),
          TranslateModule.forRoot({
            loader: {
              provide: TranslateLoader,
              useClass: TranslateFakeLoader
            }
          })
      ],
      providers: [
        TranslationService, 
        TranslateService,
        {
          provide: AuthService, useValue: authServiceSpy
        }
      ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    component.showCaptcha = false
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('Test Login Form Input Element Count', () => {
    const formElement = fixture.debugElement.nativeElement.querySelector('#loginForm');
    const inputElements = formElement.querySelectorAll('input');
    expect(inputElements.length).toEqual(2);
  });

  it('Test Intial Form Values For Login Form', () => {
    const loginFormGroup = component.loginForm;
    const formValues = {
      username: '',
      password: '',
      recaptcha: ''
    }
    expect(loginFormGroup.value).toEqual(formValues)
  });

  it('Check USERNAME Value Before Entering Some Value & Validation', () => {
    const loginFormUserElement = fixture.debugElement.nativeElement.querySelector('#loginForm').querySelectorAll('input')[0];
    const userNameFromGorup = component.loginForm.get('username');
    expect(loginFormUserElement.value).toEqual(userNameFromGorup.value);
    expect(userNameFromGorup.errors).not.toBeNull();
    expect(userNameFromGorup.errors.required).toBeTruthy();
  });

  it('Check USERNAME Value After Entering Some Value & Validation', () => {
    const loginFormUserElement = fixture.debugElement.nativeElement.querySelector('#loginForm').querySelectorAll('input')[0];
    loginFormUserElement.value = 'testuser'
    loginFormUserElement.dispatchEvent(new Event('input'))
    fixture.detectChanges();
    fixture.whenStable().then(() => {
      const userNameFromGorup = component.loginForm.get('username');
      expect(loginFormUserElement.value).toEqual(userNameFromGorup.value);
      expect(userNameFromGorup.errors).toBeNull();
    })
  });

  it('Check Login Form Is Valid When All Validation are fullfilled', () => {
    const loginFormUserElement = fixture.debugElement.nativeElement.querySelector('#loginForm').querySelectorAll('input')[0];
    const loginFormPasswordElement = fixture.debugElement.nativeElement.querySelector('#loginForm').querySelectorAll('input')[1];
    loginFormUserElement.value = 'testuser'
    loginFormPasswordElement.value = 'Test@123'
    loginFormUserElement.dispatchEvent(new Event('input'))
    loginFormPasswordElement.dispatchEvent(new Event('input'))
    fixture.detectChanges();
    fixture.whenStable().then(() => {
      const isLoginFormValid = component.loginForm.valid;
      expect(isLoginFormValid).toBeTruthy()
    })
  });

  it('should allow user to log in', () => {
    const formData = {
      "username": "something@somewhere.com",
      "password": "8938ndisn@din",
      "recaptcha": ''
    };
    component.loginForm.setValue(formData);
    component.login();
    expect(authServiceSpy.login).toHaveBeenCalled();
  })
});
