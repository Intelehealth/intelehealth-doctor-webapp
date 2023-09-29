import { MAT_DIALOG_DATA, MatDialogRef } from "@angular/material/dialog";
import { Component, OnInit, Inject } from "@angular/core";
import { UntypedFormGroup, UntypedFormControl, Validator, Validators } from "@angular/forms";
import { HttpClient } from "@angular/common/http";
import { environment } from "../../../../environments/environment";
import { MatDialog } from "@angular/material/dialog";
import { SignatureComponent } from "../signature/signature.component";
import * as moment from "moment";
declare var getFromStorage: any;

@Component({
  selector: "app-edit-details",
  templateUrl: "./edit-details.component.html",
  styleUrls: ["./edit-details.component.css"],
})
export class EditDetailsComponent implements OnInit {
  baseURL = environment.baseURL;
  baseURLProvider = `${this.baseURL}/provider/${this.data.uuid}/attribute`;
  specializations = ["General Physician"];
  editForm: UntypedFormGroup;
  status = false;
  name = "Enter text";
  userDetails: any;
  providerDetails: any;
  isErrTime: boolean = false;
  constructor(
    @Inject(MAT_DIALOG_DATA) public data,
    private dialogRef: MatDialogRef<EditDetailsComponent>,
    private http: HttpClient,
    private dialog: MatDialog
  ) {
    const timings =
      data?.timings?.value && typeof data?.timings?.value === "string"
        ? data?.timings?.value
        : "";
    const [startTime = null, endTime = null] = timings.split(" - ");
    this.editForm = new UntypedFormGroup({
      aboutMe: new UntypedFormControl(
        this.data.aboutMe && !this.data.aboutMe.voided ? this.data.aboutMe.value : null
      ),
      gender: new UntypedFormControl(
        this.data.person && !this.data.person.voided ? this.data.person.gender : null, [Validators.required]
      ),
      phoneNumber: new UntypedFormControl(
        this.data.phoneNumber && !this.data.phoneNumber.voided ? this.data.phoneNumber.value : null, [Validators.required]
      ),
      whatsapp: new UntypedFormControl(
        this.data.whatsapp && !this.data.whatsapp.voided ? this.data.whatsapp.value : null
      ),
      emailId: new UntypedFormControl(
        this.data.emailId && !this.data.emailId.voided ? this.data.emailId.value : null, [Validators.required]
      ),
      qualification: new UntypedFormControl(
        this.data.qualification && !this.data.qualification.voided ? this.data.qualification.value : null, [Validators.required]
      ),
      specialization: new UntypedFormControl(
        this.data.specialization && !this.data.specialization.voided ? this.data.specialization.value : null, [Validators.required]
      ),
      registrationNumber: new UntypedFormControl(
        this.data.registrationNumber && !this.data.registrationNumber.voided ? this.data.registrationNumber.value : null, [Validators.required]
      ),
      startTime: new UntypedFormControl(startTime, [Validators.required]),
      endTime: new UntypedFormControl(endTime, [Validators.required]),
    });
  }

  ngOnInit() {
    this.userDetails = getFromStorage("user");
    this.providerDetails = getFromStorage("provider");
  }

  get attributes() {
    try {
      return this.providerDetails.attributes;
    } catch (error) {
      return [];
    }
  }

  onClose() {
    this.dialogRef.close();
  }

  /**
   * Open edit signature modal
   */
  editSignature() {
    var obj = {
      name: this.data.textOfSign.value,
      textOfSignuuid: this.data.textOfSign.uuid,
      font: this.data.fontOfSign.value,
      fontOfSignuuid: this.data.fontOfSign.uuid,
      pid: this.data.uuid,
      type: "edit",
    };
    this.dialog.open(SignatureComponent, { width: "500px", data: obj });
  }

  isValidTime(value: any) {
    const { startTime, endTime } = value
    const mst = moment(startTime, "HH:mm a");
    const met = moment(endTime, "HH:mm a");
    return mst.isBefore(met);
  }

  changeTime() {
    this.isErrTime = false;
    const value = this.editForm.value;
    if(!this.isValidTime(value)) {
      this.isErrTime = true;
    }
  }

