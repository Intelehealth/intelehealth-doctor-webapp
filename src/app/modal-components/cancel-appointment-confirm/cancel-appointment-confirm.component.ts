import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ToastrService } from 'ngx-toastr';
import { AppointmentService } from 'src/app/services/appointment.service';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-cancel-appointment-confirm',
  templateUrl: './cancel-appointment-confirm.component.html',
  styleUrls: ['./cancel-appointment-confirm.component.scss']
})
export class CancelAppointmentConfirmComponent implements OnInit {

  selectedReason = "";
  otherReason = "";
  reasons = ["Doctor Not Available", "Patient Not Available", "Other"];
  locale: any = localStorage.getItem('selectedLanguage');
  
  constructor(@Inject(MAT_DIALOG_DATA) public data: any,
    private dialogRef: MatDialogRef<CancelAppointmentConfirmComponent>,
    private appointmentService: AppointmentService,
    private toastr: ToastrService,
    private translateService: TranslateService
) {

  }

  ngOnInit(): void {
  }

  get reason() {
    let reason;
    if (this.selectedReason === this.reasons[2]) reason = this.otherReason;
    else reason = this.selectedReason;
    return reason;
  }

  cancel() {
    const payload = {
      id: this.data.id,
      visitUuid: this.data.visitUuid,
      reason: this.reason,
      hwUUID: this.userId,
    };
    this.appointmentService.cancelAppointment(payload).subscribe((res: any) => {
        if(res) {
          if (res.status) {
            this.close(true);
          } else {
            this.toastr.error(this.translateService.instant(`messages.${"You can't cancel the past appointment"}`), this.translateService.instant(`messages.${"Can't Cancel"}`));
            this.close(false);
          }
        }
    });
  }

  get userId() {
    return JSON.parse(localStorage.user).uuid;
  }

  close(val: any) {
    this.dialogRef.close(val);
  }

}
