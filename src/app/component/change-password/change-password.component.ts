import { Component, OnInit } from "@angular/core";
import { UntypedFormGroup, Validators, UntypedFormBuilder } from "@angular/forms";
import { MustMatch } from "./password.validator";
import { HttpClient } from "@angular/common/http";
import { MatDialogRef } from "@angular/material/dialog";
import { MatSnackBar } from "@angular/material/snack-bar";
import { environment } from "../../../environments/environment";

@Component({
  selector: "app-change-password",
  templateUrl: "./change-password.component.html",
  styleUrls: ["./change-password.component.css"],
})
export class ChangePasswordComponent implements OnInit {
  baseURL = environment.baseURL;
  changePasswordForm: UntypedFormGroup;

  constructor(
    private formBuilder: UntypedFormBuilder,
    private http: HttpClient,
    private snackbar: MatSnackBar,
    private dialogRef: MatDialogRef<ChangePasswordComponent>
  ) {
    this.changePasswordForm = this.formBuilder.group(
      {
        currentPassword: ["", Validators.required],
        newPassword: ["", Validators.required],
        repeatPassword: ["", Validators.required],
      },
      {
        validator: MustMatch("newPassword", "repeatPassword"),
      }
    );
  }

  ngOnInit() {}

  /**
   * Check current and new password and request to change it in the system
   */
  onSubmit() {
    const value = this.changePasswordForm.value;
    const url = `${this.baseURL}/password`;
    const json = {
      oldPassword: value.currentPassword,
      newPassword: value.newPassword,
    };
    this.http.post(url, json).subscribe(
      (response) => {
        if (response == null) {
          this.snackbar.open("Password changed successfully.", null, {
            duration: 4000,
          });
          this.dialogRef.close();
        }
      },
      (error) => {
        if (error.error.message.match("Old password is not correct.")) {
          this.snackbar.open("Old password is incorrect.", null, {
            duration: 4000,
          });
        }
      }
    );
  }

  onClose() {
    this.dialogRef.close();
  }
}
