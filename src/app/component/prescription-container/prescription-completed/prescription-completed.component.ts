import { Component, OnInit, ViewChild } from '@angular/core';

import {MatPaginator} from '@angular/material/paginator';
import {MatTableDataSource} from '@angular/material/table';

export interface PeriodicElement {
  id: string;
  name: string;
  age: number;
  visit_created: string;
  location: string;
  cheif_complaint: string;
  prescription_sent: string;
}

const ELEMENT_DATA: PeriodicElement[] = [
  {id: "1", name: 'Anurag Sangale (M)', age: 32, visit_created: '22 Dec, 2022', location: 'TM Clinic 1', cheif_complaint: 'Fever & Cough', prescription_sent: '1 hr ago'},
  {id: "2", name: 'Muskan Kala (M)', age: 24, visit_created: '1 Dec, 2022', location: 'TM Clinic 2', cheif_complaint: 'Runny Nose', prescription_sent: '12 Dec, 2022'},
  {id: "3", name: 'Muskan Kala (M)', age: 19, visit_created: '15 Nov, 2022', location: 'TM Clinic 3', cheif_complaint: 'Fever, Headache & Cough', prescription_sent: '1 Oct 2022'},
  {id: "4", name: 'Muskan Kala (M)', age: 45, visit_created: '5 Oct, 2022', location: 'TM Clinic 4', cheif_complaint: 'Back Pain', prescription_sent: '27 Sep 2022'},
  {id: "5", name: 'Muskan Kala (M)', age: 35, visit_created: '1 Aug, 2022', location: 'TM Clinic 5', cheif_complaint: 'Fever', prescription_sent: '10 Aug 2022'}
];

@Component({
  selector: 'app-prescription-completed',
  templateUrl: './prescription-completed.component.html',
  styleUrls: ['./prescription-completed.component.scss']
})
export class PrescriptionCompletedComponent implements OnInit {

  items = ["Completed Visits"];
  expandedIndex = 0;
  displayedColumns: string[] = ['name', 'age', 'visit_created', 'location', 'cheif_complaint', 'prescription_sent'];
  dataSource = new MatTableDataSource<PeriodicElement>(ELEMENT_DATA);

  @ViewChild(MatPaginator) paginator: MatPaginator;

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
  }

  constructor() { }

  ngOnInit(): void {
  }

}
