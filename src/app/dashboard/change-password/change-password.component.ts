import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import { ToastrService } from 'ngx-toastr';
import { PageTitleService } from 'src/app/core/page-title/page-title.service';
import { AuthService } from 'src/app/services/auth.service';
import { CoreService } from 'src/app/services/core/core.service';
import { getCacheData } from 'src/app/utils/utility-functions';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-change-password',
  templateUrl: './change-password.component.html',
  styleUrls: ['./change-password.component.scss']
})
export class ChangePasswordComponent implements OnInit {

  resetPasswordForm: FormGroup;
  submitted = false;
  visible1 = false;
  visible2 = false;
  visible3 = false;
  username: string;
  userUuid: string;
  baseUrl: string = environment.baseURL;
  level = 1;

  constructor(
    private coreService: CoreService,
    private toastr: ToastrService,
    private authService: AuthService,
    private pageTitleService: PageTitleService,
    private translateService: TranslateService
  ) {
    this.resetPasswordForm = new FormGroup({
      oldPassword: new FormControl('', [Validators.required]),
      password: new FormControl('', [Validators.required, Validators.minLength(8)]),
      confirmPassword: new FormControl('', [Validators.required, Validators.minLength(8)]),
    });
  }

  ngOnInit(): void {
    this.translateService.use(getCacheData(false, 'selectedLanguage'));
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
      this.toastr.warning(this.translateService.instant('Password and Confirm Password doesn\'t match.'),
      this.translateService.instant('Password doesn\'t match!'));
      return;
    }
    const passwd = this.resetPasswordForm.value.password;
    if (!this.hasLowerCase(passwd) || !this.hasUpperCase(passwd) || !this.hasSpecialCharacter(passwd) || !this.hasNumber(passwd)) {
      this.toastr.warning( this.translateService.instant('Password must be of atleast 8 characters & a mix of upper & lower case letters, numbers & symbols.'),
      this.translateService.instant('Password invalid!'));
      return;
    }
    this.authService.changePassword(this.resetPasswordForm.value.oldPassword, passwd).subscribe((res: any) => {
      this.toastr.success(this.translateService.instant('Password has been changed successfully!'),
      this.translateService.instant('Password Changed!'));
    });
  }

  generatePassword() {
    let passwd = '';
    const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789*@$&';
    do {
      passwd = '';
      for (let i = 0; i < 8; i++) {
        const c = Math.floor(Math.random() * chars.length + 1);
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
    const strongPassword = new RegExp('(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[^A-Za-z0-9])(?=.{12,})');
    const mediumPassword = new RegExp('(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[^A-Za-z0-9])(?=.{8,})');
    const fairPassword = new RegExp('(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.{8,})');
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
