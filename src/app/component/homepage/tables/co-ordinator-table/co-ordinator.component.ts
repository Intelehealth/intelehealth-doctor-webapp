import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
declare var saveToStorage: any;

@Component({
  selector: 'app-co-ordinator-table',
  templateUrl: './co-ordinator.component.html',
  styleUrls: ['./co-ordinator.component.css']
})
export class CoOrdinatorComponent implements OnInit {
  displayColumns: string[] = ['urgent', 'id', 'name', 'gender', 'dueDate', 'status', 'lastCalled'];
  dataSource;
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;
  @Input() data;

  constructor() { }

  ngOnInit(): void {
    this.dataSource = new MatTableDataSource(this.data);
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  applyFilter(filterValue: string) {
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  addEvent(data) {
    saveToStorage('referral', data.data);
  }
}
