import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-no-internet',
  templateUrl: './no-internet.component.html',
})
export class NoInternetComponent implements OnInit {

  constructor(@Inject(MAT_DIALOG_DATA) public data,
  private dialogRef: MatDialogRef<NoInternetComponent>) { }

  ngOnInit(): void {
  }

  close(val: boolean) {
    this.dialogRef.close(val);
  }

}
