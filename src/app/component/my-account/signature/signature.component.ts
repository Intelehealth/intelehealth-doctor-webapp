import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { HttpClient } from '@angular/common/http';
import { Component, OnInit, Inject } from '@angular/core';
import { FormGroup, FormControl } from '@angular/forms';
import { EncounterService } from 'src/app/services/encounter.service';
import { environment } from '../../../../environments/environment';
import { TranslationService } from 'src/app/services/translation.service';
declare var getFromStorage: any;

@Component({
  selector: 'app-signature',
  templateUrl: './signature.component.html',
  styleUrls: ['./signature.component.css']
})
export class SignatureComponent implements OnInit {
  baseURL = environment.baseURL;
  baseURLProvider = `${this.baseURL}/provider/${this.data.pid}/attribute`;
  addSignatureForm = new FormGroup({
    signature: new FormControl(''),
    text: new FormControl('')
  });
  status = false;
  name = 'Enter text';

  constructor(
              @Inject(MAT_DIALOG_DATA) public data,
              private service: EncounterService,
              private translationService: TranslationService,
              private http: HttpClient,
              private dialogRef: MatDialogRef<SignatureComponent>) {  dialogRef.disableClose = true; }

  ngOnInit() {
    if(this.data.type == 'edit'){
      this.name = this.data.name
    }
  }

  onClose() {
    this.dialogRef.close();
  }

  onSubmit() {
    const formValue = this.addSignatureForm.value;
    const signatureValue = formValue.signature;
    const signText = formValue.text;
    if (signatureValue === "1") {
      this.signature(signText, this.getFontfamily(1));
    }
    if (signatureValue === "2") {
      this.signature(signText, this.getFontfamily(2));
    }
    if (signatureValue === "3") {
      this.signature(signText, this.getFontfamily(3));
    }
    if (signatureValue === "4") {
      this.signature(signText, this.getFontfamily(4));
    }
  }


  getFontfamily(value) {
    console.log("getFontfamily", value)
    switch (value) {
      case 1:
        return localStorage.getItem('selectedLanguage') === 'ru'? "RobotoItalic" : "arty";
      case 2:
        return localStorage.getItem('selectedLanguage') === 'ru'? "Caveat" : "asem";
      case 3:
        return localStorage.getItem('selectedLanguage') === 'ru'? "Cormorant" : "youthness";
      case 4:
          return localStorage.getItem('selectedLanguage') === 'ru'? "Pacifico": "almondita";  
    }
  }

signature = (text: string, font: string) => {
  const userDetails = getFromStorage('user');
  const providerDetails = getFromStorage('provider');
  if (userDetails && providerDetails && this.data.type == 'add') {
    const providerUuid = providerDetails.uuid;
    this.service.signRequest(providerUuid)
    .subscribe(res => {userDetails
      const data = res.results;
      if (data.length !== 0 ) {
        data.forEach(value => {
          if (value.display.match('textOfSign') !== null) {
            this.status = true;
          }
        });
      }
      if (!this.status) {
        const url2 = `${this.baseURL}/provider/${providerUuid}/attribute`;
        const json = {
          'attributeType': 'c1c6458d-383b-4034-afa0-16a34185b458',
          'value': text
        };
        this.http.post(url2, json) 
        .subscribe(pp => {
        });
        const url3 = `${this.baseURL}/provider/${providerUuid}/attribute`;
        const json1 = {
          'attributeType': '8d321915-e59d-4e19-98a9-086946bfc72b',
          'value': font
        };
        this.http.post(url3, json1)
        .subscribe(ps => {
          this.translationService.getTranslation('Signature added successfully');
          this.onClose();
          setTimeout(() => window.location.reload(), 2000);
        });
      }
    });
  } 
  else if(this.data.type == 'edit'){
        const url2 = this.data.name ? `${this.baseURLProvider}/${this.data.textOfSignuuid}`: this.baseURLProvider;
      
          const json = {
            'attributeType': 'c1c6458d-383b-4034-afa0-16a34185b458',
            'value': text
          };
          this.http.post(url2, json).subscribe(pp => {
          });
  
          const url3 = this.data.font ? `${this.baseURLProvider}/${this.data.fontOfSignuuid}`: this.baseURLProvider;
          const json1 = {
            'attributeType': '8d321915-e59d-4e19-98a9-086946bfc72b',
            'value': font
          };
          this.http.post(url3, json1).subscribe(ps => {
            this.translationService.getTranslation('Signature Updated successfully');
            this.onClose();
            
    });
 
  }
}
}

