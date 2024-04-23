import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ReoportService } from '../../services/report.service';

@Component({
  selector: 'app-file-download',
  templateUrl: './file-download.component.html',
  styleUrls: ['./file-download.component.scss']
})
export class FileDownloadComponent implements OnInit {

  value = 0;
  constructor(@Inject(MAT_DIALOG_DATA) public data: any,
    private dialogRef: MatDialogRef<FileDownloadComponent>,
    private reportService: ReoportService) { }

  ngOnInit(): void {
    this.reportService.getReport(this.data).subscribe({
      next: (event: any) => {
        this.getReportSuccess(event);
      },
      error: () => {
        this.dialogRef.close(false);
      }
    });
  }

   getReportSuccess(event: any) {
    if (event['loaded'] && event['total']) {
      this.value = Math.round(event['loaded'] / event['total'] * 100);
    }
    if (event?.body) {
      window.location.href = event.body.fname;
      this.close(true);
    }
  }

  close(val: any) {
    this.dialogRef.close(val);
  }

}