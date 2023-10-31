import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-confirm-openmrs-id',
  templateUrl: './confirm-openmrs-id.component.html',
  styleUrls: ['./confirm-openmrs-id.component.scss']
})
export class ConfirmOpenmrsIdComponent {
  openMrsId: string;

  constructor(@Inject(MAT_DIALOG_DATA) public data,
    private toastr: ToastrService,
    private dialogRef: MatDialogRef<ConfirmOpenmrsIdComponent>) { }

  close(val: boolean) {
    this.dialogRef.close(val);
  }

  submit() {
    if (this.openMrsId) {
      if (this.openMrsId == this.data) {
        this.close(true);
      } else {
        this.toastr.warning("Please enter correct OpenMRS ID.", "OpenMRS ID mismatch.");
      }
    }
  }

}
