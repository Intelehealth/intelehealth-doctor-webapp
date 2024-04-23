import { Component } from '@angular/core';
import { ModalService } from '../services/modal.service';
import { MatTableDataSource } from '@angular/material/table';

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
      name: 'List of Visits between two dates',
      buttonName: "Create Report"
    },
    {
      id: 2,
      name: 'Visit Details with Textual Clinical Note and Data Segregation',
      buttonName: "Create Report"
    },
    {
      id: 3,
      name: 'Individual Client Report Part 1',
      buttonName: "Create Report"
    }
  ];

  displayedColumns: string[] = ['name', 'buttonName'];
  constructor(private modalService: ModalService) { }

  createReport(element) {
    let data = {
      reportId: element.id,
      title: element.name,
      field1: 'Start date',
      field2: 'End date',
      cancelBtnText: 'Cancel',
      confirmBtnText: 'Generate Report'
    };
    this.modalService.openGenerateReportDialog(data).subscribe((res: any) => {
      if (res) {
        let body = {
          reportId: element.id,
          selectedData: res
        }
        this.modalService.openFileDownloadDialoag(body).subscribe((res: any) => {
          if (res) {
            this.reportSuccess();
          } else {
            this.reportError();
          }
        });
      }
    });
  }


  reportSuccess() {
    this.modalService.openReportSuccessDialog().subscribe(() => {
    });
  }

  reportError() {
    this.modalService.openReportErrorDialog().subscribe(() => {
    });
  }
}