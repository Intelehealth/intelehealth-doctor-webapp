import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatStepper } from '@angular/material/stepper';
import { ToastrService } from 'ngx-toastr';
import { PageTitleService } from 'src/app/core/page-title/page-title.service';
import { ProfileService } from 'src/app/services/profile.service';
import { ProviderService } from 'src/app/services/provider.service';
import { environment } from 'src/environments/environment';
import * as moment from 'moment';
import { AuthService } from 'src/app/services/auth.service';
import { DateAdapter, MAT_DATE_FORMATS, NativeDateAdapter } from '@angular/material/core';
import { formatDate } from '@angular/common';
import { Subscription } from 'rxjs';
import { Router } from '@angular/router';
import { CookieService } from 'ngx-cookie-service';
import { NgxRolesService } from 'ngx-permissions';
import { ProviderAttributeValidator } from 'src/app/core/validators/ProviderAttributeValidator';
import { TranslateService } from '@ngx-translate/core';
import { getCacheData, setCacheData } from 'src/app/utils/utility-functions';
import { languages, doctorDetails } from 'src/config/constant';

export const PICK_FORMATS = {
  parse: { dateInput: { month: 'short', year: 'numeric', day: 'numeric' } },
  display: {
    dateInput: 'input',
    monthYearLabel: { year: 'numeric', month: 'short' },
    dateA11yLabel: { year: 'numeric', month: 'long', day: 'numeric' },
    monthYearA11yLabel: { year: 'numeric', month: 'long' }
  }
};

class PickDateAdapter extends NativeDateAdapter {
  format(date: Date, displayFormat: Object): string {
    if (displayFormat === 'input') {
      return formatDate(date, 'dd MMM yyyy', this.locale);
    } else {
      return date.toDateString();
    }
  }
}

@Component({
  selector: 'app-hw-profile',
  templateUrl: './hw-profile.component.html',
  styleUrls: ['./hw-profile.component.scss'],
  providers: [
    { provide: DateAdapter, useClass: PickDateAdapter },
    { provide: MAT_DATE_FORMATS, useValue: PICK_FORMATS }
  ]
})
export class HwProfileComponent implements OnInit, OnDestroy {

  file: any;
  user: any;
  provider: any;
  hwName: any;
  baseUrl: string = environment.baseURL;
  profilePicUrl: any = 'assets/svgs/user.svg';
  @ViewChild(MatStepper) stepper: MatStepper;
  personalInfoForm: FormGroup;
  phoneNumberValid = false;
  whatsAppNumberValid = false;
  phoneNumber = '';
  whatsAppNumber = '';
  submitted = false;
  providerAttributeTypes: any = [];
  phoneNumberObj: any;
  whatsAppObj: any;
  subscription1: Subscription;
  subscription2: Subscription;
  maxTelLegth1 = 10;
  maxTelLegth2 = 10;
  oldPhoneNumber = '';
  today: any;
  phoneValid = false;
  emailValid = false;
  checkingPhoneValidity = false;

  constructor(
    private pageTitleService: PageTitleService,
    private profileService: ProfileService,
    private toastr: ToastrService,
    private providerService: ProviderService,
    private authService: AuthService,
    private router: Router,
    private cookieService: CookieService,
    private rolesService: NgxRolesService,
    private translateService: TranslateService) {

      this.personalInfoForm = new FormGroup({
        givenName: new FormControl('', [Validators.required, Validators.pattern(/^[A-Za-z]*$/)]),
        middleName: new FormControl('', [Validators.required, Validators.pattern(/^[A-Za-z]*$/)]),
        familyName: new FormControl('', [Validators.required, Validators.pattern(/^[A-Za-z]*$/)]),
        gender: new FormControl('M', [Validators.required]),
        birthdate: new FormControl('', [Validators.required]),
        age: new FormControl('', [Validators.required, Validators.min(18), Validators.pattern(/^[0-9]*$/)]),
        countryCode1: new FormControl('+91'),
        countryCode2: new FormControl('+91'),
        phoneNumber: new FormControl('', [Validators.required]),
        whatsapp: new FormControl('', [Validators.required]),
        emailId: new FormControl('', [Validators.required, Validators.pattern('^[a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,4}$')], [ProviderAttributeValidator.createValidator(this.authService, doctorDetails.EMAIL_ID, getCacheData(true, doctorDetails.PROVIDER).uuid)])
      });
  }

  get f1() { return this.personalInfoForm.controls; }

