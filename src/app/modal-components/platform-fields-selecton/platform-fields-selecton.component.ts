import { Component, EventEmitter, Inject, OnInit, Output } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';


@Component({
  selector: 'app-platform-fields-selecton',
  templateUrl: './platform-fields-selecton.component.html',
  styleUrls: ['./platform-fields-selecton.component.scss']
})
export class PlatformFieldsSelectonComponent implements OnInit {
  @Output() onSubmit = new EventEmitter<string>(); // Emit only the selected platform

  form: FormGroup;
  platformOptions = ['Mobile', 'Webapp', 'Both'];
lang_name:string = '';
  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<PlatformFieldsSelectonComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { platform: string,lang_name:string } 
  ) {}

  ngOnInit(): void {
    this.lang_name = this.data.lang_name;
    this.form = this.fb.group({
      platform: [this.data?.platform || 'Mobile'] 
    });
  }

  handleSubmit(): void {
    const selectedPlatform = this.form.value.platform;
    this.onSubmit.emit(selectedPlatform); 
    this.dialogRef.close();
  }

  handleCancel(): void {
    this.dialogRef.close();
  }
}
