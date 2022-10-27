import { Component, OnInit, Output, EventEmitter } from "@angular/core";
import { FormGroup, FormControl, Validators } from "@angular/forms";
import { OtpService } from "src/app/services/otp.service";
import { CountryData } from "../country-data/country-data";

@Component({
  selector: "app-forgot-username",
  templateUrl: "./forgot-username.component.html",
  styleUrls: ["./forgot-username.component.scss"],
})
export class ForgotUsernameComponent implements OnInit {
  @Output() onSucess = new EventEmitter<boolean>();

  countryCode: any = this.country.country_Codes.map((code: any) => {
    code.img = `assets/flags/1x1/${code.country_code.toLowerCase()}.svg`;
    return code;
  });

  default: string = "+91";

  verificationForm = new FormGroup({
    phoneNumber: new FormControl("", [Validators.required]),
    email: new FormControl("", [Validators.required]),
    selectedCode: new FormControl("", [Validators.required]),
  });

  showEmail: boolean = false;
  // reCaptchaVerifier: any;
  auth: any;
  windowRef: any;
  constructor(private otpservice: OtpService, private country: CountryData) {
    this.verificationForm.controls["selectedCode"].setValue(this.default, {
      onlySelf: true,
    });
  }

  ngOnInit(): void {}
  setShowEmail(show: boolean) {
    this.showEmail = show;
  }
  onSubmit() {
    var value = this.verificationForm.value;
    var mobileNumber = value.code + value.phoneNumber;
    this.otpservice
      .getOTP("sign-in-button", mobileNumber)
      .subscribe((confimationResult) => {
        localStorage.setItem(
          "verificationId",
          JSON.stringify(confimationResult.verificationId)
        );
        localStorage.setItem("mobilenumber", mobileNumber);
        this.onSucess.emit(true);
      });
  }
}
