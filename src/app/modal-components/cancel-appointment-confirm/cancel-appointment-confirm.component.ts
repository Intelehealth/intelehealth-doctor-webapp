import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { TranslateService } from '@ngx-translate/core';
import { ToastrService } from 'ngx-toastr';
import { ApiResponseModel } from 'src/app/model/model';
import { AppointmentService } from 'src/app/services/appointment.service';
import { getCacheData } from 'src/app/utils/utility-functions';
import { doctorDetails } from 'src/config/constant';

@Component({
  selector: 'app-cancel-appointment-confirm',
  templateUrl: './cancel-appointment-confirm.component.html',
})
export class CancelAppointmentConfirmComponent implements OnInit {

  constructor(@Inject(MAT_DIALOG_DATA) public data,
    private dialogRef: MatDialogRef<CancelAppointmentConfirmComponent>,
    private appointmentService: AppointmentService,
    private toastr: ToastrService, private translateService: TranslateService) {

  }

  ngOnInit(): void {
  }

  cancel() {
    const payload = {
      id: this.data.id,
      visitUuid: this.data.visitUuid,
      hwUUID: this.userId,
    };
    this.appointmentService.cancelAppointment(payload).subscribe((res: ApiResponseModel) => {
        if (res) {
          if (res.status) {
            this.close(true);
          } else {
            this.toastr.error(this.translateService.instant('You can\'t cancel the past appointment'), this.translateService.instant('Can\'t Cancel'));
            this.close(false);
          }
        }
    });
  }

  get userId() {
    return getCacheData(true, doctorDetails.USER).uuid;
  }

  close(val: boolean) {
    this.dialogRef.close(val);
  }

}
