import { Component, OnInit } from '@angular/core';
import { EncounterService } from 'src/app/services/encounter.service';
import { HttpClient } from '@angular/common/http';
import { MatDialog } from '@angular/material';
import { SignatureComponent } from './signature/signature.component';
import { EditDetailsComponent } from './edit-details/edit-details.component';

@Component({
  selector: 'app-my-account',
  templateUrl: './my-account.component.html',
  styleUrls: ['./my-account.component.css']
})
export class MyAccountComponent implements OnInit {
  baseURL = window.location.host;
  // baseURL = '13.233.50.223:8080';
  // baseURL = 'demo.intelehealth.io';

  name = 'Enter text';
  providerDetails = null;

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
            attributes.forEach(element => {
              this.providerDetails[element.attributeType.display] = {value: element.value, uuid: element.uuid};
            });
          });
      });
  }

  onEdit() {
    this.dialog.open(EditDetailsComponent, { width: '400px', data: this.providerDetails });
  }

  saveName(value) {
  const URL = `http://${this.baseURL}/openmrs/ws/rest/v1/person/${this.providerDetails.person.uuid}`;
  const json = {
    'names': value
  };
  this.http.post(URL, json)
  .subscribe(response => console.log(response));
  }

  saveAddress(value) {
// tslint:disable-next-line: max-line-length
    // const URL = `http://${this.baseURL}/openmrs/ws/rest/v1/provider/${this.providerDetails.uuid}/attribute/${this.providerUpdate.address}`;
    // const json = {
    // 'attributeType': 'eb410260-4f26-4477-85fe-1bdfe3d3dad2',
    // 'value': value
    // };
    // this.http.post(URL, json)
    // .subscribe(response => console.log(response));
  }


  signature() {
    this.dialog.open(SignatureComponent, { width: '500px' });
  }

}
