import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ReportsSuccessComponent } from '../modals/reports-success/reports-success.component';
import { Observable } from 'rxjs';
import { ReportErrorComponent } from '../modals/reports-error/reports-error.component';
import { ReportGeneratorComponent } from '../modals/report-generator/report-generator.component';
import { FileDownloadComponent } from '../modals/file-download/file-download.component';

@Injectable({
  providedIn: 'root'
})
export class ModalService {

  constructor(private dialog: MatDialog) { }


  openGenerateReportDialog(data: { reportId: Number, title: string, field1: string, field2: string, cancelBtnText: string, confirmBtnText: string }): Observable<any> {
    const dialogRef = this.dialog.open(ReportGeneratorComponent, { panelClass: 'modal-md', data });
    return dialogRef.afterClosed();
  }

  openFileDownloadDialoag(): Observable<any> {
    const dialogRef = this.dialog.open(FileDownloadComponent, { panelClass: 'modal-md' });
    return dialogRef.afterClosed();
  }
  openReportSuccessDialog(): Observable<any> {
    const dialogRef = this.dialog.open(ReportsSuccessComponent, { panelClass: 'modal-md' });
    return dialogRef.afterClosed();
  }

  openReportErrorDialog(): Observable<any> {
    const dialogRef = this.dialog.open(ReportErrorComponent, { panelClass: 'modal-md' });
    return dialogRef.afterClosed();
  }
}