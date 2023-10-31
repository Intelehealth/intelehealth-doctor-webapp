import { Component, Inject } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ToastrService } from 'ngx-toastr';
import { SupportService } from 'src/app/services/support.service';
import { getCacheData } from 'src/app/utils/utility-functions';

@Component({
  selector: 'app-raise-ticket',
  templateUrl: './raise-ticket.component.html',
  styleUrls: ['./raise-ticket.component.scss']
})
export class RaiseTicketComponent {
export class RaiseTicketComponent {

  raiseTicketForm: FormGroup;
  submitted: boolean = false;

  constructor(@Inject(MAT_DIALOG_DATA) public data,
  constructor(@Inject(MAT_DIALOG_DATA) public data,
    private dialogRef: MatDialogRef<RaiseTicketComponent>,
    private supportService: SupportService,
    private toastr: ToastrService
  ) {
    this.raiseTicketForm = new FormGroup({
      title: new FormControl('', [Validators.required]),
      description: new FormControl('', [Validators.required]),
      priority: new FormControl('low', [Validators.required]),
    });
  }

  get f() { return this.raiseTicketForm.controls; }

  /**
  * Close modal
  * @param {boolean} val - Dialog result
  * @return {void}
  */
  close(val: boolean) {
    this.dialogRef.close(val);
  }

  /**
  * Raise support ticket
  * @return {void}
  */
  raiseTicket() {
    this.submitted = true;
    if (this.raiseTicketForm.invalid) {
      return;
    }

    const data = {
      title: `IDA4 - ${this.raiseTicketForm.value.title} <${getCacheData(true,'provider')?.person.display}>`,
      description: this.raiseTicketForm.value.description,
      priority: this.raiseTicketForm.value.priority
    };
    this.supportService.raiseTicket(data).subscribe(res => {
      if (res) {
        this.supportService.storeTicket(getCacheData(true, 'user')?.uuid, res).subscribe(data => {
          this.toastr.success('Ticket has been raised successfully!', 'Ticket raised');
          this.submitted = false;
          this.close(true);
        });
      }
    });
  }

}
