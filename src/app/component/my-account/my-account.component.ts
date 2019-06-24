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
  baseUrl = window.location.host;
  name = 'Enter text';
  providerDetails = null;



  constructor(private service: EncounterService,
              private http: HttpClient,
              private dialog : MatDialog) { }

  ngOnInit() {
    this.service.session()
      .subscribe(session => {
        const userUuid = session.user.uuid;
        console.log(userUuid);
        this.service.provider(userUuid)
          .subscribe(provider => {
            this.providerDetails = provider.results[0];
            const attributes = provider.results[0].attributes;
            attributes.forEach(element => {
              this.providerDetails[element.attributeType.display] = element.value;
            });
          });
      });
  }

  signature() {
    this.dialog.open(SignatureComponent, { width: '500px' });
  }

}
