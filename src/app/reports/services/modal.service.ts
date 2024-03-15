import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ReportsSuccessComponent } from '../modals/reports-success/reports-success.component';
import { Observable } from 'rxjs';
import { ReportErrorComponent } from '../modals/reports-error/reports-error.component';

@Injectable({
  providedIn: 'root'
})
export class ModalService {

  constructor(private dialog: MatDialog) { }

  openReportSuccessDialog(): Observable<any> {
    const dialogRef = this.dialog.open(ReportsSuccessComponent, { panelClass: 'modal-md' } );
    return dialogRef.afterClosed();
  }

  openReportErrorDialog(): Observable<any> {
    const dialogRef = this.dialog.open(ReportErrorComponent, { panelClass: 'modal-md' } );
    return dialogRef.afterClosed();
  }
}