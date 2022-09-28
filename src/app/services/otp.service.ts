import { Injectable } from "@angular/core";
import { Observable, from } from "rxjs";
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

@Injectable({
  providedIn: "root",
})
export class OtpService {
  reCaptchaVerifier: any;
  constructor() {
    firebase.initializeApp(config);
  }
  getOTP(captchaID: string, phoneNumber: string): Observable<any> {
    this.reCaptchaVerifier = new firebase.auth.RecaptchaVerifier(captchaID, {
      size: "invisible",
    });
    console.log(this.reCaptchaVerifier);
    console.log(phoneNumber);
    return from(
      firebase.auth().signInWithPhoneNumber(phoneNumber, this.reCaptchaVerifier)
    );
  }
}
