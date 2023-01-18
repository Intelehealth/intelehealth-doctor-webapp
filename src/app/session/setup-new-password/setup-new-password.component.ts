import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { CoreService } from 'src/app/services/core/core.service';

@Component({
  selector: 'app-setup-new-password',
  templateUrl: './setup-new-password.component.html',
  styleUrls: ['./setup-new-password.component.scss']
})
export class SetupNewPasswordComponent implements OnInit {

  resetPasswordForm: FormGroup;
  submitted: boolean = false;
  visible1: boolean = false;
  visible2: boolean = false;

  constructor(private coreService: CoreService, private router: Router) {
    this.resetPasswordForm = new FormGroup({
      password: new FormControl('', [Validators.required]),
      confirmPassword: new FormControl('', [Validators.required]),
    });
  }

  ngOnInit(): void {
  }

  get f() { return this.resetPasswordForm.controls; }

  resetPassword() {
    this.submitted = true;
    if (this.resetPasswordForm.invalid) {
      return;
    }
    this.coreService.openPasswordResetSuccessModal().subscribe((res: any) => {
      this.router.navigate(['/session/login']);
    });
  }

  generatePassword() {
    let passwd = '';
    let chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789*@$&';
    for (let i = 0; i < 8; i++) {
      var c = Math.floor(Math.random()*chars.length + 1);
      passwd += chars.charAt(c)
    }
    this.visible1 = true;
    this.resetPasswordForm.patchValue({
      password: passwd,
      confirmPassword: passwd
    });
    return passwd;
  }

}
