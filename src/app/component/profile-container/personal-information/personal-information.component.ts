import { Component, ElementRef, ViewChild, OnInit, AfterViewInit, } from '@angular/core';
import SignaturePad from 'signature_pad';
import { CountryData } from "../../country-data/country-data";
import { FormGroup, FormControl, Validators } from "@angular/forms";
import { Router } from "@angular/router";

@Component({
  selector: 'app-personal-information',
  templateUrl: './personal-information.component.html',
  styleUrls: ['./personal-information.component.scss']
})
export class PersonalInformationComponent implements OnInit, AfterViewInit{
  @ViewChild('canvas') canvasEl: ElementRef;
  signatureImg: string;
  signaturePad: SignaturePad;
  moveTo: boolean = false;
  selectedLanguage: any;
  languageList = [{ name: "English" }, { name: "Hindi" }];

  countryCode: any = this.country.country_Codes.map((code: any) => {
    code.img = `assets/flags/1x1/${code.country_code.toLowerCase()}.svg`;
    return code;
  });
  default: string = "+91";

  personalInfoForm = new FormGroup({
    phoneNumber: new FormControl("", [Validators.required]),
    email: new FormControl("", [Validators.required]),
    selectedCode: new FormControl("", [Validators.required]),
  });

  constructor(
    private country: CountryData,
    private router: Router
  ) {
    this.personalInfoForm.controls["selectedCode"].setValue(this.default, {
      onlySelf: true,
    });
   }

  ngOnInit(): void {
    this.selectedLanguage = this.languageList[0];
  }

  ngAfterViewInit() {
    this.signaturePad = new SignaturePad(this.canvasEl.nativeElement);
  }

  startDrawing(event: Event) {
    console.log(event);
  }

  clearPad() {
    this.signaturePad.clear();
  }

  toggleCollapse(){
    this.moveTo = !this.moveTo;
  }

  onToggleBack(data:boolean){
    this.moveTo = data;
  }
}
