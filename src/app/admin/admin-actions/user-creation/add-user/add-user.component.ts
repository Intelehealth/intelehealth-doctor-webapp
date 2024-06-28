import { Component } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ProviderAttributeValidator } from 'src/app/core/validators/ProviderAttributeValidator';
import { AuthService } from 'src/app/services/auth.service';
import { getCacheData } from 'src/app/utils/utility-functions';
import { doctorDetails } from 'src/config/constant';

@Component({
  selector: 'app-add-user',
  templateUrl: './add-user.component.html',
  styleUrls: ['./add-user.component.scss']
})
export class AddUserComponent {
  personalInfoForm: FormGroup;
  phoneNumberValid: any;
  phoneNumber: any;
  phoneNumberObj: any;
  maxTelLegth1: number;
  checkingPhoneValidity: boolean;
  phoneValid: any;
  emailValid: any;

  constructor(private authService: AuthService){
    this.personalInfoForm = new FormGroup({
      givenName: new FormControl('', [Validators.required, Validators.pattern(/^[^~!#$^&*(){}[\]|@<>"\\\/\-+_=;':,.?`%0-9]*$/)]),
      middleName: new FormControl('', [Validators.pattern(/^[^~!#$^&*(){}[\]|@<>"\\\/\-+_=;':,.?`%0-9]*$/)]),
      familyName: new FormControl('', [Validators.required, Validators.pattern(/^[^~!#$^&*(){}[\]|@<>"\\\/\-+_=;':,.?`%0-9]*$/)]),
      gender: new FormControl('M', [Validators.required]),
      role: new FormControl('Doctor', [Validators.required]),
      countryCode1: new FormControl('+91'),
      phoneNumber: new FormControl('', [Validators.required]),
      emailId: new FormControl('', [Validators.required, Validators.pattern('^[a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,4}$')], [ProviderAttributeValidator.createValidator(this.authService, doctorDetails.EMAIL_ID, getCacheData(true, doctorDetails.PROVIDER).uuid)]),
      userName: new FormControl('', [Validators.required, Validators.pattern(/^[^~!#$^&*(){}[\]|@<>"\\\/\-+_=;':,.?`%0-9]*$/)]),
      password: new FormControl('', [Validators.required, Validators.pattern(/^[^~!#$^&*(){}[\]|@<>"\\\/\-+_=;':,.?`%0-9]*$/)]),
    });
  }
  
  get f1() { return this.personalInfoForm.controls; }
  
  /**
  * Callback for phone number input error event
  * @param {boolean} $event - True if valid else false
  * @param {string} errorFor - Error for which input
  * @return {void}
  */
  hasError(event, errorFor: string) {
    switch (errorFor) {
      case doctorDetails.PHONE_NUMBER:
        this.phoneNumberValid = event;
        break;
    }
  }

  /**
  * Callback for a input for phone number get valid
  * @param {string} $event - Phone number
  * @param {string} changedFor - Which input changed
  * @return {void}
  */
  getNumber(event, changedFor: string) {
    switch (changedFor) {
      case doctorDetails.PHONE_NUMBER:
        this.phoneNumberValid = true;
        this.phoneNumber = event;
        this.validateProviderAttribute(doctorDetails.PHONE_NUMBER);
        break;
    }
  }

  /**
  * Callback for a phone number object change event
  * @param {string} $event - change event
  * @param {string} objectFor - Which object changed
  * @return {void}
  */
  telInputObject(event, objectFor: string) {
    switch (objectFor) {
      case doctorDetails.PHONE_NUMBER:
        this.phoneNumber = event;
        break;
    }
  }

  /**
  * Callback for a phone number country change event
  * @param {string} $event - country change event
  * @param {string} changedFor - For which object country changed
  * @return {void}
  */
  onCountryChange(event, changedFor: string) {
    switch (changedFor) {
      case doctorDetails.PHONE_NUMBER:
        this.phoneNumberValid = false;
        this.phoneNumberObj.setCountry(event.iso2);
        this.personalInfoForm.patchValue({ countryCode1: event?.dialCode });
        this.maxTelLegth1 = this.authService.getInternationalMaskByCountryCode(event.iso2.toUpperCase(), false).filter((o) => o !== ' ').length;
        break;
    }
  }

  /**
  * Validate phone number/email already exists or not
  * @param {string} type - Attribute Type email/phone number
  * @return {void}
  */
  validateProviderAttribute(type: string) {
    this.checkingPhoneValidity = true;
    this.authService.validateProviderAttribute(type, this.personalInfoForm.value[type],"").subscribe(res => {
      if (res.success) {
        if (type === doctorDetails.PHONE_NUMBER) {
          this.phoneValid = res.data;
        } else {
          this.emailValid = res.data;
        }
        setTimeout(() => {
          this.checkingPhoneValidity = false;
        }, 500);
      }
    });
  }
}
