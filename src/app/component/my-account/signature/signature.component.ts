import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl } from '@angular/forms';
import { EncounterService } from 'src/app/services/encounter.service';
import { MatDialogRef } from '@angular/material';


@Component({
  selector: 'app-signature',
  templateUrl: './signature.component.html',
  styleUrls: ['./signature.component.css']
})
export class SignatureComponent implements OnInit {
  addSignatureForm = new FormGroup({
    signature: new FormControl(''),
    text: new FormControl('')
  });

  baseUrl = window.location.host;
  status = false;
  name = 'Enter text';

  constructor(private service: EncounterService,
              private http: HttpClient,
              private dialogRef: MatDialogRef<SignatureComponent>) { }

  ngOnInit() {
  }

  onClose() {
    this.dialogRef.close();
  }


onSubmit() {
  const formValue = this.addSignatureForm.value;
  const signatureValue = formValue.signature;
  const signText = formValue.text;
  if (signatureValue === '1') {
    signature(signText, 'arty');
  }
  if (signatureValue === '2') {
    signature(signText, 'asem');
  }
  if (signatureValue === '3') {
    signature(signText, 'youthness');
  }
}
}

function signature(text: string, font: string) {
this.service.session()
  .subscribe(response => {
    const userUuid = response.user.uuid;
    const url = `http://${this.baseUrl}/openmrs/ws/rest/v1/provider?user=${userUuid}`;
    this.http.get(url)
      .subscribe(response1 => {
        const providerUuid = response1.results[0].uuid;
        const url1 = `http://${this.baseUrl}/openmrs/ws/rest/v1/provider/${providerUuid}/attribute`;
        this.http.get(url1)
          .subscribe(response2 => {
            const data = response2;
            if (data.results.length !== 0) {
              this.status = true;
            } else {
              const url2 = `http://${this.baseUrl}/openmrs/ws/rest/v1/provider/${providerUuid}/attribute`;
              const json = {
                'attributetype': '',
                'value': text
              };
              this.http.post(url2, json);
              const url3 = `http://${this.baseUrl}/openmrs/ws/rest/v1/provider/${providerUuid}/attribute`;
              const json1 = {
                'attributetype': '',
                'value': font
              };
              this.http.post(url3, json1);
            }
          });
      });
  });
}

