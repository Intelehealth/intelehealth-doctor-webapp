import { VisitService } from 'src/app/services/visit.service';
import { FormControl, FormGroup } from '@angular/forms';
import { Component, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-report',
  templateUrl: './report.component.html',
  styleUrls: ['./report.component.css']
})
export class ReportComponent implements OnInit {
  reportForm = new FormGroup({
    start: new FormControl(),
    end: new FormControl(),
  });

  constructor(private dialogRef: MatDialogRef<ReportComponent>,
    private visitService: VisitService,
    private snackbar: MatSnackBar) { }

  ngOnInit(): void {
  }

  onSubmit() {
    let { start, end } = this.reportForm.value;
    start = start.toISOString().split('T')[0];
    end = end.toISOString().split('T')[0];
    this.visitService.getVisitReport(start, end)
    .subscribe(response => {
      if (response.filepath) {
          this.downloadFile(response.filepath);
      } else {
        this.snackbar.open(response.message, null, { duration: 4000 });
      }
    });
  }

  downloadFile(url) {
    const a = document.createElement('a');
    a.href = url;
    a.download = 'report_excel.xlsx';
    a.click();
  }

  onClose() {
    this.dialogRef.close();
  }

}