  ngOnInit(): void {
    this.translateService.use(getCacheData(false, languages.SELECTED_LANGUAGE));
    this.today = moment().format('YYYY-MM-DD');
    this.user = getCacheData(true, doctorDetails.USER);
    this.provider = getCacheData(true, doctorDetails.PROVIDER);
    this.hwName = getCacheData(false, doctorDetails.DOCTOR_NAME);
    this.profilePicUrl = this.baseUrl + '/personimage/' + this.provider.person.uuid;
    this.pageTitleService.setTitle(null);
    this.formControlValueChanges();
    this.getProviderAttributeTypes();
    this.subscription1 = this.personalInfoForm.get(doctorDetails.PHONE_NUMBER).valueChanges.subscribe((val: any) => {
      if (val) {
        if (val.length > this.maxTelLegth1) {
          this.personalInfoForm.get(doctorDetails.PHONE_NUMBER).setValue(val.substring(0, this.maxTelLegth1));
        }
      }
    });
    this.subscription2 = this.personalInfoForm.get(doctorDetails.WHATS_APP).valueChanges.subscribe((val: any) => {
      if (val) {
        if (val.length > this.maxTelLegth2) {
          this.personalInfoForm.get(doctorDetails.WHATS_APP).setValue(val.substring(0, this.maxTelLegth2));
        }
      }
    });
  }

  formControlValueChanges() {
    this.personalInfoForm.get(doctorDetails.BIRTHDATE).valueChanges.subscribe(val => {
      if (val) {
        this.personalInfoForm.patchValue({ age: moment().diff(moment(val), 'years', false) });
      }
    });
  }

  getProviderAttributeTypes() {
    this.providerService.getProviderAttributeTypes().subscribe((res: any) => {
      if (res.results.length) {
        this.providerAttributeTypes = res.results;
        this.patchFormValues();
      }
    });
  }

  patchFormValues() {
    if (this.provider) {

      const personalFormValues: any = {};

      personalFormValues.givenName = (this.provider.person?.preferredName) ? this.provider.person?.preferredName.givenName : null,
      personalFormValues.middleName = (this.provider.person?.preferredName) ? this.provider.person?.preferredName.middleName : null,
      personalFormValues.familyName = (this.provider.person?.preferredName) ? this.provider.person?.preferredName.familyName : null,
      personalFormValues.gender = (this.provider.person?.gender) ? this.provider.person?.gender : null,
      personalFormValues.birthdate = (this.provider.person?.birthdate) ? moment(this.provider.person?.birthdate).format('YYYY-MM-DD') : null,
      personalFormValues.age = (this.provider.person?.age) ? this.provider.person?.age : null;
      this.providerAttributeTypes.forEach((attrType: any) => {
        switch (attrType.display) {
          case doctorDetails.ADDRESS:
            break;
          case doctorDetails.CONSULTATION_LANGUAGE:
            break;
          case doctorDetails.COUNTRY_CODE:
            personalFormValues.countryCode1 = this.getAttributeValue(attrType.uuid, attrType.display);
            personalFormValues.countryCode2 = this.getAttributeValue(attrType.uuid, attrType.display);
            break;
          case doctorDetails.EMAIL_ID:
            personalFormValues.emailId = this.getAttributeValue(attrType.uuid, attrType.display);
            break;
          case doctorDetails.FONT_OF_SIGN:
            break;
          case doctorDetails.PHONE_NUMBER:
            console.log(this.getAttributeValue(attrType.uuid, attrType.display));
            personalFormValues.phoneNumber = this.getAttributeValue(attrType.uuid, attrType.display);
            this.phoneNumberValid = (personalFormValues.phoneNumber) ?  true : false;
            this.oldPhoneNumber = this.getAttributeValue(attrType.uuid, attrType.display);
            break;
          case doctorDetails.QUALIFICATION:
            break;
          case doctorDetails.REGISTRATION_NUMBER:
            break;
          case doctorDetails.RESEARCH_EXPERIENCE:
            break;
          case doctorDetails.SIGNATURE:
            break;
          case doctorDetails.SIGNATURE_TYPE:
            break;
          case doctorDetails.SPECIALIZATION:
            break;
          case doctorDetails.TEXT_OF_SIGN:
            break;
          case doctorDetails.TYPE_OF_PROFESSION:
            break;
          case doctorDetails.WHATS_APP:
            personalFormValues.whatsapp = this.getAttributeValue(attrType.uuid, attrType.display);
            this.whatsAppNumberValid = (personalFormValues.whatsapp) ? true :  false;
            break;
          case doctorDetails.WORK_EXPERIENCE:
            break;
          case doctorDetails.WORK_EXPERIENCE_DETAILS:
            break;
          default:
            break;
        }
      });
      this.personalInfoForm.patchValue(personalFormValues);
      if (personalFormValues.phoneNumber) { this.validateProviderAttribute(doctorDetails.PHONE_NUMBER); }
    }
  }

