import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { UnsavedChangesService } from 'src/app/services/unsaved-changes.service';

@Component({
  selector: 'app-confirmation-dialog',
  templateUrl: './confirmation-dialog.component.html',
  styleUrls: ['./confirmation-dialog.component.css']
})
export class ConfirmationDialogComponent implements OnInit {
  constructor(
    private uc: UnsavedChangesService,
    public dialogRef: MatDialogRef<ConfirmationDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { message: string }
  ) { }

  ngOnInit(): void {
  }

  closeDialog() {
    this.dialogRef.close(false);
  }

  dischardChangesAndClose() {
    this.uc.updateUnsavedStatus(false);
    this.dialogRef.close(true);
  }

  getLang() {
    return localStorage.getItem("selectedLanguage");
  }
}
