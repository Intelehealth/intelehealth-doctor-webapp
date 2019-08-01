import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material';
import { Component, OnInit, Inject } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';


@Component({
  selector: 'app-edit-details',
  templateUrl: './edit-details.component.html',
  styleUrls: ['./edit-details.component.css']
})
export class EditDetailsComponent implements OnInit {
baseURL = window.location.host;
  // baseURL = '13.233.50.223:8080';
  // baseURL = 'demo.intelehealth.io';
  baseURLProvider = `http://${this.baseURL}/openmrs/ws/rest/v1/provider/${this.data.uuid}/attribute`

  editForm = new FormGroup({
    gender: new FormControl(this.data.person ? this.data.person.gender : null),
    phoneNumber: new FormControl(this.data.phoneNumber ? this.data.phoneNumber.value : null),
    emailId: new FormControl(this.data.emailId ? this.data.emailId.value : null),
    qualification: new FormControl(this.data.qualification ? this.data.qualification.value : null),
    specialization: new FormControl(this.data.specialization ? this.data.specialization.value : null),
    registrationNumber: new FormControl(this.data.registrationNumber ? this.data.registrationNumber.value : null)
  });

  constructor(@Inject(MAT_DIALOG_DATA) public data,
              private dialogRef: MatDialogRef<EditDetailsComponent>,
              private http: HttpClient) { }

  ngOnInit() {
  }

  onClose() {
    this.dialogRef.close();
  }



  updateDetails() {
  const value = this.editForm.value;
  if (value.gender !== null && value.gender !== this.data.person.gender) {
    const URL = `http://${this.baseURL}/openmrs/ws/rest/v1/person/${this.data.person.uuid}`;
    const json = {
      'gender': value.gender
    };
    this.http.post(URL, json)
    .subscribe(response => {});
  }

  if (value.emailId !== null ) {
  const URL = this.data.emailId ? `${this.baseURLProvider}/${this.data.emailId.uuid}` : this.baseURL;
  const json = {
  'attributeType': '226c0494-d67e-47b4-b7ec-b368064844bd',
  'value': value.emailId
  };
  this.http.post(URL, json)
  .subscribe(response => {});
  }

  if (value.phoneNumber !== null) {
  const URL = this.data.phoneNumber ? `${this.baseURLProvider}/${this.data.phoneNumber.uuid}` : this.baseURLProvider;
  const json = {
  'attributeType': 'e3a7e03a-5fd0-4e6c-b2e3-938adb3bbb37',
  'value': value.phoneNumber.toString()
  };
  this.http.post(URL, json)
  .subscribe(response => {});
  }

  if (value.qualification !== null ) {
  const URL = this.data.qualification ? `${this.baseURLProvider}/${this.data.qualification.uuid}` : this.baseURLProvider;
  const json = {
  'attributeType': '4246639f-e9a8-48ea-b9ff-629a7c430543',
  'value': value.qualification
  };
  this.http.post(URL, json)
  .subscribe(response => {});
  }

  if (value.registrationNumber !== null) {
    const URL = this.data.registrationNumber ? `${this.baseURLProvider}/${this.data.registrationNumber.uuid}` : this.baseURLProvider;
    const json = {
    'attributeType': '992ccbdd-201a-44ef-8abb-c2eee079886d',
    'value': value.registrationNumber
    };
    this.http.post(URL, json)
    .subscribe(response => {});
  }

  if (value.specialization !== null ) {
  const URL = this.data.specialization ? `${this.baseURLProvider}/${this.data.specialization.uuid}` : this.baseURLProvider;
  const json = {
  'attributeType': 'ed1715f5-93e2-404e-b3c9-2a2d9600f062',
  'value': value.specialization
  };
  this.http.post(URL, json)
  .subscribe(response => {});
  }

  setTimeout(() => window.location.reload(), 2000);
  }
}
