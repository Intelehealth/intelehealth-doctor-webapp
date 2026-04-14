import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ReoportService } from '../../services/report.service';
import { HttpEventType } from '@angular/common/http';

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
    this.value = 10;
    setInterval(() => {
      if (event && event.type !== 4 && this.value < 90) {
        this.value += 20;
      }
    }, 500);

    if (event.type === HttpEventType.Response) {
      if(!event?.body?.fname || 
         event?.body?.fname?.toLowerCase()?.includes('error') || 
         event?.body?.fname?.toLowerCase()?.includes('exception') ||
         event?.body?.fname?.toLowerCase()?.includes('failed') ||
         !this.isValidFileUrl(event?.body?.fname)) {
        this.close(false);
        return;  
      }
      window.location.href = event.body.fname;
      this.close(true);
    }
  }

  /**
   * Check if the file URL is valid
   * @param {string} url - The file URL to validate
   * @return {boolean} - True if valid URL, false otherwise
   */
  private isValidFileUrl(url: string): boolean {
    if (!url) return false;
    
    try {
      const urlObj = new URL(url);
      // Check if it's a valid HTTP/HTTPS URL
      return urlObj.protocol === 'http:' || urlObj.protocol === 'https:';
    } catch (error) {
      // If URL parsing fails, it's not a valid URL
      return false;
    }
  }

  close(val: any) {
    this.dialogRef.close(val);
  }

}