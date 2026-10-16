import { Component } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { CALL_NOT_HAPPENED_REASONS } from '../../queue.model';

@Component({
  selector: 'app-call-not-happened',
  templateUrl: './call-not-happened.component.html'
})
export class CallNotHappenedComponent {

  reasons = CALL_NOT_HAPPENED_REASONS;
  selectedReason: string | null = null;

  constructor(private dialogRef: MatDialogRef<CallNotHappenedComponent>) { }


  close(confirmed: boolean) {
    this.dialogRef.close(confirmed ? this.selectedReason : null);
  }
}
