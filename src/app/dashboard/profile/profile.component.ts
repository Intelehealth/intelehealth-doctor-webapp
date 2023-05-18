import { AfterViewInit, Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatStepper } from '@angular/material/stepper';
import { SignaturePad } from 'angular2-signaturepad';
import { ToastrService } from 'ngx-toastr';
import { PageTitleService } from 'src/app/core/page-title/page-title.service';
import { ProfileService } from 'src/app/services/profile.service';
import { ProviderService } from 'src/app/services/provider.service';
import { environment } from 'src/environments/environment';
import * as moment from 'moment';
import { MatTabGroup } from '@angular/material/tabs';
import { AuthService } from 'src/app/services/auth.service';
import { DateAdapter, MAT_DATE_FORMATS, NativeDateAdapter } from '@angular/material/core';
import { formatDate } from '@angular/common';
import { Subscription } from 'rxjs';
import { Router } from '@angular/router';
import { CookieService } from 'ngx-cookie-service';
import { NgxRolesService } from 'ngx-permissions';
import { ProviderAttributeValidator } from 'src/app/core/validators/ProviderAttributeValidator';
import { TranslateService } from '@ngx-translate/core';

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
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss'],
  providers: [
    { provide: DateAdapter, useClass: PickDateAdapter },
    { provide: MAT_DATE_FORMATS, useValue: PICK_FORMATS }
  ]
})
export class ProfileComponent implements OnInit, AfterViewInit, OnDestroy {

  file: any;
  user: any;
  provider: any;
  doctorName: any;
  baseUrl: string = environment.baseURL;
  profilePicUrl: any = 'assets/svgs/user.svg';
  @ViewChild(SignaturePad) signaturePad: SignaturePad;
  @ViewChild(MatStepper) stepper: MatStepper;
  @ViewChild(MatTabGroup) tabGroup: MatTabGroup;

  fonts: any[] = [
    {
      id: 1,
      name: 'Arty',
      text: 'arty'
    },
    {
      id: 2,
      name: 'Asem',
      text: 'asem'
    },
    {
      id: 3,
      name: 'Youthness',
      text: 'youthness'
    },
    {
      id: 4,
      name: 'Almondita',
      text: 'almondita'
    }
  ];

  languages: any[] = [
    {
      id: 1,
      name: 'English'
    },
    {
      id: 2,
      name: 'Hindi'
    },
    {
      id: 3,
      name: 'Tamil'
    },
    {
      id: 4,
      name: 'Gujrathi'
    },
    {
      id: 5,
      name: 'Bangla'
    }
  ];

  professions: any[] = [
    {
      id: 1,
      name: 'MBBS'
    },
    {
      id: 2,
      name: 'MBBS, MD'
    },
    {
      id: 3,
      name: 'Dentist'
    },
    {
      id: 4,
      name: 'Other'
    }
  ];

  specializations: any[] = [
    {
      id: 1,
      name: 'General Physician'
    },
    {
      id: 2,
      name: 'Dermatologist'
    },
    {
      id: 3,
      name: 'Gynecologist'
    },
    {
      id: 4,
      name: 'Pediatrician'
    }
  ];

  signaturePadOptions: Object = { // passed through to szimek/signature_pad constructor
    'minWidth': 5,
    'canvasWidth': 300,
    'canvasHeight': 100,
    'backgroundColor': '#FAF9FF'
  };

