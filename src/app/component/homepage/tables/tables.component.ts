import { Component, OnInit, ViewChild, Input } from '@angular/core';
import {MatPaginator} from '@angular/material/paginator';
import { MatSort, MatSortable } from '@angular/material/sort';
import {MatTableDataSource} from '@angular/material/table';

@Component({
  selector: 'app-tables',
  templateUrl: './tables.component.html',
  styleUrls: ['./tables.component.css']
})
export class TablesComponent implements OnInit {
  displayColumns: string[] = ['id', 'name', 'gender', 'dob', 'location', 'status', 'provider', 'lastSeen'];
  dataSource;
  @ViewChild(MatPaginator, {static: true}) paginator: MatPaginator;
  @ViewChild(MatSort, {static: true}) sort: MatSort;
  @Input() data;
  constructor() { }

  ngOnInit() {
    this.dataSource = new MatTableDataSource(this.data);
    this.dataSource.paginator = this.paginator;
    this.sort.sort(({ id: 'lastSeen', start: 'asc'}) as MatSortable);
    this.dataSource.sort = this.sort;
  }

  applyFilter(filterValue: string) {
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

}
