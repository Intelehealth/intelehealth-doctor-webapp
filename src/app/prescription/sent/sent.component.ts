import { AfterContentChecked, AfterViewInit, ChangeDetectorRef, Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges, ViewChild } from '@angular/core';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { TranslateService } from '@ngx-translate/core';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-sent',
  templateUrl: './sent.component.html',
  styleUrls: ['./sent.component.scss']
})
export class SentComponent implements OnInit, AfterViewInit, OnChanges {

  displayedColumns: string[] = ['name', 'age', 'visit_created', 'location', 'cheif_complaint', 'prescription_sent'];
  dataSource = new MatTableDataSource<any>();
  baseUrl: string = environment.baseURL;
  @Input() prescriptionsSent: any = [];
  @Input() prescriptionsSentCount: number = 0;
  @ViewChild(MatPaginator) paginator: MatPaginator;
  offset: number = 100;
  recordsFetched: number = 100;
  pageEvent: PageEvent;
  pageIndex:number = 0;
  pageSize:number = 5;
  @Output() fetchPageEvent = new EventEmitter<number>();

  constructor(private translateService: TranslateService) { }

  ngOnInit(): void {
    this.translateService.use(localStorage.getItem('selectedLanguage'));
    this.dataSource = new MatTableDataSource(this.prescriptionsSent.slice(this.pageIndex*this.pageSize, (this.pageIndex+1)*this.pageSize));
    // this.dataSource.paginator = this.paginator;
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (!changes.prescriptionsSent.firstChange) {
      this.recordsFetched += this.offset;
      this.dataSource = new MatTableDataSource(this.prescriptionsSent.slice(this.pageIndex*this.pageSize, (this.pageIndex+1)*this.pageSize));
    }
  }

  ngAfterViewInit() {
    // this.dataSource.paginator = this.paginator;
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
      this.dataSource = new MatTableDataSource(this.prescriptionsSent.slice(event.pageIndex*this.pageSize, (event.pageIndex+1)*this.pageSize));
    }
    return event;
  }

}