  personalInfoForm: FormGroup;
  professionalInfoForm: FormGroup;
  signatureType: string = 'Draw';
  selectedSignatureTabIndex: number = 0;
  signatureFile: any;
  signaturePicUrl: any;
  phoneNumberValid: boolean = false;
  whatsAppNumberValid: boolean = false;
  phoneNumber: string = '';
  whatsAppNumber: string = '';
  submitted: boolean = false;
  providerAttributeTypes: any = [];
  phoneNumberObj: any;
  whatsAppObj: any;
  subscription1: Subscription;
  subscription2: Subscription;
  maxTelLegth1: number = 10;
  maxTelLegth2: number = 10;
  oldPhoneNumber: string = '';
  today: any;
  phoneValid: boolean = false;
  emailValid: boolean = false;
  checkingPhoneValidity: boolean = false;

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
      age: new FormControl('', [Validators.required, Validators.pattern(/^[0-9]*$/)]),
      countryCode1: new FormControl('+91'),
      countryCode2: new FormControl('+91'),
      phoneNumber: new FormControl('', [Validators.required]),
      whatsapp: new FormControl('', [Validators.required]),
      emailId: new FormControl('', [Validators.required, Validators.pattern("^[a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,4}$")], [ProviderAttributeValidator.createValidator(this.authService, 'emailId', JSON.parse(localStorage.getItem('provider')).uuid)]),
      signatureType: new FormControl('Draw', [Validators.required]),
      textOfSign: new FormControl(null),
      fontOfSign: new FormControl(null),
      signature: new FormControl(null)
    });

    this.professionalInfoForm = new FormGroup({
      typeOfProfession: new FormControl(null, [Validators.required]),
      registrationNumber: new FormControl(null, [Validators.required]),
      specialization: new FormControl(null, [Validators.required]),
      consultationLanguage: new FormControl(null, [Validators.required]),
      workExperience: new FormControl(null, [Validators.required]),
      researchExperience: new FormControl(null, [Validators.required]),
      workExperienceDetails: new FormControl('', [Validators.required])
    });
  }

  get f1() { return this.personalInfoForm.controls; }
  get f2() { return this.professionalInfoForm.controls; }


  ngOnInit(): void {
    this.translateService.use(localStorage.getItem('selectedLanguage'));
    this.today = moment().format('YYYY-MM-DD');
    this.user = JSON.parse(localStorage.getItem('user'));
    this.provider = JSON.parse(localStorage.getItem('provider'));
    this.doctorName = localStorage.getItem('doctorName');
    this.profilePicUrl = this.baseUrl + '/personimage/' + this.provider.person.uuid;
    this.pageTitleService.setTitle(null);
    this.formControlValueChanges();
    this.getProviderAttributeTypes();
    this.subscription1 = this.personalInfoForm.get('phoneNumber').valueChanges.subscribe((val: any) => {
      if (val) {
        if (val.length > this.maxTelLegth1) {
          this.personalInfoForm.get('phoneNumber').setValue(val.substring(0, this.maxTelLegth1));
        }
      }
    });
    this.subscription2 = this.personalInfoForm.get('whatsapp').valueChanges.subscribe((val: any) => {
      if (val) {
        if (val.length > this.maxTelLegth2) {
          this.personalInfoForm.get('whatsapp').setValue(val.substring(0, this.maxTelLegth2));
        }
      }
    });
  }

  ngAfterViewInit() {
    // this.signaturePad is now available
    this.signaturePad.set('minWidth', 5); // set szimek/signature_pad options at runtime
    this.signaturePad.clear(); // invoke functions from szimek/signature_pad API
  }

  formControlValueChanges() {
    this.personalInfoForm.get('textOfSign').valueChanges.subscribe(val => {
      if (val) {
        this.fonts.map((f: any) => f.text = val);
      } else {
        this.fonts.map((f: any) => f.text = f.name);
      }
    });

    this.personalInfoForm.get('signatureType').valueChanges.subscribe(val => {
      let tabs = ['Draw', 'Generate', 'Upload'];
      if (val) {
        this.signatureType = val;
        if (val == 'Generate') {
          this.personalInfoForm.get('textOfSign').setValidators([Validators.required]);
          this.personalInfoForm.get('textOfSign').updateValueAndValidity();
          this.personalInfoForm.get('fontOfSign').setValidators([Validators.required]);
          this.personalInfoForm.get('fontOfSign').updateValueAndValidity();
        } else {
          this.personalInfoForm.get('textOfSign').clearValidators();
          this.personalInfoForm.get('textOfSign').updateValueAndValidity();
          this.personalInfoForm.get('fontOfSign').clearValidators();
          this.personalInfoForm.get('fontOfSign').updateValueAndValidity();
        }
        if (this.selectedSignatureTabIndex != tabs.indexOf(val)) {
          setTimeout(() => {
            this.selectedSignatureTabIndex = tabs.indexOf(val);
          }, 1000);
        }
      } else {
        this.personalInfoForm.get('textOfSign').clearValidators();
        this.personalInfoForm.get('textOfSign').updateValueAndValidity();
        this.personalInfoForm.get('fontOfSign').clearValidators();
        this.personalInfoForm.get('fontOfSign').updateValueAndValidity();
        setTimeout(() => {
          this.personalInfoForm.patchValue({ signatureType: 'Draw' });
        }, 1000);
      }
    });

    this.personalInfoForm.get('birthdate').valueChanges.subscribe(val => {
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

      let personalFormValues: any = {};
      let professionalFormValues: any = {};

      // personalFormValues.givenName = (this.provider.person?.names[0]) ? this.provider.person?.names[0].givenName : null,
      // personalFormValues.middleName = (this.provider.person?.names[0]) ? this.provider.person?.names[0].middleName : null,
      // personalFormValues.familyName = (this.provider.person?.names[0]) ? this.provider.person?.names[0].familyName : null,
      personalFormValues.givenName = (this.provider.person?.preferredName) ? this.provider.person?.preferredName.givenName : null,
      personalFormValues.middleName = (this.provider.person?.preferredName) ? this.provider.person?.preferredName.middleName : null,
      personalFormValues.familyName = (this.provider.person?.preferredName) ? this.provider.person?.preferredName.familyName : null,
      personalFormValues.gender = (this.provider.person?.gender) ? this.provider.person?.gender : null,
      personalFormValues.birthdate = (this.provider.person?.birthdate) ? moment(this.provider.person?.birthdate).format('YYYY-MM-DD') : null,
      personalFormValues.age = (this.provider.person?.age) ? this.provider.person?.age : null
      this.providerAttributeTypes.forEach((attrType: any) => {
        switch (attrType.display) {
          case 'address':

            break;
          case 'consultationLanguage':
            professionalFormValues.consultationLanguage = this.getAttributeValue(attrType.uuid, attrType.display)?.split(',');
            break;
          case 'countryCode':
            personalFormValues.countryCode1 = this.getAttributeValue(attrType.uuid, attrType.display);
            personalFormValues.countryCode2 = this.getAttributeValue(attrType.uuid, attrType.display);
            break;
          case 'emailId':
            personalFormValues.emailId = this.getAttributeValue(attrType.uuid, attrType.display);
            break;
          case 'fontOfSign':
            personalFormValues.fontOfSign = this.getAttributeValue(attrType.uuid, attrType.display);
            break;
          case 'phoneNumber':
            personalFormValues.phoneNumber = this.getAttributeValue(attrType.uuid, attrType.display);
            (personalFormValues.phoneNumber) ? this.phoneNumberValid = true : this.phoneNumberValid = false;
            this.oldPhoneNumber = this.getAttributeValue(attrType.uuid, attrType.display);
            break;
          case 'qualification':

            break;
          case 'registrationNumber':
            professionalFormValues.registrationNumber = this.getAttributeValue(attrType.uuid, attrType.display);
            break;
          case 'researchExperience':
            professionalFormValues.researchExperience = this.getAttributeValue(attrType.uuid, attrType.display);
            break;
          case 'signature':
            personalFormValues.signature = this.getAttributeValue(attrType.uuid, attrType.display);
            break;
          case 'signatureType':
            this.signatureType = this.getAttributeValue(attrType.uuid, attrType.display);
            personalFormValues.signatureType = this.signatureType;
            break;
          case 'specialization':
            professionalFormValues.specialization = this.getAttributeValue(attrType.uuid, attrType.display);
            break;
          case 'textOfSign':
            personalFormValues.textOfSign = this.getAttributeValue(attrType.uuid, attrType.display);
            break;
          case 'typeOfProfession':
            professionalFormValues.typeOfProfession = this.getAttributeValue(attrType.uuid, attrType.display);
            break;
          case 'whatsapp':
            personalFormValues.whatsapp = this.getAttributeValue(attrType.uuid, attrType.display);
            (personalFormValues.whatsapp) ? this.whatsAppNumberValid = true : this.whatsAppNumberValid = false;
            break;
          case 'workExperience':
            professionalFormValues.workExperience = this.getAttributeValue(attrType.uuid, attrType.display);
            break;
          case 'workExperienceDetails':
            professionalFormValues.workExperienceDetails = this.getAttributeValue(attrType.uuid, attrType.display);
            break;
          default:
            break;
        }
      });
      this.personalInfoForm.patchValue(personalFormValues);
      if (personalFormValues.phoneNumber) this.validateProviderAttribute('phoneNumber');
      this.professionalInfoForm.patchValue(professionalFormValues);
      let signature = this.personalInfoForm.value.signature;
      switch (this.signatureType) {
        case 'Draw':
          this.signaturePad.clear();
          this.signaturePad.fromDataURL(signature);
          break;
        case 'Generate':

          break;
        case 'Upload':
          this.signaturePicUrl = signature;
          fetch(signature)
            .then(res => res.blob())
            .then(blob => {
              this.signatureFile = new File([blob], "inetelehealth", { type: this.detectMimeType(signature.split(',')[0]) });
            });
          break;
        default:
          break;
      }
    }
  }

  getAttributeValue(uuid: string, display: string) {
    let attrValue = null;
    for (let i = 0; i < this.provider.attributes.length; i++) {
      if (this.provider.attributes[i].attributeType.display == display && this.provider.attributes[i].attributeType.uuid == uuid && this.provider.attributes[i].voided == false) {
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
      console.log(this.file.name);
      if (!this.file.name.endsWith('.jpg') && !this.file.name.endsWith('.jpeg')) {
        this.toastr.warning(this.translateService.instant("Upload JPG/JPEG format image only."), this.translateService.instant("Upload error!"));
        return;
      }
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.profilePicUrl = reader.result;
        let imageBolb = reader.result.toString().split(',');
        let payload = {
          person: this.provider.person.uuid,
          base64EncodedImage: imageBolb[1]
        }
        this.profileService.updateProfileImage(payload).subscribe((res: any) => {
          this.toastr.success(this.translateService.instant("Profile picture uploaded successfully!"), this.translateService.instant("Profile Pic Uploaded"));
        });
      }
      reader.readAsDataURL(this.file);
    }
  }

  onImgError(event: any) {
    event.target.src = 'assets/svgs/user.svg';
  }

  hasError(event: any, errorFor: string) {
    // console.log(event);
    switch (errorFor) {
      case 'phoneNumber':
        this.phoneNumberValid = event;
        break;
      case 'whatsAppNumber':
        this.whatsAppNumberValid = event;
        break;
    }
  }

  getNumber(event: any, changedFor: string) {
    // console.log(event);
    switch (changedFor) {
      case 'phoneNumber':
        this.phoneNumberValid = true;
        this.phoneNumber = event;
        this.validateProviderAttribute('phoneNumber');
        break;
      case 'whatsAppNumber':
        this.whatsAppNumberValid = true;
        this.whatsAppNumber = event;
        break;
    }
  }

  telInputObject(event: any, objectFor: string) {
    // console.log($event);
    switch (objectFor) {
      case 'phoneNumber':
        this.phoneNumberObj = event;
        break;
      case 'whatsAppNumber':
        this.whatsAppObj = event;
        break;
    }
  }

  onCountryChange(event: any, changedFor: string) {
    // console.log(event);
    switch (changedFor) {
      case 'phoneNumber':
        this.phoneNumberValid = false;
        this.phoneNumberObj.setCountry(event.iso2);
        this.personalInfoForm.patchValue({ countryCode1: event?.dialCode });
        this.maxTelLegth1 = this.authService.getInternationalMaskByCountryCode(event.iso2.toUpperCase(), false).filter((o) => o != ' ').length;
        break;
      case 'whatsAppNumber':
        this.whatsAppNumberValid = false;
        this.whatsAppObj.setCountry(event.iso2);
        this.personalInfoForm.patchValue({ countryCode2: event?.dialCode });
        this.maxTelLegth2 = this.authService.getInternationalMaskByCountryCode(event.iso2.toUpperCase(), false).filter((o) => o != ' ').length;
        break;
    }
  }

  clearSignature() {
    this.signaturePad.clear();
  }

  drawComplete() {
    // will be notified of szimek/signature_pad's onEnd event
    console.log(this.signaturePad.toDataURL());
  }

  drawStart() {
    // will be notified of szimek/signature_pad's onBegin event
    console.log('begin drawing');
  }

  signatureTabChanged(event: any) {
    this.selectedSignatureTabIndex = event.index;
    this.signatureType = event.tab.textLabel;
    this.personalInfoForm.patchValue({ signatureType: event.tab.textLabel });
  }

  onFilesDropped(event: any) {
    if (event.addedFiles.length) {
      this.signatureFile = event.addedFiles[0];
      let filename = this.signatureFile.name;
      if (!filename.endsWith('.png') || filename.endsWith('.jgp') || filename.endsWith('.jpeg')) {
        this.reset();
        alert("Please upload png, jpg or jpeg file only.");
        return;
      }
      const fileReader = new FileReader();
      fileReader.onload = () => {
        this.signaturePicUrl = fileReader.result;
      }
      fileReader.onerror = (error) => {
        console.log(error);
        this.reset();
      }
      fileReader.readAsDataURL(this.signatureFile);
    }
    if (event.rejectedFiles.length) {
      if (event.rejectedFiles[0].reason == 'size') {
        this.toastr.error(this.translateService.instant('Upload a scanned image of your signature. having size (5kb to 50kb)'), this.translateService.instant('Invalid File!'));
      }
      if (event.rejectedFiles[0].reason == 'type') {
        this.toastr.error(this.translateService.instant('Upload a scanned image of your signature. having type png, jpg, jpeg only.'), this.translateService.instant('Invalid File!'));
      }
    }
  }

  reset() {
    this.signatureFile = undefined;
    this.signaturePicUrl = '';
  }

  goToNextStep() {
    this.submitted = true;
    if (this.personalInfoForm.invalid || !this.phoneNumberValid || !this.whatsAppNumberValid || !this.phoneValid) {
      return;
    }
    if (this.selectedSignatureTabIndex == 0 && this.signaturePad.isEmpty()) {
      this.toastr.warning(this.translateService.instant("Please draw your signature."), this.translateService.instant("Draw Signature"));
      return;
    }
    if (this.selectedSignatureTabIndex == 2 && !this.signatureFile) {
      this.toastr.warning(this.translateService.instant("Please upload signature."), this.translateService.instant("Upload Signature"));
      return;
    }
    this.stepper.next();
    this.submitted = false;
  }

  updateProfile() {
    this.submitted = true;
    if (this.professionalInfoForm.invalid) {
      return;
    }

    let pf1 = this.personalInfoForm.value;

    this.providerService.updatePerson(this.provider.person.uuid, pf1.gender, pf1.age, pf1.birthdate).subscribe(res1 => {
      // console.log(res1);
      if (this.provider.person?.preferredName) {
        this.providerService.updatePersonName(this.provider.person.uuid, this.provider.person?.preferredName.uuid, pf1.givenName, pf1.middleName, pf1.familyName).subscribe(res2 => {
          // console.log(res2);
          this.updateSignature();
        });
      } else {
        this.providerService.createPersonName(this.provider.person.uuid, pf1.givenName, pf1.middleName, pf1.familyName).subscribe(res2 => {
          // console.log(res2);
          this.updateSignature();
        });
      }
    });
    this.submitted = false;
  }

  updateSignature() {
    let signature: string;

    switch (this.signatureType) {
      case 'Draw':
        signature = this.signaturePad.toDataURL("image/jpeg");
        this.providerService.uploadSignature(signature.split(',')[1], this.provider.uuid).subscribe((res: any) => {
          this.personalInfoForm.patchValue({ signature });
          this.updateProviderAttributes();
        });
        break;

      case 'Generate':
        this.providerService.creatSignature(this.provider.uuid, this.getAttributeValueFromForm('textOfSign'), this.getAttributeValueFromForm('fontOfSign')).subscribe((res: any) => {
          if (res.fname) {
            fetch(res.fname).then(res => res.blob()).then(blob => {
              let reader = new FileReader();
              reader.onload = () => {
                signature = reader.result.toString();
                this.personalInfoForm.patchValue({ signature });
                this.updateProviderAttributes();
              }
              reader.readAsDataURL(blob);
            });
          }
        });
        break;

      case 'Upload':
        signature = this.signaturePicUrl;
        this.providerService.uploadSignature(signature.split(',')[1], this.provider.uuid).subscribe((res: any) => {
          this.personalInfoForm.patchValue({ signature });
          this.updateProviderAttributes();
        });
        break;

      default:
        break;
    }
  }

  updateProviderAttributes() {
    let requests = [];
    this.providerAttributeTypes.forEach((attrType: any) => {
      switch (attrType.display) {
        case 'address':
          break;
        case 'consultationLanguage':
          requests.push(this.providerService.addOrUpdateProviderAttribute(this.provider.uuid, this.getAttributeUuid(attrType.uuid, attrType.display), attrType.uuid, this.getAttributeValueFromForm(attrType.display).toString()));
          break;
        case 'countryCode':
          requests.push(this.providerService.addOrUpdateProviderAttribute(this.provider.uuid, this.getAttributeUuid(attrType.uuid, attrType.display), attrType.uuid, this.getAttributeValueFromForm('countryCode1')));
          break;
        case 'emailId':
          requests.push(this.providerService.addOrUpdateProviderAttribute(this.provider.uuid, this.getAttributeUuid(attrType.uuid, attrType.display), attrType.uuid, this.getAttributeValueFromForm(attrType.display)));
          break;
        case 'fontOfSign':
          requests.push(this.providerService.addOrUpdateProviderAttribute(this.provider.uuid, this.getAttributeUuid(attrType.uuid, attrType.display), attrType.uuid, this.getAttributeValueFromForm(attrType.display)));
          break;
        case 'phoneNumber':
          requests.push(this.providerService.addOrUpdateProviderAttribute(this.provider.uuid, this.getAttributeUuid(attrType.uuid, attrType.display), attrType.uuid, this.getAttributeValueFromForm(attrType.display)));
          break;
        case 'qualification':
          break;
        case 'registrationNumber':
          requests.push(this.providerService.addOrUpdateProviderAttribute(this.provider.uuid, this.getAttributeUuid(attrType.uuid, attrType.display), attrType.uuid, this.getAttributeValueFromForm(attrType.display)));
          break;
        case 'researchExperience':
          requests.push(this.providerService.addOrUpdateProviderAttribute(this.provider.uuid, this.getAttributeUuid(attrType.uuid, attrType.display), attrType.uuid, this.getAttributeValueFromForm(attrType.display)));
          break;
        case 'signature':
          requests.push(this.providerService.addOrUpdateProviderAttribute(this.provider.uuid, this.getAttributeUuid(attrType.uuid, attrType.display), attrType.uuid, this.getAttributeValueFromForm(attrType.display)));
          break;
        case 'signatureType':
          requests.push(this.providerService.addOrUpdateProviderAttribute(this.provider.uuid, this.getAttributeUuid(attrType.uuid, attrType.display), attrType.uuid, this.getAttributeValueFromForm(attrType.display)));
          break;
        case 'specialization':
          requests.push(this.providerService.addOrUpdateProviderAttribute(this.provider.uuid, this.getAttributeUuid(attrType.uuid, attrType.display), attrType.uuid, this.getAttributeValueFromForm(attrType.display)));
          break;
        case 'textOfSign':
          requests.push(this.providerService.addOrUpdateProviderAttribute(this.provider.uuid, this.getAttributeUuid(attrType.uuid, attrType.display), attrType.uuid, this.getAttributeValueFromForm(attrType.display)));
          break;
        case 'typeOfProfession':
          requests.push(this.providerService.addOrUpdateProviderAttribute(this.provider.uuid, this.getAttributeUuid(attrType.uuid, attrType.display), attrType.uuid, this.getAttributeValueFromForm(attrType.display)));
          break;
        case 'whatsapp':
          requests.push(this.providerService.addOrUpdateProviderAttribute(this.provider.uuid, this.getAttributeUuid(attrType.uuid, attrType.display), attrType.uuid, this.getAttributeValueFromForm(attrType.display)));
          break;
        case 'workExperience':
          requests.push(this.providerService.addOrUpdateProviderAttribute(this.provider.uuid, this.getAttributeUuid(attrType.uuid, attrType.display), attrType.uuid, this.getAttributeValueFromForm(attrType.display)));
          break;
        case 'workExperienceDetails':
          requests.push(this.providerService.addOrUpdateProviderAttribute(this.provider.uuid, this.getAttributeUuid(attrType.uuid, attrType.display), attrType.uuid, this.getAttributeValueFromForm(attrType.display)));
          break;
        default:
          break;
      }
    });
    this.providerService.requestDataFromMultipleSources(requests).subscribe((responseList: any) => {
      // console.log(responseList);
      if (this.personalInfoForm.get('phoneNumber').dirty && this.oldPhoneNumber != this.getAttributeValueFromForm('phoneNumber')) {
        this.toastr.success(this.translateService.instant("Profile has been updated successfully"), this.translateService.instant("Profile Updated"));
        this.toastr.warning(this.translateService.instant("Kindly re-login to see updated details"), this.translateService.instant("Re-login"));
        this.cookieService.delete('app.sid', '/');
        this.authService.logOut();
      } else {
        this.authService.getProvider(JSON.parse(localStorage.user).uuid).subscribe((provider: any) => {
          if (provider.results.length) {
            localStorage.setItem('provider', JSON.stringify(provider.results[0]));
            localStorage.setItem("doctorName", provider.results[0].person.display);
            let u = JSON.parse(localStorage.user);
            u.person.display = provider.results[0].person.display;
            localStorage.setItem("user", JSON.stringify(u));
            this.toastr.success(this.translateService.instant("Profile has been updated successfully"), this.translateService.instant("Profile Updated"));
            let role = this.rolesService.getRole('ORGANIZATIONAL: SYSTEM ADMINISTRATOR');
            if (role) {
              this.router.navigate(['/admin']);
            } else {
              this.router.navigate(['/dashboard']);
            }
          }
        });
      }
    });
  }

  getAttributeUuid(uuid: string, display: string) {
    let attrUuid = null;
    for (let i = 0; i < this.provider.attributes.length; i++) {
      if (this.provider.attributes[i].attributeType.display == display && this.provider.attributes[i].attributeType.uuid == uuid && this.provider.attributes[i].voided == false) {
        attrUuid = this.provider.attributes[i].uuid;
        break;
      }
    }
    return attrUuid;
  }

  getAttributeValueFromForm(key: string) {
    const formValue = { ...this.personalInfoForm.value, ...this.professionalInfoForm.value };
    return formValue[key];
  }

  detectMimeType(b64: string) {
    return this.profileService.detectMimeType(b64);
  }

  validateProviderAttribute(type: string) {
    this.checkingPhoneValidity = true;
    this.authService.validateProviderAttribute(type, this.personalInfoForm.value[type], this.provider.uuid).subscribe(res => {
      if (res.success) {
        (type == 'phoneNumber') ? this.phoneValid = res.data : this.emailValid = res.data;
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
