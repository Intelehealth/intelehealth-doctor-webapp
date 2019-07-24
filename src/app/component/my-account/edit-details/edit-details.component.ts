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

  editForm = new FormGroup({
    gender: new FormControl(this.data.person.gender),
    phoneNumber: new FormControl(this.data.phoneNumber.value),
    emailId: new FormControl(this.data.emailId.value),
    qualification: new FormControl(this.data.qualification.value),
    specialization: new FormControl(this.data.specialization.value),
    registrationNumber: new FormControl(this.data.registrationNumber.value)
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

  if (value.emailId !== null && value.emailId !== this.data.emailId.value) {
    // tslint:disable-next-line: max-line-length
  const URL = `http://${this.baseURL}/openmrs/ws/rest/v1/provider/${this.data.uuid}/attribute/${this.data.emailId.uuid}`;
  const json = {
  'attributeType': '226c0494-d67e-47b4-b7ec-b368064844bd',
  'value': value.emailId
  };
  this.http.post(URL, json)
  .subscribe(response => {});
  }

  if (value.phoneNumber !== null && value.phoneNumber !== this.data.phoneNumber.value) {
    // tslint:disable-next-line: max-line-length
  const URL = `http://${this.baseURL}/openmrs/ws/rest/v1/provider/${this.data.uuid}/attribute/${this.data.phoneNumber.uuid}`;
  const json = {
  'attributeType': 'e3a7e03a-5fd0-4e6c-b2e3-938adb3bbb37',
  'value': value.phoneNumber.toString()
  };
  this.http.post(URL, json)
  .subscribe(response => {});
  }

  if (value.qualification !== null && value.qualification !== this.data.qualification.value) {
    // tslint:disable-next-line: max-line-length
  const URL = `http://${this.baseURL}/openmrs/ws/rest/v1/provider/${this.data.uuid}/attribute/${this.data.qualification.uuid}`;
  const json = {
  'attributeType': '4246639f-e9a8-48ea-b9ff-629a7c430543',
  'value': value.qualification
  };
  this.http.post(URL, json)
  .subscribe(response => {});
  }

  if (value.registrationNumber !== null && value.registrationNumber !== this.data.registrationNumber.value) {
    console.log(value.registrationNumber)
    // tslint:disable-next-line: max-line-length
    const URL = `http://${this.baseURL}/openmrs/ws/rest/v1/provider/${this.data.uuid}/attribute/${this.data.registrationNumber.uuid}`;
    const json = {
    'attributeType': '992ccbdd-201a-44ef-8abb-c2eee079886d',
    'value': value.registrationNumber
    };
    this.http.post(URL, json)
    .subscribe(response => {});
  }

  if (value.specialization !== null && value.specialization !== this.data.specialization.value) {
    // tslint:disable-next-line: max-line-length
    const URL = `http://${this.baseURL}/openmrs/ws/rest/v1/provider/${this.data.uuid}/attribute/${this.data.specialization.uuid}`;
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
