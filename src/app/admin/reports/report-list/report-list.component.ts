import { Component } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
import { CoreService } from 'src/app/services/core/core.service';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-report-list',
  templateUrl: './report-list.component.html',
  styleUrls: ['./report-list.component.scss']
})
export class ReportListComponent {
  dataSource = new MatTableDataSource<any>();
  reports = [
    {
      id: 1,
      name: this.translateService.instant('List of Patients between two dates'),
      buttonName: "Create Report"
    },
    {
      id: 2,
      name: 'List of Visits between two dates',
      buttonName: "Create Report"
    }
  ];

  displayedColumns: string[] = ['name', 'buttonName'];
  constructor(
    private modalService: CoreService, 
    private router: Router,
    private translateService: TranslateService
  ) { }

  createReport(element) {
    let data = {
      reportId: element.id,
      title: element.name,
      field1: this.translateService.instant('Start date'),
      field2: this.translateService.instant('End date'),
      cancelBtnText: this.translateService.instant('Cancel'),
      confirmBtnText: this.translateService.instant('Generate Report')
    };
      this.modalService.openGenerateReportDialog(data).subscribe((res: any) => {
        if (res) {
          let body = {
            reportId: element.id,
            selectedData: res
          }
          this.fileDownloadDialog(body);
        }
      });
  }
  
  fileDownloadDialog(body: { reportId: any; selectedData: any; }) {
    this.modalService.openFileDownloadDialog(body).subscribe((res: any) => {
      if (res) {
        this.reportSuccess();
      } else {
        this.reportError();
      }
    });
  }

  reportSuccess() {
    this.modalService.openReportSuccessDialog().subscribe((result) => {
      if (result === 'admin') {
        this.router.navigate(['/admin/actions']);
      }
    });
  }

  reportError() {
    this.modalService.openReportErrorDialog().subscribe(() => {
    });
  }
}
