import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ToastrService } from 'ngx-toastr';
import { AppointmentService } from 'src/app/services/appointment.service';

@Component({
  selector: 'app-cancel-appointment-confirm',
  templateUrl: './cancel-appointment-confirm.component.html',
  styleUrls: ['./cancel-appointment-confirm.component.scss']
})
export class CancelAppointmentConfirmComponent implements OnInit {

  constructor(@Inject(MAT_DIALOG_DATA) public data: any,
    private dialogRef: MatDialogRef<CancelAppointmentConfirmComponent>,
    private appointmentService: AppointmentService,
    private toastr: ToastrService) {

  }

  ngOnInit(): void {
  }

  cancel() {
    const payload = {
      id: this.data.id,
      visitUuid: this.data.visitUuid,
      hwUUID: this.userId,
    };
    this.appointmentService.cancelAppointment(payload).subscribe((res: any) => {
        if(res) {
          if (res.status) {
            this.close(true);
          } else {
            this.toastr.error("You can't cancel the past appointment", "Can't Cancel");
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
