import { Component, Inject, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { TranslateService } from '@ngx-translate/core';
import { ToastrService } from 'ngx-toastr';
import { FacilityModuleConfigurationService } from 'src/app/services/facility-module-configuration.service';
import { getCacheData } from 'src/app/utils/utility-functions';
import { languages } from 'src/config/constant';

@Component({
  selector: 'app-add-facility-dialog',
  templateUrl: './add-facility-dialog.component.html',
  styleUrls: ['./add-facility-dialog.component.scss']
})
export class AddFacilityDialogComponent implements OnInit {
  facilityModuleForm: FormGroup;
  submitted = false;
  referralFacilityList: any[] = [];

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    private dialogRef: MatDialogRef<AddFacilityDialogComponent>,
    private translateService: TranslateService,
    private toastr: ToastrService,
    private facilityModuleConfigurationService: FacilityModuleConfigurationService
  ) {
    this.facilityModuleForm = new FormGroup({
      prescriptionApi: new FormControl('', [Validators.required]),
      referralApi: new FormControl('', [Validators.required]),
      appointmentApi: new FormControl('', [Validators.required]),
      status: new FormControl(true, [Validators.required]),
      facilityUuid: new FormControl('', [Validators.required])
    });
  }

  ngOnInit(): void {
    this.translateService.use(getCacheData(false, languages.SELECTED_LANGUAGE));
    this.getReferralList();

    if (this.data) {
      this.prefillForm(this.data);
    }
  }

  getReferralList(): void {
    this.facilityModuleConfigurationService.getReferralFacilityLocation().subscribe(response => {
      this.referralFacilityList = response?.results || [];
    });
  }

  prefillForm(data: any): void {
    this.facilityModuleForm.patchValue({
      prescriptionApi: data.prescriptionApi,
      referralApi: data.referralApi,
      appointmentApi: data.appointmentApi,
      status: data.status,
      facilityUuid: data.facilityUuid
    });
  }

  get f() {
    return this.facilityModuleForm.controls;
  }

  close(): void {
    this.dialogRef.close(false);
  }

  addFacilityModule(): void {
    this.submitted = true;

    if (this.facilityModuleForm.invalid) {
      return;
    }

    const facilityData = { ...this.facilityModuleForm.value };
    facilityData.facilityName = this.referralFacilityList.find(el => el.uuid === facilityData.facilityUuid)?.display;

    const payload = this.data ? { ...facilityData, id: this.data.id } : facilityData;
    this.facilityModuleConfigurationService.saveFacilityConfiguration(payload).subscribe({
      next: () => {
        const message = this.data ? 'Facility updated successfully' : 'Facility added successfully';
        this.toastr.success(this.translateService.instant(message));
        this.dialogRef.close(true);
      },
      error: err => {
        const message = this.data ? 'Failed to update facility' : 'Failed to add facility';
        console.error(message, err);
        this.toastr.error(this.translateService.instant(message));
      }
    });
  }
}
