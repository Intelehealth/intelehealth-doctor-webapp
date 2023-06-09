import { AfterViewInit, Component, Input, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-completed',
  templateUrl: './completed.component.html',
  styleUrls: ['./completed.component.scss']
})
export class CompletedComponent implements OnInit, AfterViewInit {

  displayedColumns: string[] = ['name', 'age', 'visit_created', 'location', 'cheif_complaint', 'prescription_sent'];
  dataSource = new MatTableDataSource<any>();
  baseUrl: string = environment.baseURL;
  @Input() completedVisits: any = [];
  @ViewChild(MatPaginator, {static: true}) paginator: MatPaginator;
  locale: any = localStorage.getItem('selectedLanguage');

  constructor() { }

  ngOnInit(): void {
    this.dataSource = new MatTableDataSource(this.completedVisits);
    this.dataSource.paginator = this.paginator;
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
  }

  onImgError(event: any) {
    event.target.src = 'assets/svgs/user.svg';
  }

}
