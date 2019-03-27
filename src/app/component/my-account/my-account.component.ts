import { Component, OnInit } from '@angular/core';
import { EncounterService } from 'src/app/services/encounter.service';
import { HttpClient } from '@angular/common/http';
import { FormGroup, FormControl } from '@angular/forms';

@Component({
  selector: 'app-my-account',
  templateUrl: './my-account.component.html',
  styleUrls: ['./my-account.component.css']
})
export class MyAccountComponent implements OnInit {
status = false;
name = 'Enter your text';

addSignatureForm = new FormGroup({
  signature: new FormControl(''),
  text: new FormControl('')
});

  constructor(private service: EncounterService,
              private http: HttpClient) { }

  ngOnInit() {
  }

  onSubmit() {
    const formValue = this.addSignatureForm.value;
    const signatureValue = formValue.signature;
    const signText = formValue.text;
    if (signatureValue === '1') {
      signature(signText, 'Arty');
    }
    if (signatureValue === '2') {
      signature(signText, 'Asem');
    }
    if (signatureValue === '3') {
      signature(signText, 'Youthness');
    }
  }
}

   function signature(text: string, font: string) {
    this.service.session()
    .subscribe(response => {
      const userUuid = response.user.uuid;
      const url = 'http://demo.intelehealth.io/openmrs/ws/rest/v1/provider?user=' + userUuid;
      this.http.get(url)
      .subscribe(response1 => {
          const providerUuid = response1.results[0].uuid;
          console.log(providerUuid);
          const url1 = 'http://demo.intelehealth.io/openmrs/ws/rest/v1/provider/' + providerUuid + '/attribute';
          this.http.get(url1)
          .subscribe(response2 => {
            const data = response2;
            if (data.results.length !== 0) {
              this.status = true;
            } else {
              const url2 = 'http://demo.intelehealth.io/openmrs/ws/rest/v1/provider/' + providerUuid + '/attribute';
              const json = {
                'attributetype' : '',
                'value' : text
               };
              this.http.post(url2, json);
              const url3 = 'http://demo.intelehealth.io/openmrs/ws/rest/v1/provider/' + providerUuid + '/attribute';
              const json1 = {
                'attributetype' : '',
                'value' : font
               };
               this.http.post(url3, json1);
            }
          });
      });

    });
}

