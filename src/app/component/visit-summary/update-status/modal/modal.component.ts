import { Component, Inject, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-modal',
  templateUrl: './modal.component.html',
  styleUrls: ['./modal.component.css']
})
export class ModalComponent implements OnInit {
  showDiagnosis: Boolean = false;
  minDate = new Date(new Date().setDate(new Date().getDate() + 2));
  date = new FormControl(this.minDate);
  newDate;

  constructor(@Inject(MAT_DIALOG_DATA) public data,
    private dialogRef: MatDialogRef<ModalComponent>) { }

  ngOnInit(): void {
    if (this.data) {
      this.showDiagnosis = true;
    }
  }

  onChange(value) {
    this.newDate = value;
  }

  close(): void {
    this.dialogRef.close(this.newDate);
  }

}
