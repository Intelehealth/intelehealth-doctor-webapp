import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Observable } from 'rxjs/internal/Observable';
import { RescheduleAppointmentConfirmComponent } from '../modal-components/reschedule-appointment-confirm/reschedule-appointment-confirm.component';
import { CancelAppointmentConfirmComponent } from '../modal-components/cancel-appointment-confirm/cancel-appointment-confirm.component';
import { RescheduleAppointmentComponent } from '../modal-components/reschedule-appointment/reschedule-appointment.component';

@Injectable({
  providedIn: 'root'
})
export class CoreService {

  constructor(private dialog: MatDialog) { }

  /**
  * Open cancel appointment confirmation modal
  * @param {any} data - Dialog data
  * @return {Observable<any>} - Dialog result
  */
  openConfirmCancelAppointmentModal(data: any): Observable<any> {
    const dialogRef = this.dialog.open(CancelAppointmentConfirmComponent, { panelClass: "modal-md", data, hasBackdrop: true, disableClose: true });
    return dialogRef.afterClosed();
  }

  /**
  * Open reschedule appointment modal
  * @param {any} data - Dialog data
  * @return {Observable<any>} - Dialog result
  */
  openRescheduleAppointmentModal(data: any): Observable<any> {
    const dialogRef = this.dialog.open(RescheduleAppointmentComponent, { panelClass: "modal-md", data, hasBackdrop: true, disableClose: true });
    return dialogRef.afterClosed();
  }

  /**
  * Open reschedule appointment confirmation modal
  * @param {any} data - Dialog data
  * @return {Observable<any>} - Dialog result
  */
  openRescheduleAppointmentConfirmModal(data: any): Observable<any> {
    const dialogRef = this.dialog.open(RescheduleAppointmentConfirmComponent, { panelClass: "modal-md", data, hasBackdrop: true, disableClose: true });
    return dialogRef.afterClosed();
  }
    
  /**
  * Convert blob to base64
  * @param {Blob} blob - Blob  file
  * @return {Promise} - Promise containing base64
  */
  blobToBase64(blob) {
    return new Promise((resolve, _) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result);
      reader.readAsDataURL(blob);
    });
  }
}
