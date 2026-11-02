import { Component, Inject, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MindmapService } from 'src/app/services/mindmap.service';
import * as moment from 'moment';
import { TranslateService } from '@ngx-translate/core';
import { getCacheData } from 'src/app/utils/utility-functions';
import { languages } from 'src/config/constant';
import { ApiResponseModel } from 'src/app/model/model';
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
  today: Date;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data,
    private dialogRef: MatDialogRef<AddLicenseKeyComponent>,
    private mindmapService: MindmapService,
    private translateService: TranslateService) {
    this.licenseForm = new FormGroup({
      key: new FormControl('', [Validators.required]),
      expiryDate: new FormControl(null, [Validators.required])
    });
  }

  ngOnInit(): void {
    this.translateService.use(getCacheData(false, languages.SELECTED_LANGUAGE));
    this.today = new Date();
    this.licenseForm.patchValue({
      key: this.data?.keyName,
      expiryDate: moment(this.data?.expiry).toDate()
    });
  }

  get f() { return this.licenseForm.controls; }

  /**
  * Close modal
  * @return {void}
  */
  close() {
    this.dialogRef.close(false);
  }

  /**
  * Add new license key
  * @return {void}
  */
  addLicenseKey() {
    this.submitted = true;
    if (this.licenseForm.invalid) {
      return;
    }
    const payload = {
      ...this.licenseForm.value,
      expiryDate: formatDate(this.licenseForm.value.expiryDate, 'yyyy-MM-dd', 'en-US')
    };
    this.mindmapService.addUpdateLicenseKey(payload).subscribe((res: ApiResponseModel) => {
      if (res.success) {
        this.dialogRef.close(res.data);
      } else {
        this.dialogRef.close(false);
      }
    });
  }
}
