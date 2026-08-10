import { Component, Inject } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { DateAdapter, MAT_DATE_FORMATS, NativeDateAdapter } from '@angular/material/core';
import { formatDate } from '@angular/common';

export const PICK_FORMATS = {
  parse: { dateInput: { month: 'short', year: 'numeric', day: 'numeric' } },
  display: {
    dateInput: 'input',
    monthYearLabel: { year: 'numeric', month: 'short' },
    dateA11yLabel: { year: 'numeric', month: 'long', day: 'numeric' },
    monthYearA11yLabel: { year: 'numeric', month: 'long' }
  }
};

class PickDateAdapter extends NativeDateAdapter {
  format(date: Date, displayFormat: Object): string {
    if (displayFormat === 'input') {
      return formatDate(date, 'dd MMM yyyy', this.locale);
    } else {
      return date.toDateString();
    }
  }
};

@Component({
  selector: 'app-report-generator',
  templateUrl: './report-generator.component.html',
  styleUrls: ['./report-generator.component.scss'],
  providers: [
    { provide: DateAdapter, useClass: PickDateAdapter },
    { provide: MAT_DATE_FORMATS, useValue: PICK_FORMATS }
  ]
})
export class ReportGeneratorComponent {

  reportForm: FormGroup;
  submitted: boolean = false;
  today = new Date();

  constructor(@Inject(MAT_DIALOG_DATA) public data,
    private dialogRef: MatDialogRef<ReportGeneratorComponent>) {
    this.reportForm = new FormGroup({
      field1: new FormControl(null, [Validators.required]),
      field2: new FormControl(null, [Validators.required]),
      field3: new FormControl('', data.field3 ? [Validators.required, Validators.email] : [])
    });
  }

  get f() { return this.reportForm.controls; }

  get isDatesValid() {
    const { field1, field2 } = this.reportForm.value;
    if (!field1 || !field2) {
      return false;
    }
    return new Date(field1).getTime() > new Date(field2).getTime();
  }

  /**
  * Close modal
  * @return {void}
  */
  close() {
    this.dialogRef.close();
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
    this.reportForm.patchValue({
      field1: formatDate(this.reportForm.value.field1, 'yyyy-MM-dd', 'en-US'),
      field2: formatDate(this.reportForm.value.field2, 'yyyy-MM-dd', 'en-US')
    });
    this.dialogRef.close(this.reportForm);
  }
}