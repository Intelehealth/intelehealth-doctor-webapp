import { Component, ElementRef, ViewChild } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatTabChangeEvent } from '@angular/material/tabs';
import * as moment from 'moment';
import SignaturePad from 'signature_pad';
import { ProfileService } from 'src/app/services/profile.service';
import { SessionService } from 'src/app/services/session.service';
declare var getFromStorage: any, saveToStorage: any;

@Component({
  selector: 'app-personal-information',
  templateUrl: './personal-information.component.html',
  styleUrls: ['./personal-information.component.scss']
})
export class PersonalInformationComponent {
  @ViewChild('canvas') canvasEl: ElementRef;
  signatureImgName: string;
  signaturePad: SignaturePad;
  moveTo: boolean = false;
  userDetails;
  profileForm: FormGroup;
  sign = getFromStorage("doctorName");
  isSignaturePresent: boolean = false;
  signatureURL;
  signatureType: string = "Draw";
  currentTabIndex = 0;

  constructor(private sessionService: SessionService, private profileService: ProfileService) {
    this.setUserDetails();
    this.profileForm = new FormGroup({
      firstName: new FormControl(
        this.userDetails?.firstName ? this.userDetails.firstName : null,
        Validators.required
      ),
      middleName: new FormControl(
        this.userDetails?.middleName ? this.userDetails.middleName : null,
        Validators.required
      ),
      lastName: new FormControl(
        this.userDetails?.lastName ? this.userDetails.lastName : null,
        Validators.required
      ),
      gender: new FormControl(
        this.userDetails?.person ? this.userDetails.person.gender : null,
        Validators.required
      ),
      birthDate: new FormControl(
        this.userDetails?.person ? this.userDetails.person.birthdate : null
      ),
      age: new FormControl(
        this.userDetails?.person ? this.userDetails.person.age : null
      ),
      phoneNumber: new FormControl(
        this.userDetails?.phoneNumber ? this.userDetails.phoneNumber.value : null,
        [Validators.required, Validators.pattern("^[0-9]{10,12}$")]
      ),
      whatsapp: new FormControl(
        this.userDetails?.whatsapp ? this.userDetails.whatsapp.value : null,
        [Validators.required, Validators.pattern("^[0-9]{10,12}$")]
      ),
      emailId: new FormControl(
        this.userDetails?.emailId ? this.userDetails.emailId.value : null,
        Validators.required
      ),
      signature: new FormControl(
        this.userDetails?.signature ? this.userDetails.signature : null,

      ),
      signatureText: new FormControl(
        this.userDetails?.signatureText ? this.userDetails.signatureText : null,
        Validators.required
      ),
    });
  }

  ngOnInit(): void {
    this.userDetails = getFromStorage("user");
    this.sessionService
      .provider(this.userDetails.uuid)
      .subscribe((provider) => {
        saveToStorage("provider", provider.results[0]);
        this.setUserDetails(true);
      });
      this.clearPad();
  }

  getSelectedIndex(): number {
    return this.currentTabIndex
  }

  onTabChange(event: MatTabChangeEvent) {
    this.currentTabIndex = event.index
  }

  ngAfterViewInit() {
    this.signaturePad = new SignaturePad(this.canvasEl.nativeElement);
  }

  startDrawing(event: Event) {
    this.signaturePad = new SignaturePad(this.canvasEl.nativeElement);
  }

  clearPad() {
    this.signaturePad?.clear();
    this.profileForm.value.signature = {};
    this.profileForm.value.signatureText = null;
  }

  toggleCollapse() {
    this.moveTo = !this.moveTo;
    if (this.currentTabIndex === 0 && !this.signaturePad.isEmpty()) {
      let json = {
        providerid: this.userDetails.person.uuid,
        file: this.signaturePad.toDataURL(),
        type: "Draw"
      }
      this.profileForm.value.signature = json;
      this.profileForm.value.signatureText = null;
    }
  }

  onToggleBack(data: boolean) {
    this.moveTo = data;
    if (this.currentTabIndex === 0 && !this.signaturePad.isEmpty()) {
      this.signaturePad.fromDataURL(this.profileForm.value.signature.file, { ratio: 1, width: 400, height: 200, xOffset: 100, yOffset: 50 });
    }
  }

  changeFont(event: Event) {
    document.getElementById("signature-dropdown").style.fontFamily = this.profileForm.value.signature;
    document.getElementById("signature-dropdown").style.fontSize = "40px";
  }

  onSelectFile(event) {
    if (event.target.files && event.target.files[0]) {
      this.signatureImgName = event.target.files[0].name;
      var reader = new FileReader();
      reader.readAsDataURL(event.target.files[0]); // read file as data url
      reader.onload = (event) => { // called once readAsDataURL is completed
        let url: any = event.target.result;
        let imageBolb = url.split(',');
        let json = {
          providerid: this.userDetails.person.uuid,
          file: imageBolb[1],
          type: "Upload"
        }
        this.profileForm.value.signature = json;
        this.profileForm.value.signatureText = null;
      }
    }
  }

  private setUserDetails(flag?) {
    this.userDetails = getFromStorage('provider');
    this.userDetails.person.birthdate = this.userDetails.person.birthdate ? moment(this.userDetails.person.birthdate).format("YYYY-MM-DD") : null;
    let name = this.userDetails?.person?.display.split(" ");
    if (name.length == 3) {
      this.userDetails["firstName"] = name[0];
      this.userDetails["middleName"] = name[1];
      this.userDetails["lastName"] = name[2];
    } else {
      this.userDetails["firstName"] = name[0];
      this.userDetails["lastName"] = name[1];
    }
    this.userDetails.attributes.forEach((attribute) => {
      if (!attribute.voided) {
        this.userDetails[attribute.attributeType.display] = {
          value: attribute.value,
          uuid: attribute.uuid,
        };
      }
    });
    this.signatureType = this.userDetails?.signatureType?.value
    if (this.userDetails?.signatureType) {
      this.userDetails.signatureText = this.signatureType;
      this.profileService.getSignture(this.userDetails.person.uuid)
        .subscribe((res) => {
          if (res) {
            this.isSignaturePresent = true;
            this.signatureURL = `${this.profileService.base}/ds/${this.userDetails.person.uuid}_sign.png`
            switch (this.userDetails?.signatureType?.value) {
              case "Draw":
                this.currentTabIndex = 0;
                break;
              case "Generate":
                this.currentTabIndex = 1;
                break;
              case "Upload":
                this.currentTabIndex = 2;
                break;
            }
          }
        });
    }
    if (flag) this.updateFormValue(this.userDetails);
  }

  updateFormValue(data: any) {
    this.profileForm?.setValue({
      firstName: data.firstName,
      middleName: data.middleName,
      lastName: data.lastName,
      gender: data.person.gender,
      birthDate: data.person.birthdate,
      age: data.person.age,
      phoneNumber: data.phoneNumber?.value,
      whatsapp: data.whatsapp?.value,
      emailId: data.emailId?.value,
      signature: null,
      signatureText: data?.signatureText
    });
  }

  clearSign() {
    let existingUuid = this.userDetails?.signatureType.uuid;
    this.profileService.deleteProviderAttribute(this.userDetails.uuid, existingUuid)
      .subscribe(() => {
        this.isSignaturePresent = false;
        this.signatureURL = null;
      });
  }
}
