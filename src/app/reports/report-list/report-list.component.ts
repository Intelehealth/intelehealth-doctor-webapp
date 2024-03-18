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
      name: 'List of visit between two dates',
      buttonName: "Create Report"
    },
    {
      id: 2,
      name: 'List of patient between two dates',
      buttonName: "Create Report"
    }
  ];

  displayedColumns: string[] = ['name', 'buttonName'];
  constructor(private modalService: ModalService) { }

  createReport(element) {
    let data = {
      reportId: element.id,
      title: 'List of visits between two dates',
      field1: 'Start date',
      field2: 'End date',
      cancelBtnText: 'Cancel',
      confirmBtnText: 'Generate Report'
    };
    this.modalService.openGenerateReportDialog(data).subscribe((res: any) => {
      if (res) {
        this.modalService.openFileDownloadDialoag().subscribe((res: any) => {
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
    this.modalService.openReportSuccessDialog().subscribe((res: any) => {
      if (res) {
        console.log("Error", res)
      }
    });
  }

  reportError() {
    this.modalService.openReportErrorDialog().subscribe((res: any) => {
      if (res) {
        console.log("Error", res)
      }
    });
  }
}
