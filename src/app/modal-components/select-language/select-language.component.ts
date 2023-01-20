import { Component, Inject, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-select-language',
  templateUrl: './select-language.component.html',
  styleUrls: ['./select-language.component.scss']
})
export class SelectLanguageComponent implements OnInit {

  languageForm: FormGroup;

  constructor(@Inject(MAT_DIALOG_DATA) public data: any,
  private dialogRef: MatDialogRef<SelectLanguageComponent>) {
    this.languageForm = new FormGroup({
      language: new FormControl('en', Validators.required)
    });
  }

  ngOnInit(): void {
  }

  select() {
    this.dialogRef.close(this.languageForm.value);
  }

  close(val: any) {
    this.dialogRef.close(val);
  }

}
