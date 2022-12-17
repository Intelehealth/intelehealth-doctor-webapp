import { Component, OnInit, EventEmitter, Output, Input } from '@angular/core';
import {FormControl, FormGroup} from '@angular/forms';
import { ProfileService } from 'src/app/services/profile.service';

@Component({
  selector: 'app-professional-details',
  templateUrl: './professional-details.component.html',
  styleUrls: ['./professional-details.component.scss']
})
export class ProfessionalDetailsComponent implements OnInit {
  @Input() newUserDetails;
  @Input() userDetails;
  @Output() onToggleBack: EventEmitter<boolean> = new EventEmitter();
  
  disableSelect = new FormControl(false);
  toppingList: string[] = ['Hindi', 'English', 'Gujrati', 'Tamil', 'Bangla'];
  specializations = [
    "General Physician",
    "Dermatologist",
    "Physiotherapist",
    "Gynecologist",
    "Pediatrician"
  ];
  moveTo: boolean = false;
  professionalForm: FormGroup;
  selected = []; selected1=[];
  constructor(private profileService: ProfileService) {
   }

  ngOnInit(): void {
    this.setUserDetails();
    this.professionalForm = new FormGroup({
      typeOfProfession: new FormControl(
        this.userDetails?.typeOfProfession ? this.userDetails.typeOfProfession.value : null
      ),
      registrationNumber: new FormControl(
        this.userDetails?.registrationNumber ? this.userDetails.registrationNumber.value : null
      ),
      specialization: new FormControl(
        this.userDetails?.specialization ? this.userDetails.specialization.value : null
      ),
      consultationLanguage: new FormControl(
        this.userDetails?.consultationLanguage ? this.userDetails.consultationLanguage.value : []
      ),
      workExperience: new FormControl(
        this.userDetails?.workExperience ? this.userDetails.workExperience.value : null
      ),
      researchExperience: new FormControl(
        this.userDetails?.researchExperience ? this.userDetails.researchExperience.value : []
      ),
      workExperienceDetails: new FormControl(
        this.userDetails?.workExperienceDetails ? this.userDetails.workExperienceDetails.value : null
      )
    });
  }

  private setUserDetails() {
    this.userDetails?.attributes.forEach((attribute) => {
      this.userDetails[attribute.attributeType.display] = {
        value: attribute.value,
        uuid: attribute.uuid,
      };
      if(attribute.attributeType.display === "researchExperience") {
        this.selected1.push(attribute.value);
      }
      if(attribute.attributeType.display === "consultationLanguage") {
        this.selected.push(attribute.value);
      }
    });
    console.log("newUserDetails", this.newUserDetails);
    console.log("userDetails", this.userDetails);
  }

  toggleBack(){
    this.onToggleBack.emit(false);
  }

  save(){
    let professionalFormValues =  this.professionalForm.value;
    if ((this.newUserDetails.gender !== null && this.newUserDetails.gender !== this.userDetails.person.gender) ||
    this.newUserDetails.birthDate !== null && this.newUserDetails.birthDate !== this.userDetails.person.birthdate) {
     this.profileService.updateGenderAndBirthDate(this.userDetails.person.uuid, this.newUserDetails.gender, this.newUserDetails.birthDate)
     .subscribe(() => { })
    }

    if ((this.newUserDetails.firstName !== null && this.newUserDetails.firstName !== this.userDetails.firstName) ||
    (this.newUserDetails.middleName !== null && this.newUserDetails.middleName !== this.userDetails.middleName) ||
    this.newUserDetails.lastName !== null && this.newUserDetails.lastName !== this.userDetails.lastName) {
  
     this.profileService.updateName(this.userDetails.person.uuid,this.newUserDetails.firstName, this.newUserDetails.middleName , this.newUserDetails.lastName, this.userDetails.nameUuid)
     .subscribe(() => { })
    }

    if (this.newUserDetails.emailId !== null && this.newUserDetails.emailId !== this.userDetails?.emailId?.value) {
      this.updateAttribute( this.userDetails.emailId, "226c0494-d67e-47b4-b7ec-b368064844bd", this.newUserDetails.emailId);
    }

    if (this.newUserDetails.phoneNumber !== null && this.newUserDetails.phoneNumber !== this.userDetails?.phoneNumber?.value) {
      this.updateAttribute( this.userDetails.phoneNumber, "e3a7e03a-5fd0-4e6c-b2e3-938adb3bbb37", this.newUserDetails.phoneNumber);
    }

    if (this.newUserDetails.whatsapp !== null && this.newUserDetails.whatsapp !== this.userDetails?.whatsapp?.value) {
      this.updateAttribute( this.userDetails.whatsapp, "fccc49f1-49ca-44bb-9e61-21c88ae6dd64", this.newUserDetails.whatsapp);
    }

    if (professionalFormValues.registrationNumber !== null && professionalFormValues.registrationNumber !== this.userDetails?.registrationNumber?.value) {
      this.updateAttribute( this.userDetails.emailId, "992ccbdd-201a-44ef-8abb-c2eee079886d", professionalFormValues.registrationNumber);
    }

    if (professionalFormValues.specialization !== null && professionalFormValues.specialization !== this.userDetails?.specialization?.value) {
      this.updateAttribute( this.userDetails.specialization,"ed1715f5-93e2-404e-b3c9-2a2d9600f062", professionalFormValues.specialization);
    }

    if (professionalFormValues.typeOfProfession !== null && professionalFormValues.typeOfProfession !== this.userDetails?.typeOfProfession?.value) {
      this.updateAttribute( this.userDetails.typeOfProfession, "61ae7fb9-f216-4784-a700-9daddd7aa4ed", professionalFormValues.typeOfProfession);
    }

    if (professionalFormValues.consultationLanguage !== null && professionalFormValues.consultationLanguage !== this.userDetails?.consultationLanguage?.value) {
     // this.updateAttribute( this.userDetails.consultationLanguage, "c1d6df5d-882c-4edf-86d6-823bdae98caa", professionalFormValues.consultationLanguage);
    }

    if (professionalFormValues.workExperience !== null && professionalFormValues.workExperience !== this.userDetails?.workExperience?.value) {
      this.updateAttribute( this.userDetails.workExperience, "e4c35cd7-1c06-4d47-9f40-641e35fada4c", professionalFormValues.workExperience);
    }

    if (professionalFormValues.researchExperience !== null && professionalFormValues.researchExperience !== this.userDetails?.researchExperience?.value) {
      // professionalFormValues.researchExperience.forEach(selected => {
      //   let selectedSpeciality = this.userDetails?.researchExperience?.find((m) => m.value.includes(selected));
      //   if (!selectedSpeciality) {
      //     this.updateAttribute( this.userDetails.researchExperience, "86318ff8-25ca-445a-830f-2981e9d3ca46",selected);
      //   }
      // });
    }

    if (professionalFormValues.workExperienceDetails !== null && professionalFormValues.workExperienceDetails !== this.userDetails?.workExperienceDetails?.value) {
      this.updateAttribute( this.userDetails.workExperienceDetails, "c2404185-133f-4aef-aa03-32a1ec7ee1ae", professionalFormValues.workExperienceDetails);
    }
    setTimeout(() => window.location.reload(), 2000);
  }

  private updateAttribute(attribute, attributeUuid, updatedAttribute) {
    let flag = attribute ? true : false;
    this.profileService.updateProviderAttribute(this.userDetails.uuid, attributeUuid, updatedAttribute, flag, attribute?.uuid)
      .subscribe((response) => { });
  }
}
