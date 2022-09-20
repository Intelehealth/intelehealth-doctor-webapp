import { Component, OnInit, Output, EventEmitter } from "@angular/core";
import { FormGroup, FormControl, Validators } from "@angular/forms";
@Component({
  selector: "app-login-verification",
  templateUrl: "./login-verification.component.html",
  styleUrls: ["./login-verification.component.scss"],
})
export class LoginVerificationComponent implements OnInit {
  @Output() onSucess = new EventEmitter<boolean>();
  verificationForm = new FormGroup({
    mobile: new FormControl("", [Validators.required]),
    email: new FormControl("", [Validators.required]),
  });
  showEmail: boolean = false;
  constructor() {}

  ngOnInit(): void {}
  setShowEmail(show: boolean) {
    this.showEmail = show;
  }
  onSubmit() {
    //const value = this.verificationForm.value;
    //const string = `${value.mobile}:${value.email}`;
    //API call to send otp
    this.onSucess.emit(true);
  }
}
