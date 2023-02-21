import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { AuthService } from 'src/app/services/auth.service';
import { MindmapService } from 'src/app/services/mindmap.service';

@Component({
  selector: 'app-forgot-password',
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.scss']
})
export class ForgotPasswordComponent implements OnInit {

  forgotPasswordForm: FormGroup;
  submitted: boolean = false;
  user: any;

  constructor(
    private toastr: ToastrService,
    private router: Router,
    private authService: AuthService,
    private mindmapService: MindmapService) {
    this.forgotPasswordForm = new FormGroup({
      username: new FormControl('', Validators.required)
    });
  }

  ngOnInit(): void {
  }

  get f() { return this.forgotPasswordForm.controls; }

  forgotPassword() {
    this.submitted = true;
    if (this.forgotPasswordForm.invalid) {
      return;
    }
    this.authService.checkIfUsernameExists(this.forgotPasswordForm.value.username).subscribe((res: any) => {
      if (res.results) {
        res.results.forEach((user: any) => {
          if (user.username) {
            if (user.username.toLowerCase() == this.forgotPasswordForm.value.username.toLowerCase()) {
              this.user = user;
            }
          }
        });
        if (this.user) {
          this.mindmapService.postMindmapOTP({ userName: this.forgotPasswordForm.value.username }).subscribe((otp: any) => {
            if (otp.success) {
              this.toastr.success(`OTP sent on your mobile number and email successfully!`, "OTP Sent");
              this.router.navigate(['/session/verify-otp'], { state: { verificationFor: 'forgot-password', via: 'username', val: this.forgotPasswordForm.value.username, id: this.user.uuid } });
            }
          });
        } else {
          this.toastr.warning("Couldn’t find you, please enter valid username","User doesn't exists!");
        }
      }
    });
  }

}
