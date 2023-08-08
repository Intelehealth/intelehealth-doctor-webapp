import { AfterViewInit, Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges, ViewChild } from '@angular/core';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-completed',
  templateUrl: './completed.component.html',
  styleUrls: ['./completed.component.scss']
})
export class CompletedComponent implements OnInit, AfterViewInit, OnChanges {

  displayedColumns: string[] = ['name', 'age', 'visit_created', 'location', 'cheif_complaint', 'prescription_sent', 'visit_ended'];
  dataSource = new MatTableDataSource<any>();
  baseUrl: string = environment.baseURL;
  @Input() completedVisits: any = [];
  @Input() completedVisitsCount: number = 0;
  @ViewChild(MatPaginator) paginator: MatPaginator;
  offset: number = 100;
  recordsFetched: number = 100;
  pageEvent: PageEvent;
  pageIndex:number = 0;
  pageSize:number = 5;
  @Output() fetchPageEvent = new EventEmitter<number>();

  constructor() { }

  ngOnInit(): void {
    this.dataSource = new MatTableDataSource(this.completedVisits.slice(this.pageIndex*this.pageSize, (this.pageIndex+1)*this.pageSize));
    // this.dataSource.paginator = this.paginator;
  }

  ngAfterViewInit() {
    // this.dataSource.paginator = this.paginator;
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (!changes.completedVisits.firstChange) {
      this.recordsFetched += this.offset;
      this.dataSource = new MatTableDataSource(this.completedVisits.slice(this.pageIndex*this.pageSize, (this.pageIndex+1)*this.pageSize));
    }
  }

  onImgError(event: any) {
    event.target.src = 'assets/svgs/user.svg';
  }

  public getData(event?:PageEvent){
    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;
    if (((event.pageIndex+1)*this.pageSize) > this.recordsFetched) {
      this.fetchPageEvent.emit((this.recordsFetched+this.offset)/this.offset)
    } else {
      this.dataSource = new MatTableDataSource(this.completedVisits.slice(event.pageIndex*this.pageSize, (event.pageIndex+1)*this.pageSize));
    }
    return event;
  }

}
