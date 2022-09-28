import { Component, OnInit } from "@angular/core";
import firebase from "firebase/app";
import "firebase/auth";
import "firebase/firestore";
import { OtpService } from "src/app/services/otp.service";
@Component({
  selector: "app-otp-verification",
  templateUrl: "./otp-verification.component.html",
  styleUrls: ["./otp-verification.component.scss"],
})
export class OtpVerificationComponent implements OnInit {
  otp: string;
  verify: any;
  constructor(private otpservice: OtpService) {}
  config = {
    allowNumbersOnly: true,
    length: 6,
    isPasswordInput: false,
    disableAutoFocus: false,
    placeholder: "",
    inputStyles: {
      width: "50px",
      height: "50px",
    },
  };
  ngOnInit(): void {
    this.verify = JSON.parse(localStorage.getItem("verificationId"));
    console.log(this.verify);
  }
  onOtpChange(otpCode: any) {
    this.otp = otpCode;
  }
  handleClick() {
    var credential = firebase.auth.PhoneAuthProvider.credential(
      this.verify,
      this.otp
    );

    firebase
      .auth()
      .signInWithCredential(credential)
      .then((response) => {
        console.log(response);
        localStorage.setItem("user_data", JSON.stringify(response));
        //navigate to next screen
      })
      .catch((error) => {
        console.log(error);
        alert(error.message);
      });
  }
  resendOTP() {
    var data = localStorage.getItem("mobilenumber");
    this.otpservice.getOTP("sign-in-button", data).subscribe(() => {
      alert("OTP resend sucessfully");
    });
  }
}
