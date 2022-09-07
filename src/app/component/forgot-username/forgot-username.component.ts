import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { FormGroup, FormControl, Validators } from "@angular/forms";

@Component({
  selector: 'app-forgot-username',
  templateUrl: './forgot-username.component.html',
  styleUrls: ['./forgot-username.component.scss']
})
export class ForgotUsernameComponent implements OnInit {
  @Output() onSucess = new EventEmitter<boolean>();
  showEmail: boolean = false;
  verificationForm = new FormGroup({
    mobile: new FormControl(),
    email: new FormControl(),
  });

  constructor() { }

  ngOnInit(): void {
  }

  setShowEmail(show: boolean) {
    this.showEmail = show;
  }
  
  onSubmit() {
    this.onSucess.emit(true);
  }
    
}
