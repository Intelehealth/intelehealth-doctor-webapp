import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators, FormBuilder } from "@angular/forms";
import { environment } from '../../../environments/environment';
import { MindmapService } from 'src/app/services/mindmap.service';
import { Router } from "@angular/router";
declare var getFromStorage: any;

@Component({
  selector: 'app-set-new-password',
  templateUrl: './set-new-password.component.html',
  styleUrls: ['./set-new-password.component.scss']
})
export class SetNewPasswordComponent implements OnInit {
  baseURL = environment.baseURL;
  setNewPasswordForm: FormGroup;
  userUuid: string;
  passwordIsValid = false;
  showPassword: boolean = false;
  userName: string;

  constructor(
    private formBuilder: FormBuilder,
    private mindmap:MindmapService,
    private router: Router,
  ) {
    this.setNewPasswordForm = this.formBuilder.group({
      newPassword: ['', Validators.required],
      confirmPassword: new FormControl("", [Validators.required])
    });
  }

  ngOnInit() {
    const user = JSON.parse(localStorage.getItem("userData"));
    console.log(user,'user');
    this.userName = user.username;
    this.userUuid = user.uuid;
    console.log(this.userUuid,"UserID");
  }

  onSubmit(){ 
    const value = this.setNewPasswordForm.value.newPassword;
    let data = {"newPassword":value, "otp":"111111"}
    console.log(data,this.userUuid);
    
    this.mindmap.changePassword(data,this.userUuid).subscribe((response)=>{
      console.log(response,'Password changed successfully.');
      this.router.navigate(["/login"]);
      
    })
  }

  showHidePassword() {
    this.showPassword = !this.showPassword;
  }

  passwordValid(event) {
    this.passwordIsValid = event;
  }  
}

