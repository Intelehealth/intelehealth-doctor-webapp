import { Component } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
import { CoreService } from 'src/app/services/core/core.service';
import { isFeaturePresent } from 'src/app/utils/utility-functions';

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
      name: 'List of Patients between two dates',
      buttonName: "Create Report"
    },
    {
      id: 2,
      name: 'List of Visits between two dates',
      buttonName: "Create Report"
    }
  ];

  displayedColumns: string[] = ['name', 'buttonName'];
  constructor(private modalService: CoreService, private router: Router) { }

  createReport(element) {
    let data = {
      reportId: element.id,
      title: element.name,
      field1: 'Start date',
      field2: 'End date',
      // Email address field is not offered in production — data.field3 gates both the
      // dialog's *ngIf for this input and its required/email validators (report-generator.component.ts).
      field3: isFeaturePresent('reportEmail') ? 'Email address' : '',
      cancelBtnText: 'Cancel',
      confirmBtnText: 'Generate Report'
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
