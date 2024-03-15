import { Component, OnInit } from '@angular/core';
import { ModalService } from '../services/modal.service';
import { MatTableDataSource } from '@angular/material/table';

@Component({
  selector: 'app-report-list',
  templateUrl: './report-list.component.html',
  styleUrls: ['./report-list.component.scss']
})
export class ReportListComponent implements OnInit {
  private _value = 0;
  dataSource =  new MatTableDataSource<any>();
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
   
  ngOnInit(): void {
  }

  get value() {
    return this._value;
  }

  set value(value) {
    if (!isNaN(value) && value <= 100) {
      this._value = value;
    }
  }

  createReport(element: Object) {
    console.log("Elem", element)
    this.modalService.openReportSuccessDialog().subscribe((res: any) => {
      if (res) {
        console.log("REs", res)
      } else {

      }
    });
  }


  open1() {
    this.modalService.openReportErrorDialog().subscribe((res: any) => {
      if (res) {
        console.log("Error",res)
      } else {

      }
    });
  }
}
