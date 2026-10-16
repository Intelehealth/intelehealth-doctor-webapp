import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-call-done',
  templateUrl: './call-done.component.html'
})
export class CallDoneComponent {

  constructor(@Inject(MAT_DIALOG_DATA) public data: { patientName: string },
    private dialogRef: MatDialogRef<CallDoneComponent>) { }

  close(val: 'queue' | 'prescription' | null) {
    this.dialogRef.close(val);
  }
}
