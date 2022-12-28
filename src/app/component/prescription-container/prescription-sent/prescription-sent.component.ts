import { Component, Input, OnChanges, OnInit, SimpleChanges, ViewChild } from '@angular/core';
import {MatPaginator} from '@angular/material/paginator';
import {MatTableDataSource} from '@angular/material/table';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-prescription-sent',
  templateUrl: './prescription-sent.component.html',
  styleUrls: ['./prescription-sent.component.scss']
})
export class PrescriptionSentComponent implements OnInit {

  items = ["Prescription Sent"];
  expandedIndex = 0;
  displayedColumns: string[] = ['name', 'age', 'visit_created', 'location', 'cheif_complaint', 'prescription_sent'];
  dataSource = new MatTableDataSource<any>();
  baseUrl: string = environment.baseURL;
  isLoading: boolean = false;
  @Input() prescriptionsSent: any = [];
  @ViewChild(MatPaginator) paginator: MatPaginator;

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
  }

  constructor() { }

  ngOnInit(): void {
    this.dataSource = new MatTableDataSource(this.prescriptionsSent);
    this.dataSource.paginator = this.paginator;
  }

  onImgError(event: any) {
    event.target.src = 'assets/svgs/user.svg';
  }

}
