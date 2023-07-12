import { AfterContentChecked, AfterViewInit, ChangeDetectorRef, Component, Input, OnChanges, OnInit, SimpleChanges, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
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

  constructor(private translateService: TranslateService) { }

  ngOnInit(): void {
    this.translateService.use(localStorage.getItem('selectedLanguage'));
    this.dataSource = new MatTableDataSource(this.prescriptionsSent);
    this.dataSource.paginator = this.paginator;
  }

  ngOnChanges(changes: SimpleChanges): void {
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
  }

  onImgError(event: any) {
    event.target.src = 'assets/svgs/user.svg';
  }

}
