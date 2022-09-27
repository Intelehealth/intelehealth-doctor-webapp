import {
  Component,
  OnInit,
  Output,
  EventEmitter,
  AfterViewInit,
} from "@angular/core";
import { FormGroup, FormControl, Validators } from "@angular/forms";
import firebase from "firebase/app";
import "firebase/auth";
import "firebase/firestore";

var config = {
  apiKey: "AIzaSyDkU15rxve37d9hu_4y0lUNOfrUX6iSpUI",
  authDomain: "intelehealth-webapp.firebaseapp.com",
  projectId: "intelehealth-webapp",
  storageBucket: "intelehealth-webapp.appspot.com",
  messagingSenderId: "246647122371",
  appId: "1:246647122371:web:c45944219d1f37bf30b576",
  /*apiKey: "AIzaSyC5cRqdDtLWwJpz7WY1Ekpx7rbawbG1CA8",
  authDomain: "intelehealth-3-0.firebaseapp.com",
  databaseURL: "https://intelehealth-3-0-default-rtdb.firebaseio.com",
  projectId: "intelehealth-3-0",
  storageBucket: "intelehealth-3-0.appspot.com",
  messagingSenderId: "781318396284",
  appId: "1:781318396284:web:69d37af4daa956a3df6cf9",
  measurementId: "G-68HCCL881X",*/
};

@Component({
  selector: "app-login-verification",
  templateUrl: "./login-verification.component.html",
  styleUrls: ["./login-verification.component.scss"],
})
export class LoginVerificationComponent implements OnInit, AfterViewInit {
  @Output() onSucess = new EventEmitter<boolean>();
  countries: string[] = ["+91", "+61", "+44"];
  default: string = "+91";

  verificationForm = new FormGroup({
    phoneNumber: new FormControl("", [Validators.required]),
    email: new FormControl("", [Validators.required]),
    code: new FormControl("", [Validators.required]),
  });

  showEmail: boolean = false;
  reCaptchaVerifier: any;
  auth: any;
  windowRef: any;
  constructor() {
    this.verificationForm.controls["code"].setValue(this.default, {
      onlySelf: true,
    });
  }

  ngOnInit() {
    firebase.initializeApp(config);
  }
  ngAfterViewInit() {}
  setShowEmail(show: boolean) {
    this.showEmail = show;
  }
  onSubmit() {
    var value = this.verificationForm.value;
    var mobileNumber = value.code + value.phoneNumber;
    this.reCaptchaVerifier = new firebase.auth.RecaptchaVerifier(
      "sign-in-button",
      {
        size: "invisible",
      }
    );
    console.log(this.reCaptchaVerifier);
    console.log(mobileNumber);
    firebase
      .auth()
      .signInWithPhoneNumber(mobileNumber, this.reCaptchaVerifier)
      .then((confimationResult) => {
        localStorage.setItem(
          "verificationId",
          JSON.stringify(confimationResult.verificationId)
        );
        this.onSucess.emit(true);
      })
      .catch((e) => {
        console.log(e);
      });
  }
}
