import { Component, OnInit, ViewChild, Input } from '@angular/core';
import {MatPaginator} from '@angular/material/paginator';
import { MatSort, MatSortable } from '@angular/material/sort';
import {MatTableDataSource} from '@angular/material/table';
import { MatSnackBar } from '@angular/material/snack-bar';
import { FormControl, FormGroup } from '@angular/forms';

@Component({
  selector: 'app-tables',
  templateUrl: './tables.component.html',
  styleUrls: ['./tables.component.css']
})
export class TablesComponent implements OnInit {
  displayColumns: string[] = ['id', 'name', 'gender', 'age', 'location', 'status', 'provider','complaints', 'lastSeen'];
  dataSource;
  @ViewChild(MatPaginator, {static: true}) paginator: MatPaginator;
  @ViewChild(MatSort, {static: true}) sort: MatSort;
  @Input() data;
  @Input() isCompletedVisit: boolean;
  
  // date-range filter form.
  filterForm = new FormGroup({ fromDate: new FormControl(), toDate: new FormControl()});
  get fromDate() { return this.filterForm.get('fromDate').value; }
  get toDate() { return this.filterForm.get('toDate').value; }

  constructor(private snackbar: MatSnackBar) {
  }

  ngOnInit() {
    this.dataSource = new MatTableDataSource(this.data);
    this.dataSource.filterPredicate = (data, filter) => {
      if (typeof filter === 'number' && this.fromDate && this.toDate) {
        return new Date(data.lastSeen) >= this.fromDate && new Date(data.lastSeen) <= this.toDate;
      }
      if( typeof filter === 'string') {
        return data.name.toLowerCase().includes(filter) ||  data.id.toLowerCase().includes(filter) ||
        data.provider.toLowerCase().includes(filter)  ;
      }
    }
    this.dataSource.paginator = this.paginator;
    this.sort.sort(({ id: 'lastSeen', start: 'asc'}) as MatSortable);
    this.dataSource.sort = this.sort;
  }

  applyFilter(filterValue: string) {
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  //To apply date filter on data
  applyDateFilter() {
    if(this.fromDate && this.toDate) {
      this.dataSource.filter = Math.random();
    } else {
      this.snackbar.open('Please select start and end date', null, { duration: 4000 });
    }
  }

}
