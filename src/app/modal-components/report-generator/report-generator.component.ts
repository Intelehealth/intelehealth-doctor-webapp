import { Component, Inject } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE, NativeDateAdapter } from '@angular/material/core';
import { formatDate } from '@angular/common';
import { getCacheData } from 'src/app/utils/utility-functions';
import { languages } from 'src/config/constant';

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
      return formatDate(date.toDateString(), 'EEE MMM dd yyyy', this.locale);
    }
  }
};

@Component({
  selector: 'app-report-generator',
  templateUrl: './report-generator.component.html',
  styleUrls: ['./report-generator.component.scss'],
  providers: [
    { provide: DateAdapter, useClass: PickDateAdapter },
    { provide: MAT_DATE_FORMATS, useValue: PICK_FORMATS },
    { provide: MAT_DATE_LOCALE, useValue: getCacheData(false, languages.SELECTED_LANGUAGE) }
  ]
})
export class ReportGeneratorComponent {

  reportForm: FormGroup;
  submitted: boolean = false;
  today = new Date().toISOString().slice(0, 10);

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
    this.dialogRef.close(this.reportForm);
  }
}