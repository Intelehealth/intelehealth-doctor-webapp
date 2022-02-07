import { SessionService } from 'src/app/services/session.service';
import { AuthService } from 'src/app/services/auth.service';
import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { MatDialog } from '@angular/material/dialog';
import { SignatureComponent } from './signature/signature.component';
import { EditDetailsComponent } from './edit-details/edit-details.component';
import { environment } from '../../../environments/environment';
declare var getFromStorage: any;

@Component({
  selector: 'app-my-account',
  templateUrl: './my-account.component.html',
  styleUrls: ['./my-account.component.css']
})
export class MyAccountComponent implements OnInit {
  baseURL = environment.baseURL;
  setSpiner = true;

  name = 'Enter text';
  providerDetails = null;
  selectedSpeciality = [];

  constructor(private sessionService: SessionService,
    private http: HttpClient,
    private dialog: MatDialog) { }

  ngOnInit() {
    const userDetails = getFromStorage('user');
    this.sessionService.provider(userDetails.uuid)
      .subscribe(provider => {
        this.providerDetails = provider.results[0];
        const attributes = provider.results[0].attributes;
        let specialization = [];
        attributes.forEach(element => {
          if (element.attributeType.uuid ===
            "ed1715f5-93e2-404e-b3c9-2a2d9600f062") {
            if (!element.voided)
              specialization.push({ value: element.value, uuid: element.uuid })
            this.providerDetails[element.attributeType.display] = specialization;
          } else {
            this.providerDetails[element.attributeType.display] = { value: element.value, uuid: element.uuid };
          }
        });
        this.setSpiner = false;
        this.providerDetails.specialization.forEach(element => {
          this.selectedSpeciality.push(element.value);
        });
      });
  }

  onEdit() {
    this.dialog.open(EditDetailsComponent, { width: '400px', data: this.providerDetails });
  }

  saveName(value) {
    const URL = `${this.baseURL}/person/${this.providerDetails.person.uuid}`;
    const json = {
      'names': value
    };
    this.http.post(URL, json)
      .subscribe(response => { });
  }

  saveAddress(value) {
    // tslint:disable-next-line: max-line-length
    // const URL = `${this.baseURL}/provider/${this.providerDetails.uuid}/attribute/${this.providerUpdate.address}`;
    // const json = {
    // 'attributeType': 'eb410260-4f26-4477-85fe-1bdfe3d3dad2',
    // 'value': value
    // };
    // this.http.post(URL, json)
    // .subscribe(response => console.log(response));
  }


  signature() {
    this.dialog.open(SignatureComponent, {
      width: "500px",
      data: { type: "add" },
    });
  }

}
