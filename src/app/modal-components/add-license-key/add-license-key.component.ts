import { Component, Inject, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MindmapService } from 'src/app/services/mindmap.service';
import * as moment from 'moment';

@Component({
  selector: 'app-add-license-key',
  templateUrl: './add-license-key.component.html',
  styleUrls: ['./add-license-key.component.scss']
})
export class AddLicenseKeyComponent implements OnInit {

  licenseForm: FormGroup;
  submitted: boolean = false;
  today: any;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    private dialogRef: MatDialogRef<AddLicenseKeyComponent>,
    private mindmapService: MindmapService) {
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
    // moment.locale(localStorage.getItem('selectedLanguage'));
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
