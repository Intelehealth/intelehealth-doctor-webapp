import { Component, ElementRef, ViewChild } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import * as moment from 'moment';
import SignaturePad from 'signature_pad';
import { SessionService } from 'src/app/services/session.service';
declare var getFromStorage:any, saveToStorage:any;

@Component({
  selector: 'app-personal-information',
  templateUrl: './personal-information.component.html',
  styleUrls: ['./personal-information.component.scss']
})
export class PersonalInformationComponent{
  @ViewChild('canvas') canvasEl: ElementRef;
  signatureImg: string;
  signaturePad: SignaturePad;
  moveTo: boolean = false;
  userDetails;
  profileForm: FormGroup;
  
  constructor(private sessionService : SessionService) {
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
    )
   });
  }

  ngOnInit(): void {
    this.userDetails = getFromStorage("user");
    this.sessionService
    .provider(this.userDetails.uuid)
    .subscribe((provider) => {
     saveToStorage("provider",  provider.results[0]);
      this.setUserDetails(true);
    });
  }

  ngAfterViewInit() {
    this.signaturePad = new SignaturePad(this.canvasEl.nativeElement);
  }

  startDrawing(event: Event) {
    console.log(event);
  }

  clearPad() {
    this.signaturePad.clear();
  }

  toggleCollapse(){
    this.moveTo = !this.moveTo;
  }

  onToggleBack(data:boolean){
    this.moveTo = data;
  }

  private setUserDetails(flag?) {
    this.userDetails = getFromStorage('provider');
    this.userDetails.person.birthdate = moment(this.userDetails.person.birthdate).format("YYYY-MM-DD");
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
      this.userDetails[attribute.attributeType.display] = {
        value: attribute.value,
        uuid: attribute.uuid,
      };
    });
    if(flag) this.updateFormValue(this.userDetails);
  }

  updateFormValue(data: any) {
    this.profileForm?.setValue({
      firstName: data.firstName,
      middleName: data.middleName,
      lastName: data.lastName,
      gender: data.person.gender,
      birthDate: data.person.birthdate,
      age: data.person.age,
      phoneNumber: data.phoneNumber.value,
      whatsapp: data.whatsapp.value,
      emailId: data.emailId.value
    });
  }
}
