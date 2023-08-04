import { Component, Inject, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MindmapService } from 'src/app/services/mindmap.service';
import * as moment from 'moment';
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
      return formatDate(date, 'dd MMMM yyyy', this.locale);
    } else {
      return date.toDateString();
    }
  }
}
@Component({
  selector: 'app-add-license-key',
  templateUrl: './add-license-key.component.html',
  styleUrls: ['./add-license-key.component.scss'],
  providers: [
    { provide: DateAdapter, useClass: PickDateAdapter },
    { provide: MAT_DATE_FORMATS, useValue: PICK_FORMATS }
  ]
})
export class AddLicenseKeyComponent implements OnInit {

  licenseForm: FormGroup;
  submitted: boolean = false;
  today: any;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    private dialogRef: MatDialogRef<AddLicenseKeyComponent>,
    private mindmapService: MindmapService,
    private dateAdapter: DateAdapter<any>
    ) {
    this.licenseForm = new FormGroup({
      key: new FormControl('', [Validators.required]),
      expiryDate: new FormControl('', [Validators.required])
    });
  }

  ngOnInit(): void {
    this.today = new Date().toISOString().slice(0, 10);
    this.licenseForm.patchValue({
      key: this.data?.keyName,
      expiryDate: moment(this.data?.expiry).format("YYYY-MM-DD")
    });
    moment.locale(localStorage.getItem('selectedLanguage'));
    this.dateAdapter.setLocale(localStorage.getItem("selectedLanguage"));
  }

  get f() { return this.licenseForm.controls; }

  close() {
    this.dialogRef.close(false);
  }

  addLicenseKey() {
    this.submitted = true;
    if (this.licenseForm.invalid) {
      return;
    }

    this.mindmapService.addUpdateLicenseKey(this.licenseForm.value).subscribe((res: any) => {
      if (res.success) {
        this.dialogRef.close(res.data);
      } else {
        this.dialogRef.close(false);
      }
    });
  }

}
