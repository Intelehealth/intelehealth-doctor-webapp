import {
  Component,
  OnInit,
  Output,
  EventEmitter,
  AfterViewInit,
} from "@angular/core";
import { FormGroup, FormControl, Validators } from "@angular/forms";
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore/lite";
import { AngularFireAuth } from "@angular/fire/compat/auth";
import firebase from "firebase/compat/app";
import { WindowService } from "../../services/window.service";

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
  phoneNumber: any;
  reCaptchaVerifier: any;
  auth: any;
  windowRef: any;
  constructor(private windowService: WindowService) {
    this.windowRef = this.windowService.windowRef;
  }

  ngOnInit() {
    firebase.initializeApp(config);
  }
  ngAfterViewInit() {
    this.windowRef.reCaptchaVerifier = new firebase.auth.RecaptchaVerifier(
      "recaptcha-container",
      {
        size: "normal",
        callback: (responce) => {},
      }
    );
    this.windowRef.reCaptchaVerifier.render();
  }
  setShowEmail(show: boolean) {
    this.showEmail = show;
  }
  onSubmit() {
    //const value = this.verificationForm.value;
    //const string = `${value.mobile}:${value.email}`;
    //API call to send otp
    this.onSucess.emit(true);
  }
  getOTP() {
    /*this.windowRef.reCaptchaVerifier = new firebase.auth.RecaptchaVerifier(
      "recaptcha-container",
      { size: "invisible" }
    );*/

    firebase
      .auth()
      .signInWithPhoneNumber(this.phoneNumber, this.reCaptchaVerifier)
      .then((confimationResult) => {
        console.log(confimationResult);
      });
  }
}
