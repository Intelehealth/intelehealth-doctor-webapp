import { Component, Inject } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-report-generator',
  templateUrl: './report-generator.component.html',
  styleUrls: ['./report-generator.component.scss']
})
export class ReportGeneratorComponent {

  reportForm: FormGroup;
  submitted: boolean = false;

  constructor(@Inject(MAT_DIALOG_DATA) public data,
    private dialogRef: MatDialogRef<ReportGeneratorComponent>) {
    this.reportForm = new FormGroup({
      field1: new FormControl('', [Validators.required]),
      field2: new FormControl('', [Validators.required])
    });
  }

  get f() { return this.reportForm.controls; }

  get isDatesValid() {
    return new Date(this.reportForm.value.field1).getTime() > new Date(this.reportForm.value.field2).getTime();
  }

  /**
  * Close modal
  * @param {boolean} val - Dialog result
  * @return {void}
  */
  close(val: boolean) {
    this.dialogRef.close(val);
  }

  /**
* generate Report
* @return {void}
*/
  generateReport() {
    this.submitted = true;
    if (this.reportForm.invalid) {
      return;
    }
    this.dialogRef.close(this.reportForm);
  }
}