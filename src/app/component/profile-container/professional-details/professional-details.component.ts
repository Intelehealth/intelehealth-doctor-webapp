import { Component, OnInit, EventEmitter, Output, Input } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import * as moment from 'moment';
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
  selected = []; selected1 = [];
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
    this.userDetails["researchExperience1"] = [], this.userDetails["consultationLanguage1"] = [];
    this.userDetails?.attributes?.forEach((attribute) => {
      this.userDetails[attribute.attributeType.display] = {
        value: attribute.value,
        uuid: attribute.uuid      
      };
      if (attribute.attributeType.display === "researchExperience" && !attribute.voided) {
        this.userDetails["researchExperience1"].push({ value: attribute.value, uuid: attribute.uuid });
        this.selected1.push(attribute.value);
      }
      if (attribute.attributeType.display === "consultationLanguage" && !attribute.voided) {
        this.userDetails["consultationLanguage1"].push({ value: attribute.value, uuid: attribute.uuid })
        this.selected.push(attribute.value);
      }
    });
  }

  toggleBack() {
    this.onToggleBack.emit(false);
  }

  save() {
    let professionalFormValues = this.professionalForm.value;
    if ((this.newUserDetails.gender !== null && this.newUserDetails.gender !== this.userDetails.person.gender) ||
      this.newUserDetails.birthDate !== null && this.newUserDetails.birthDate !== this.userDetails.person.birthdate) {
      this.profileService.updateGenderAndBirthDate(this.userDetails.person.uuid, this.newUserDetails.gender, moment(new Date(this.newUserDetails.birthDate.toString())).format("YYYY-MM-DD"))
        .subscribe(() => { })
    }

    if ((this.newUserDetails.firstName !== null && this.newUserDetails.firstName !== this.userDetails.firstName) ||
      (this.newUserDetails.middleName !== null && this.newUserDetails.middleName !== this.userDetails.middleName) ||
      this.newUserDetails.lastName !== null && this.newUserDetails.lastName !== this.userDetails.lastName) {
      this.profileService.getPersonName(this.userDetails.person.uuid)
        .subscribe((response) => {
          this.profileService.updateName(this.userDetails.person.uuid, this.newUserDetails.firstName, this.newUserDetails.middleName,
            this.newUserDetails.lastName, response?.results[0]?.uuid)
            .subscribe(() => { })
        });
    }

    if (this.newUserDetails.emailId !== null && this.newUserDetails.emailId !== this.userDetails?.emailId?.value) {
      this.updateAttribute(this.userDetails.emailId, "226c0494-d67e-47b4-b7ec-b368064844bd", this.newUserDetails.emailId);
    }

    if (this.newUserDetails.phoneNumber !== null && this.newUserDetails.phoneNumber !== this.userDetails?.phoneNumber?.value) {
      this.updateAttribute(this.userDetails.phoneNumber, "e3a7e03a-5fd0-4e6c-b2e3-938adb3bbb37", this.newUserDetails.phoneNumber?.toString());
    }

    if (this.newUserDetails.whatsapp !== null && this.newUserDetails.whatsapp !== this.userDetails?.whatsapp?.value) {
      this.updateAttribute(this.userDetails.whatsapp, "fccc49f1-49ca-44bb-9e61-21c88ae6dd64", this.newUserDetails.whatsapp?.toString());
    }

    if (this.newUserDetails.countryCode !== null && this.newUserDetails.countryCode !== this.userDetails?.countryCode?.value) {
      this.updateAttribute(this.userDetails?.countryCode, "2d4d8e6d-21c4-4710-a3ad-4daf5c0dfbbb", this.newUserDetails.countryCode);
    }

    if (professionalFormValues.registrationNumber !== null && professionalFormValues.registrationNumber !== this.userDetails?.registrationNumber?.value) {
      this.updateAttribute(this.userDetails?.registrationNumber, "992ccbdd-201a-44ef-8abb-c2eee079886d", professionalFormValues.registrationNumber);
    }

    if (professionalFormValues.specialization !== null && professionalFormValues.specialization !== this.userDetails?.specialization?.value) {
      this.updateAttribute(this.userDetails.specialization, "ed1715f5-93e2-404e-b3c9-2a2d9600f062", professionalFormValues.specialization);
    }

    if (professionalFormValues.typeOfProfession !== null && professionalFormValues.typeOfProfession !== this.userDetails?.typeOfProfession?.value) {
      this.updateAttribute(this.userDetails.typeOfProfession, "61ae7fb9-f216-4784-a700-9daddd7aa4ed", professionalFormValues.typeOfProfession);
    }

    if (professionalFormValues.consultationLanguage !== null && professionalFormValues.consultationLanguage !== this.userDetails?.consultationLanguage?.value) {
      professionalFormValues.consultationLanguage.forEach(selected => {
        let selectedExp = this.userDetails?.consultationLanguage1?.find((m) => m.value.includes(selected));
        if (!selectedExp) {
          this.updateAttribute(null, "c1d6df5d-882c-4edf-86d6-823bdae98caa", selected);
        }
      });
      let deletedExp = this.userDetails?.consultationLanguage1?.filter(x => !professionalFormValues.consultationLanguage.includes(x.value));
      if (deletedExp && deletedExp.length > 0) {
        deletedExp.forEach(element => {
          this.profileService.deleteProviderAttribute(this.userDetails.uuid, element.uuid)
            .subscribe(() => { });
        });
      }
    }

    if (professionalFormValues.workExperience !== null && professionalFormValues.workExperience !== this.userDetails?.workExperience?.value) {
      this.updateAttribute(this.userDetails.workExperience, "e4c35cd7-1c06-4d47-9f40-641e35fada4c", professionalFormValues.workExperience);
    }

    if (professionalFormValues.researchExperience !== null) {
      professionalFormValues.researchExperience.forEach(selected => {
        let selectedExp = this.userDetails?.researchExperience1?.find((m) => m.value.includes(selected));
        if (!selectedExp) {
          this.updateAttribute(null, "86318ff8-25ca-445a-830f-2981e9d3ca46", selected);
        }
      });
      let deletedExp = this.userDetails?.researchExperience1?.filter(x => !professionalFormValues.researchExperience.includes(x.value));
      if (deletedExp && deletedExp.length > 0) {
        deletedExp.forEach(element => {
          this.profileService.deleteProviderAttribute(this.userDetails.uuid, element.uuid)
            .subscribe(() => { });
        });
      }
    }

    if (professionalFormValues.workExperienceDetails !== null && professionalFormValues.workExperienceDetails !== this.userDetails?.workExperienceDetails?.value) {
      this.updateAttribute(this.userDetails.workExperienceDetails, "c2404185-133f-4aef-aa03-32a1ec7ee1ae", professionalFormValues.workExperienceDetails);
    }

    if (this.newUserDetails.signature !== null && this.newUserDetails.signatureText !== null) {
      this.profileService.creatSignature(this.userDetails.uuid, this.newUserDetails.signatureText, this.newUserDetails.signature)
        .subscribe((res) => { 
          this.updateAttribute(null, "1d1c9e99-48cf-4e0e-9294-89ab81d7652a", 'Generate');
        })
    }

    if (this.newUserDetails.signature !== null && this.newUserDetails.signatureText === null) {
      this.profileService.updateSignature(this.newUserDetails.signature.file, this.newUserDetails.signature.providerid)
        .subscribe((res) => { 
          this.updateAttribute(null, "1d1c9e99-48cf-4e0e-9294-89ab81d7652a", this.newUserDetails.signature?.type);
        })
    }
    setTimeout(() => window.location.reload(), 2000);
  }

  private updateAttribute(attribute, attributeUuid, updatedAttribute) {
    let flag = attribute ? true : false;
    this.profileService.updateProviderAttribute(this.userDetails.uuid, attributeUuid, updatedAttribute, flag, attribute?.uuid)
      .subscribe(() => { });
  }
}