  /**
   * Take form value from edit details form and update it to the openMRS system
   */
  updateDetails() {
    
    const value = this.editForm.value;
    if(this.isErrTime) {
      return;
    }

    if (value.gender !== null && value.gender !== this.data.person.gender) {
      const URL = `${this.baseURL}/person/${this.data.person.uuid}`;
      const json = {
        gender: value.gender,
      };
      this.http.post(URL, json).subscribe((response) => { });
    }


    if (value.aboutMe !== null) {
      const URL = this.data.aboutMe
        ? `${this.baseURLProvider}/${this.data.aboutMe.uuid}`
        : this.baseURLProvider;
      const json = {
        attributeType: "3b306c2c-9a30-4001-9ffc-e8e182855eff",
        value: value.aboutMe,
      };
      if(value.aboutMe === '') {
        this.http.delete(URL).subscribe((response) => { });
      } else {
        this.http.post(URL, json).subscribe((response) => { });
      }
    }

    if (value.emailId !== null) {
      const URL = this.data.emailId
      ? `${this.baseURLProvider}/${this.data.emailId.uuid}`
      : this.baseURLProvider;
      const json = {
        attributeType: "226c0494-d67e-47b4-b7ec-b368064844bd",
        value: value.emailId,
      };
      this.http.post(URL, json).subscribe((response) => { 
      });
    }

    if (value.phoneNphoneNphoneNumberumberphoneNumberumber !== null) {
      const URL = this.data.phoneNumber
        ? `${this.baseURLProvider}/${this.data.phoneNumber.uuid}`
        : this.baseURLProvider;
      const json = {
        attributeType: "e3a7e03a-5fd0-4e6c-b2e3-938adb3bbb37",
        value: value.phoneNumber.toString(),
      };
      this.http.post(URL, json).subscribe((response) => { });
    }

    if (value.whatsapp !== null) {
      const URL = this.data.whatsapp
        ? `${this.baseURLProvider}/${this.data.whatsapp.uuid}`
        : this.baseURLProvider;
      const json = {
        attributeType: "fccc49f1-49ca-44bb-9e61-21c88ae6dd64",
        value: value.whatsapp.toString(),
      };
      if(value.whatsapp === '') {
        this.http.delete(URL).subscribe((response) => { });
      } else {
        this.http.post(URL, json).subscribe((response) => { });
      }
    }

    if (value.qualification !== null) {
      const URL = this.data.qualification
        ? `${this.baseURLProvider}/${this.data.qualification.uuid}`
        : this.baseURLProvider;
      const json = {
        attributeType: "4246639f-e9a8-48ea-b9ff-629a7c430543",
        value: value.qualification,
      };
      this.http.post(URL, json).subscribe((response) => { });
    }

    if (value.registrationNumber !== null) {
      const URL = this.data.registrationNumber
        ? `${this.baseURLProvider}/${this.data.registrationNumber.uuid}`
        : this.baseURLProvider;
      const json = {
        attributeType: "992ccbdd-201a-44ef-8abb-c2eee079886d",
        value: value.registrationNumber,
      };
      this.http.post(URL, json).subscribe((response) => { });
    }

    if (value.specialization !== null) {
      const URL = this.data.specialization
        ? `${this.baseURLProvider}/${this.data.specialization.uuid}`
        : this.baseURLProvider;
      const json = {
        attributeType: "ed1715f5-93e2-404e-b3c9-2a2d9600f062",
        value: value.specialization,
      };
      this.http.post(URL, json).subscribe((response) => { });
    }

    if (value.startTime !== null || value.endTime !== null) {
      const URL = this.data.timings
        ? `${this.baseURLProvider}/${this.data.timings.uuid}`
        : this.baseURLProvider;
      const json = {
        attributeType: "d03361fb-21ca-4e73-bfa7-2dfe34d5b7f7",
        value: `${value.startTime} - ${value.endTime}`,
      };
      this.http.post(URL, json).subscribe();
    }

    this.onClose();
    setTimeout(() => window.location.reload(), 2000);
  }
}
