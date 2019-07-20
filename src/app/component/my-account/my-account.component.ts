import { Component, OnInit } from '@angular/core';
import { EncounterService } from 'src/app/services/encounter.service';
import { HttpClient } from '@angular/common/http';
import { MatDialog } from '@angular/material';
import { SignatureComponent } from './signature/signature.component';

@Component({
  selector: 'app-my-account',
  templateUrl: './my-account.component.html',
  styleUrls: ['./my-account.component.css']
})
export class MyAccountComponent implements OnInit {
  // baseURL = window.location.host;
  baseURL = '13.233.50.223:8080';
  name = 'Enter text';
  providerDetails = null;
  providerUpdate = null;

  constructor(private service: EncounterService,
              private http: HttpClient,
              private dialog: MatDialog) { }

  ngOnInit() {
    this.service.session()
      .subscribe(session => {
        const userUuid = session.user.uuid;
        this.service.provider(userUuid)
          .subscribe(provider => {
            this.providerDetails = provider.results[0];
            const attributes = provider.results[0].attributes;
            this.providerUpdate = {};
            attributes.forEach(element => {
              this.providerDetails[element.attributeType.display] = element.value;
              this.providerUpdate[element.attributeType.display] = element.uuid;
            });
          });
      });
  }

  saveName(value) {
  const URL = `http://${this.baseURL}/openmrs/ws/rest/v1/person/${this.providerDetails.person.uuid}`;
  const json = {
    'names': value
  };
  this.http.post(URL, json)
  .subscribe(response => console.log(response));
  }

  saveGender(value) {
  const URL = `http://${this.baseURL}/openmrs/ws/rest/v1/person/${this.providerDetails.person.uuid}`;
  const json = {
    'gender': value
  };
  this.http.post(URL, json)
  .subscribe(response => console.log(response));
  }

  savePhoneNo(value) {
  // tslint:disable-next-line: max-line-length
  const URL = `http://${this.baseURL}/openmrs/ws/rest/v1/provider/${this.providerDetails.uuid}/attribute/${this.providerUpdate.phoneNumber}`;
  const json = {
  'attributeType': 'e3a7e03a-5fd0-4e6c-b2e3-938adb3bbb37',
  'value': value
  };
  this.http.post(URL, json)
  .subscribe(response => console.log(response));
  }

  saveEmail(value) {
// tslint:disable-next-line: max-line-length
  const URL = `http://${this.baseURL}/openmrs/ws/rest/v1/provider/${this.providerDetails.uuid}/attribute/${this.providerUpdate.emailId}`;
  const json = {
  'attributeType': '226c0494-d67e-47b4-b7ec-b368064844bd',
  'value': value
  };
  this.http.post(URL, json)
  .subscribe(response => console.log(response));
  }

  saveQualification(value) {
// tslint:disable-next-line: max-line-length
  const URL = `http://${this.baseURL}/openmrs/ws/rest/v1/provider/${this.providerDetails.uuid}/attribute/${this.providerUpdate.qualification}`;
  const json = {
  'attributeType': '4246639f-e9a8-48ea-b9ff-629a7c430543',
  'value': value
  };
  this.http.post(URL, json)
  .subscribe(response => console.log(response));
  }

  saveSpecialization(value) {
// tslint:disable-next-line: max-line-length
    const URL = `http://${this.baseURL}/openmrs/ws/rest/v1/provider/${this.providerDetails.uuid}/attribute/${this.providerUpdate.specialization}`;
  const json = {
  'attributeType': 'ed1715f5-93e2-404e-b3c9-2a2d9600f062',
  'value': value
  };
  this.http.post(URL, json)
  .subscribe(response => console.log(response));

  }
  saveRegistrationNumber(value) {
// tslint:disable-next-line: max-line-length
    const URL = `http://${this.baseURL}/openmrs/ws/rest/v1/provider/${this.providerDetails.uuid}/attribute/${this.providerUpdate.registrationNumber}`;
    const json = {
    'attributeType': '992ccbdd-201a-44ef-8abb-c2eee07988',
    'value': value
    };
    this.http.post(URL, json)
    .subscribe(response => console.log(response));
  }

  saveAddress(value) {
// tslint:disable-next-line: max-line-length
    const URL = `http://${this.baseURL}/openmrs/ws/rest/v1/provider/${this.providerDetails.uuid}/attribute/${this.providerUpdate.address}`;
    const json = {
    'attributeType': 'eb410260-4f26-4477-85fe-1bdfe3d3dad2',
    'value': value
    };
    this.http.post(URL, json)
    .subscribe(response => console.log(response));
  }


  signature() {
    this.dialog.open(SignatureComponent, { width: '500px' });
  }

}
