import { MAT_DIALOG_DATA, MatDialogRef } from "@angular/material/dialog";
import { Component, OnInit, Inject } from "@angular/core";
import { FormGroup, FormControl } from "@angular/forms";
import { HttpClient } from "@angular/common/http";
import { environment } from "../../../../environments/environment";
import { MatDialog } from "@angular/material/dialog";
import { SignatureComponent } from "../signature/signature.component";
import { Router } from "@angular/router";
import { VisitService } from "src/app/services/visit.service";
import { AuthService } from "src/app/services/auth.service";
declare var getFromStorage: any;

@Component({
  selector: "app-edit-details",
  templateUrl: "./edit-details.component.html",
  styleUrls: ["./edit-details.component.css"],
})
export class EditDetailsComponent implements OnInit {
  baseURL = environment.baseURL;
  baseURLProvider = `${this.baseURL}/provider/${this.data.uuid}/attribute`;
  specializations = [
    "Physician",
    "Doctor (General Consult)",
    "Cardiology",
    "Pulmonary",
    "GI",
    "Endocrinology",
    "Pediatrics",
    "Surgery",
    "Gyn",
    "Admin"
  ];
  locations = [];
  states = [];
  districts = [];
  tempDistricts = [];
  villages = [];
  tempVillages = [];
  state = [];
  district = [];
  village = [];

  editForm = new FormGroup({
    gender: new FormControl(this.data.person ? this.data.person.gender : null),
    phoneNumber: new FormControl(
      this.data.phoneNumber ? this.data.phoneNumber.value : null
    ),
    whatsapp: new FormControl(
      this.data.whatsapp ? this.data.whatsapp.value : null
    ),
    emailId: new FormControl(
      this.data.emailId ? this.data.emailId.value : null
    ),
    qualification: new FormControl(
      this.data.qualification ? this.data.qualification.value : null
    ),
    specialization: new FormControl(
      this.data.specialization ? this.data.specialization.value : null
    ),
    state: new FormControl(null),
    district: new FormControl(null),
    village: new FormControl(null),
    registrationNumber: new FormControl(
      this.data.registrationNumber ? this.data.registrationNumber.value : null
    ),
  });
  status = false;
  name = "Enter text";
  userDetails: any;
  providerDetails: any;
  constructor(
    @Inject(MAT_DIALOG_DATA) public data,
    private dialogRef: MatDialogRef<EditDetailsComponent>,
    private http: HttpClient,
    private dialog: MatDialog,
    private router: Router,
    private visitService: VisitService,
    private authService: AuthService
  ) { }

  ngOnInit() {
    this.userDetails = getFromStorage("user");
    this.providerDetails = getFromStorage("provider");
    this.getLocations();
  }

  getLocations(startIndex: number = 0) {
    this.visitService.getLocations(startIndex).subscribe((res: any) => {
      this.locations = [...this.locations, ...res?.results];
      if (res.links) {
        let flag = 0;
        for (let x = 0; x < res.links.length; x++) {
          if (res.links[x].rel == 'next') {
            flag = 1;
            startIndex += 100;
            this.getLocations(startIndex);
          }
        }
        if (flag == 0) {
          this.states = this.locations.filter((l: any) => l.tags.filter((t: any) => t.display == 'State' ).length);
          this.districts = this.locations.filter((l: any) => l.tags.filter((t: any) => t.display == 'District' ).length);
          this.villages = this.locations.filter((l: any) => l.tags.filter((t: any) => t.display == 'Village' ).length);
          this.editForm.get('state').valueChanges.subscribe((s: any) => {
            if(s) {
              let arr = [];
              for(let dist = 0; dist < s.length; dist++){
                this.districts.filter((l: any)=>{
                  if(l.parentLocation?.uuid == s[dist] || l.uuid == s[dist]){
                    if(!arr.includes(l)){
                      arr.push(l);
                    }
                  }
                });
              }
              this.tempDistricts = arr;
              this.editForm.patchValue({ district: null, village: null });
            } else {
              this.tempDistricts = [];
            }
          });

          this.editForm.get('district').valueChanges.subscribe((d: any) => {
            if(d) {
              this.tempVillages = this.villages.filter((l: any)=> l.parentLocation?.uuid == d[0] || l.uuid == d[0]);
              let arr = [];
              for(let vill = 0; vill < d.length; vill++){
                this.villages.filter((l: any)=>{
                  if(l.parentLocation?.uuid == d[vill] || l.uuid == d[vill]){
                    if(!arr.includes(l)){
                      arr.push(l);
                    }
                  }
                });
              }
              this.tempVillages = arr;
              this.editForm.patchValue({ village: null });
            } else {
              this.tempVillages = [];
            }
          });

          if (this.data.location) {
            for(let id = 0; id < this.data.location.value.split(',').length; id++){
              let village = this.villages.find(v => v.uuid == this.data.location?.value.split(',')[id]);
              let district = this.districts.find(d => d.uuid == village.parentLocation?.uuid || d.uuid == village.uuid);
              let state = this.states.find(s => s.uuid == district.parentLocation?.uuid || s.uuid == district.uuid);
              this.state.push(state.uuid);
              this.district.push(district.uuid);
              this.village.push(village.uuid);
            }
            this.editForm.patchValue({
              state: this.state,
              district: this.district,
              village: this.village,
            });
          }
        }
      }
    });
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

  /**
   * Take form value from edit details form and update it to the openMRS system
   */
  updateDetails() {
    const value = this.editForm.value;
    if (value.gender !== null && value.gender !== this.data.person.gender) {
      const URL = `${this.baseURL}/person/${this.data.person.uuid}`;
      const json = {
        gender: value.gender,
      };
      this.http.post(URL, json).subscribe((response) => { });
    }

    if (value.emailId !== null) {
      const URL = this.data.emailId
        ? `${this.baseURLProvider}/${this.data.emailId.uuid}`
        : this.baseURLProvider;
      const json = {
        attributeType: "226c0494-d67e-47b4-b7ec-b368064844bd",
        value: value.emailId,
      };
      this.http.post(URL, json).subscribe((response) => { });
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
      this.http.post(URL, json).subscribe((response) => { });
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

    if (value.village !== null) {
      const URL = this.data.location
        ? `${this.baseURLProvider}/${this.data.location.uuid}`
        : this.baseURLProvider;
      const json = {
        attributeType: "07f56d25-88b4-4e2d-9c42-987023527752",
        value: `${value.village}`,
      };
      this.http.post(URL, json).subscribe((response) => { });
    }
    this.onClose();   
    setTimeout(() => this.router.navigate(["home"]));
    setTimeout(() => window.location.reload(),500);
    // this.authService.logout();
  }

  getLang() {
    return localStorage.getItem("selectedLanguage");
   }
}
