import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-file-download',
  templateUrl: './file-download.component.html',
})
export class FileDownloadComponent implements OnInit {

  private value=0;
  constructor(@Inject(MAT_DIALOG_DATA) public data: any,
  private dialogRef: MatDialogRef<FileDownloadComponent>) { }

  ngOnInit(): void {
  }

  get value1() {
    return this.value;
  }

  set value1(value) {
    if(!isNaN(value) && value <=100) {
      this.value = value;
    }
  }

  close(val: any) {
    this.dialogRef.close(val);
  }

}