  getAttributeValue(uuid: string, display: string) {
    let attrValue = null;
    for (let i = 0; i < this.provider.attributes.length; i++) {
      if (this.provider.attributes[i].attributeType.display === display && this.provider.attributes[i].attributeType.uuid === uuid && this.provider.attributes[i].voided === false) {
        attrValue = this.provider.attributes[i].value;
        break;
      }
    }
    return attrValue;
  }

  stepChanged(event: any) {
    this.submitted = false;
  }

  preview(event: any) {
    if (event.target.files && event.target.files[0]) {
      this.file = event.target.files[0];
      if (!this.file.name.endsWith('.jpg') && !this.file.name.endsWith('.jpeg')) {
        this.toastr.warning('Upload JPG/JPEG format image only.', 'Upload error!');
        return;
      }
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.profilePicUrl = reader.result;
        const imageBolb = reader.result.toString().split(',');
        const payload = {
          person: this.provider.person.uuid,
          base64EncodedImage: imageBolb[1]
        };
        this.profileService.updateProfileImage(payload).subscribe((res: any) => {
          this.toastr.success('Profile picture uploaded successfully!', 'Profile Pic Uploaded');
        });
      };
      reader.readAsDataURL(this.file);
    }
  }

  onImgError(event: any) {
    event.target.src = 'assets/svgs/user.svg';
  }

  hasError(event: any, errorFor: string) {
    switch (errorFor) {
      case doctorDetails.PHONE_NUMBER:
        this.phoneNumberValid = event;
        break;
      case doctorDetails.WHATS_APP_NUMBER:
        this.whatsAppNumberValid = event;
        break;
    }
  }

  getNumber(event: any, changedFor: string) {
    switch (changedFor) {
      case doctorDetails.PHONE_NUMBER:
        this.phoneNumberValid = true;
        this.phoneNumber = event;
        this.validateProviderAttribute(doctorDetails.PHONE_NUMBER);
        break;
      case doctorDetails.WHATS_APP_NUMBER:
        this.whatsAppNumberValid = true;
        this.whatsAppNumber = event;
        break;
    }
  }

  telInputObject(event: any, objectFor: string) {
    switch (objectFor) {
      case doctorDetails.PHONE_NUMBER:
        this.phoneNumberObj = event;
        break;
      case doctorDetails.WHATS_APP_NUMBER:
        this.whatsAppObj = event;
        break;
    }
  }

  onCountryChange(event: any, changedFor: string) {
    switch (changedFor) {
      case doctorDetails.PHONE_NUMBER:
        this.phoneNumberValid = false;
        this.phoneNumberObj.setCountry(event.iso2);
        this.personalInfoForm.patchValue({ countryCode1: event?.dialCode });
        this.maxTelLegth1 = this.authService.getInternationalMaskByCountryCode(event.iso2.toUpperCase(), false).filter((o) => o !== ' ').length;
        break;
      case doctorDetails.WHATS_APP_NUMBER:
        this.whatsAppNumberValid = false;
        this.whatsAppObj.setCountry(event.iso2);
        this.personalInfoForm.patchValue({ countryCode2: event?.dialCode });
        this.maxTelLegth2 = this.authService.getInternationalMaskByCountryCode(event.iso2.toUpperCase(), false).filter((o) => o !== ' ').length;
        break;
    }
  }

  updateProfile() {
    this.submitted = true;
    if (this.personalInfoForm.invalid || !this.phoneNumberValid || !this.whatsAppNumberValid || !this.phoneValid) {
      return;
    }

    const pf1 = this.personalInfoForm.value;

    this.providerService.updatePerson(this.provider.person.uuid, pf1.gender, pf1.age, pf1.birthdate).subscribe(res1 => {
      if (this.provider.person?.preferredName) {
        this.providerService.updatePersonName(this.provider.person.uuid, this.provider.person?.preferredName.uuid, pf1.givenName, pf1.middleName, pf1.familyName).subscribe(res2 => {
          this.updateProviderAttributes();
        });
      } else {
        this.providerService.createPersonName(this.provider.person.uuid, pf1.givenName, pf1.middleName, pf1.familyName).subscribe(res2 => {
          this.updateProviderAttributes();
        });
      }
    });
  }

  updateProviderAttributes() {
    const requests = [];
    this.providerAttributeTypes.forEach((attrType: any) => {
      switch (attrType.display) {
        case doctorDetails.ADDRESS:
          break;
        case doctorDetails.CONSULTATION_LANGUAGE:
          break;
        case doctorDetails.COUNTRY_CODE:
          requests.push(this.providerService.addOrUpdateProviderAttribute(this.provider.uuid, this.getAttributeUuid(attrType.uuid, attrType.display), attrType.uuid, this.getAttributeValueFromForm('countryCode1')));
          break;
        case doctorDetails.EMAIL_ID:
          requests.push(this.providerService.addOrUpdateProviderAttribute(this.provider.uuid, this.getAttributeUuid(attrType.uuid, attrType.display), attrType.uuid, this.getAttributeValueFromForm(attrType.display)));
          break;
        case doctorDetails.FONT_OF_SIGN:
          break;
        case doctorDetails.PHONE_NUMBER:
          requests.push(this.providerService.addOrUpdateProviderAttribute(this.provider.uuid, this.getAttributeUuid(attrType.uuid, attrType.display), attrType.uuid, this.getAttributeValueFromForm(attrType.display)));
          break;
        case doctorDetails.QUALIFICATION:
          break;
        case doctorDetails.REGISTRATION_NUMBER:
          break;
        case doctorDetails.RESEARCH_EXPERIENCE:
          break;
        case doctorDetails.SIGNATURE:
          break;
        case doctorDetails.SIGNATURE_TYPE:
          break;
        case doctorDetails.SPECIALIZATION:
          break;
        case doctorDetails.TEXT_OF_SIGN:
          break;
        case doctorDetails.TYPE_OF_PROFESSION:
          break;
        case doctorDetails.WHATS_APP:
          requests.push(this.providerService.addOrUpdateProviderAttribute(this.provider.uuid, this.getAttributeUuid(attrType.uuid, attrType.display), attrType.uuid, this.getAttributeValueFromForm(attrType.display)));
          break;
        case doctorDetails.WORK_EXPERIENCE:
          break;
        case doctorDetails.WORK_EXPERIENCE_DETAILS:
          break;
        default:
          break;
      }
    });
    this.providerService.requestDataFromMultipleSources(requests).subscribe((responseList: any) => {
      if (this.personalInfoForm.get(doctorDetails.PHONE_NUMBER).dirty && this.oldPhoneNumber !== this.getAttributeValueFromForm(doctorDetails.PHONE_NUMBER)) {
        this.toastr.success('Profile has been updated successfully', 'Profile Updated');
        this.toastr.warning('Kindly re-login to see updated details', 'Re-login');
        this.cookieService.delete('app.sid', '/');
        this.authService.logOut();
      } else {
        this.authService.getProvider(getCacheData(true, doctorDetails.USER).uuid).subscribe((provider: any) => {
          if (provider.results.length) {
            setCacheData(doctorDetails.PROVIDER, JSON.stringify(provider.results[0]));
            setCacheData(doctorDetails.DOCTOR_NAME, provider.results[0].person.display);
            const u = getCacheData(true, doctorDetails.USER);
            u.person.display = provider.results[0].person.display;
            setCacheData(doctorDetails.USER, JSON.stringify(u));
            this.toastr.success('Profile has been updated successfully', 'Profile Updated');
          }
        });
      }
    });
  }

  getAttributeUuid(uuid: string, display: string) {
    let attrUuid = null;
    for (let i = 0; i < this.provider.attributes.length; i++) {
      if (this.provider.attributes[i].attributeType.display === display && this.provider.attributes[i].attributeType.uuid === uuid && this.provider.attributes[i].voided === false) {
        attrUuid = this.provider.attributes[i].uuid;
        break;
      }
    }
    return attrUuid;
  }

  getAttributeValueFromForm(key: string) {
    const formValue = { ...this.personalInfoForm.value };
    return formValue[key];
  }

  detectMimeType(b64: string) {
    return this.profileService.detectMimeType(b64);
  }

  validateProviderAttribute(type: string) {
    this.checkingPhoneValidity = true;
    this.authService.validateProviderAttribute(type, this.personalInfoForm.value[type], this.provider.uuid).subscribe(res => {
      if (res.success) {
        if (type === doctorDetails.PHONE_NUMBER)  {
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

  ngOnDestroy(): void {
    this.subscription1?.unsubscribe();
    this.subscription2?.unsubscribe();
  }

}
