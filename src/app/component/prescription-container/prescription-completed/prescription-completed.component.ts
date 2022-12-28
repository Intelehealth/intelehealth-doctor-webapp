import { Component, Input, OnInit, ViewChild } from '@angular/core';
import {MatPaginator} from '@angular/material/paginator';
import {MatTableDataSource} from '@angular/material/table';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-prescription-completed',
  templateUrl: './prescription-completed.component.html',
  styleUrls: ['./prescription-completed.component.scss']
})
export class PrescriptionCompletedComponent implements OnInit {

  items = ["Completed Visits"];
  expandedIndex = 0;
  displayedColumns: string[] = ['name', 'age', 'visit_created', 'location', 'cheif_complaint', 'prescription_sent'];
  dataSource = new MatTableDataSource<any>();
  baseUrl: string = environment.baseURL;
  isLoading: boolean = false;
  @Input() completedVisits: any = [];
  @ViewChild(MatPaginator) paginator: MatPaginator;

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
  }

  constructor() { }

  ngOnInit(): void {
    this.dataSource = new MatTableDataSource(this.completedVisits);
    this.dataSource.paginator = this.paginator;
  }

  onImgError(event: any) {
    event.target.src = 'assets/svgs/user.svg';
  }
}
