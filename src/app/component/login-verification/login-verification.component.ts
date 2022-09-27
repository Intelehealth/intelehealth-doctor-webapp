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
};

@Component({
  selector: "app-login-verification",
  templateUrl: "./login-verification.component.html",
  styleUrls: ["./login-verification.component.scss"],
})
export class LoginVerificationComponent implements OnInit, AfterViewInit {
  @Output() onSucess = new EventEmitter<boolean>();
  verificationForm = new FormGroup({
    phoneNumber: new FormControl("", [Validators.required]),
    email: new FormControl("", [Validators.required]),
  });
  showEmail: boolean = false;
  reCaptchaVerifier: any;
  auth: any;
  windowRef: any;
  constructor() {}

  ngOnInit() {
    firebase.initializeApp(config);
  }
  ngAfterViewInit() {}
  setShowEmail(show: boolean) {
    this.showEmail = show;
  }
  onSubmit() {
    const value = this.verificationForm.value;
    this.reCaptchaVerifier = new firebase.auth.RecaptchaVerifier(
      "sign-in-button",
      {
        size: "invisible",
      }
    );
    console.log(this.reCaptchaVerifier);
    console.log(value.phoneNumber);
    firebase
      .auth()
      .signInWithPhoneNumber(value.phoneNumber, this.reCaptchaVerifier)
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
