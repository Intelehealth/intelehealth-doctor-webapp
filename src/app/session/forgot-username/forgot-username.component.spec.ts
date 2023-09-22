import { ComponentFixture, TestBed, fakeAsync, tick, flush } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { TranslationService } from 'src/app/services/translation.service';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { of } from 'rxjs';
import { TranslateFakeLoader,TranslateLoader,TranslateModule,TranslateService } from '@ngx-translate/core';
import { ToastrModule } from 'ngx-toastr';
import { Ng2TelInputModule } from 'ng2-tel-input';
import { AuthService } from 'src/app/services/auth.service';
import { NgbNavModule } from '@ng-bootstrap/ng-bootstrap';

import {
  NgxPermissionsAllowStubDirective,
  NgxPermissionsModule,
} from 'ngx-permissions';

import { ForgotUsernameComponent } from './forgot-username.component';

const FORM_EMAIL_ID = '#forgotUsernameByEmail';
const FORM_PHONE_ID = '#forgotUsernameByPhone';
const COUNTRY_CODE = '91';
const PHONE_NO = '9569921981';
const EMAIL = 'test@intellehealth.com';

describe('ForgotUsernameComponent', () => {
  let component: ForgotUsernameComponent;
  let fixture: ComponentFixture<ForgotUsernameComponent>;
  let authServiceSpy = jasmine.createSpyObj('AuthService', ['requestOtp']);
  authServiceSpy.requestOtp.and.returnValue(of());

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ForgotUsernameComponent, NgxPermissionsAllowStubDirective ],
      imports: [ 
          HttpClientTestingModule, 
          FormsModule,
          ReactiveFormsModule,
          ToastrModule.forRoot(),
          NgbNavModule,
          Ng2TelInputModule,
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
    fixture = TestBed.createComponent(ForgotUsernameComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('TEST FORGOT USERNAME FORM INPUT ELEMENTS COUNT', () => {
    const formElement = fixture.debugElement.nativeElement.querySelector(FORM_PHONE_ID);
    const inputElements = formElement.querySelectorAll('input');
    expect(inputElements.length).toEqual(1);
  });

  it('TEST INITIAL VALUES OF FORGOT USERNAME', () => {
    const forgotUsernameFormGroup = component.forgotUsernameForm;
    const formValues = {
      phone: '',
      email: '',
      countryCode: COUNTRY_CODE
    }
    expect(forgotUsernameFormGroup.value).toEqual(formValues)
  });

  it('CHECK MOBILE NUMBER BEFORE ENTERING VALUE & VALIDATION', () => {
    const forgotUsernameElement = fixture.debugElement.nativeElement.querySelector(FORM_PHONE_ID).querySelectorAll('input')[0];
    const phoneFromGorup = component.forgotUsernameForm.get('phone');
    expect(forgotUsernameElement.value).toEqual(phoneFromGorup.value);
    expect(phoneFromGorup.errors).not.toBeNull();
    expect(phoneFromGorup.errors.required).toBeTruthy();
  });

  it('CHECK MOBILE NUMBER AFTER ENTERING VALUE & VALIDATION', () => {
    const phoneElement = fixture.debugElement.nativeElement.querySelector(FORM_PHONE_ID).querySelectorAll('input')[0];
    phoneElement.value = PHONE_NO
    phoneElement.dispatchEvent(new Event('input'))
    fixture.detectChanges();
    fixture.whenStable().then(() => {
      const phoneFromGorup = component.forgotUsernameForm.get('phone');
      expect(phoneElement.value).toEqual(phoneFromGorup.value);
      expect(phoneFromGorup.errors).toBeNull();
      const isFormValid = component.forgotUsernameForm.valid;
      expect(isFormValid).toBeTruthy()
    })
  });

  it('SHOULD ALLOW TO REQUEST OTP WITH VALID PHONE NO.', () => {
    component.active = 'phone';
    component.phoneIsValid = true;
    const formData = {
      'phone': PHONE_NO,
      'email': '',
      'countryCode': COUNTRY_CODE
    };
    component.forgotUsernameForm.setValue(formData);
    component.forgotUsername();
    expect(authServiceSpy.requestOtp).toHaveBeenCalled();
  })


  it('CHECK EMAIL BEFORE ENTERING VALUE & VALIDATION', async () => {
    component.active = 'email';
    fixture.detectChanges();
    await fixture.whenStable();
    const forgotUsernameElement = fixture.nativeElement.querySelector(FORM_EMAIL_ID).querySelectorAll('input')[0];
    const emailFromGorup = component.forgotUsernameForm.get('email');
    expect(forgotUsernameElement.value).toEqual(emailFromGorup.value);
  });

  it('CHECK EMAIL NUMBER AFTER ENTERING VALUE & VALIDATION', async() => {
    component.active = 'email'
    fixture.detectChanges();
    const emailElement = fixture.debugElement.nativeElement.querySelector(FORM_EMAIL_ID).querySelectorAll('input')[0];
    emailElement.value = EMAIL
    emailElement.dispatchEvent(new Event('input'))
    fixture.detectChanges();
    await fixture.whenStable();
    const emailFromGorup = component.forgotUsernameForm.get('email');
    expect(emailElement.value).toEqual(emailFromGorup.value);
    expect(emailFromGorup.errors).toBeNull();
  });

  it('SHOULD ALLOW TO REQUEST OTP WITH VALID EMAIL NO.', () => {
    component.active = 'email';
    fixture.detectChanges();
    const formData = {
      'phone': '',
      'email': EMAIL,
      'countryCode': COUNTRY_CODE
    };
    component.forgotUsernameForm.setValue(formData);
    component.forgotUsername();
    expect(authServiceSpy.requestOtp).toHaveBeenCalled();
  })

});
