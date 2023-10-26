import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-password-reset-success',
  templateUrl: './password-reset-success.component.html',
})
export class PasswordResetSuccessComponent {

  constructor(@Inject(MAT_DIALOG_DATA) public data,
  private dialogRef: MatDialogRef<PasswordResetSuccessComponent>) { }

  close(val: boolean) {
    this.dialogRef.close(val);
  }

}
