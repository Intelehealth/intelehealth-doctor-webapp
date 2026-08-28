import { Component } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-end-shift',
  templateUrl: './end-shift.component.html'
})
export class EndShiftComponent {

  constructor(private dialogRef: MatDialogRef<EndShiftComponent>) { }

  close(val: boolean) {
    this.dialogRef.close(val);
  }
}
