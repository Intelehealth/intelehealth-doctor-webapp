import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { PageTitleService } from 'src/app/core/page-title/page-title.service';
import { AuthService } from 'src/app/services/auth.service';
import { CoreService } from 'src/app/services/core/core.service';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-change-password',
  templateUrl: './change-password.component.html',
  styleUrls: ['./change-password.component.scss']
})
export class ChangePasswordComponent implements OnInit {

  resetPasswordForm: FormGroup;
  submitted: boolean = false;
  visible1: boolean = false;
  visible2: boolean = false;
  visible3: boolean = false;
  username: string;
  userUuid: string;
  baseUrl: string = environment.baseURL;
  level: number = 1;

  constructor(
    private coreService: CoreService,
    private toastr: ToastrService,
    private authService: AuthService,
    private pageTitleService: PageTitleService
  ) {
    this.resetPasswordForm = new FormGroup({
      oldPassword: new FormControl('', [Validators.required]),
      password: new FormControl('', [Validators.required, Validators.minLength(8)]),
      confirmPassword: new FormControl('', [Validators.required, Validators.minLength(8)]),
    });
  }

  ngOnInit(): void {
    this.pageTitleService.setTitle({ title: '', imgUrl: '' });
    this.resetPasswordForm.get('password').valueChanges.subscribe((val: string) => {
      this.checkPasswordStrength(val);
    });
  }

  get f() { return this.resetPasswordForm.controls; }

  resetPassword() {
    this.submitted = true;
    if (this.resetPasswordForm.invalid) {
      return;
    }
    if (this.resetPasswordForm.value.password !== this.resetPasswordForm.value.confirmPassword) {
      this.toastr.warning("New Password and Confirm Password doesn't match.", "Password doesn't match!");
      return;
    }
    let passwd = this.resetPasswordForm.value.password;
    if (!this.hasLowerCase(passwd) || !this.hasUpperCase(passwd) || !this.hasSpecialCharacter(passwd) || !this.hasNumber(passwd)) {
      this.toastr.warning("Password must be of atleast 8 characters & a mix of upper & lower case letters, numbers & symbols.", "Password invalid!");
      return;
    }
    this.authService.changePassword(this.resetPasswordForm.value.oldPassword, passwd).subscribe((res: any) => {
      this.toastr.success("Password has been changed successfully!", "Password Changed!");
    });
  }

  generatePassword() {
    let passwd = '';
    let chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789*@$&';
    do {
      passwd = '';
      for (let i = 0; i < 8; i++) {
        var c = Math.floor(Math.random()*chars.length + 1);
        passwd += chars.charAt(c);
      }
    } while (!this.hasLowerCase(passwd) || !this.hasUpperCase(passwd) || !this.hasSpecialCharacter(passwd) || !this.hasNumber(passwd));
    this.visible2 = true;
    this.resetPasswordForm.patchValue({
      password: passwd,
      confirmPassword: passwd
    });
    return passwd;
  }

  checkPasswordStrength(str: string) {
    let strongPassword = new RegExp('(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[^A-Za-z0-9])(?=.{12,})');
    let mediumPassword = new RegExp('(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[^A-Za-z0-9])(?=.{8,})');
    let fairPassword = new RegExp('(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.{8,})')
    if (strongPassword.test(str)) {
      this.level = 4;
    } else if (mediumPassword.test(str)) {
      this.level = 3;
    } else if (fairPassword.test(str)) {
      this.level = 2;
    } else {
      this.level = 1;
    }
  }

  hasLowerCase(str: string) {
    return (/[a-z]/.test(str));
  }

  hasUpperCase(str: string) {
    return (/[A-Z]/.test(str));
  }

  hasNumber(str: string) {
    return (/[0-9]/.test(str));
  }

  hasSpecialCharacter(str: string) {
    return (/[^A-Za-z0-9]/.test(str));
  }

  onImgError(event: any) {
    event.target.src = 'assets/svgs/user.svg';
  }

}
