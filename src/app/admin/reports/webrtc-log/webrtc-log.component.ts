import { Component, EventEmitter, Input, Output, SimpleChanges, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { TranslateService } from '@ngx-translate/core';
import { getCacheData } from 'src/app/utils/utility-functions';
import { languages } from 'src/config/constant';
@Component({
  selector: 'app-webrtc-log',
  templateUrl: './webrtc-log.component.html',
  styleUrls: ['./webrtc-log.component.scss']
})
export class WebrtcLogComponent {
  @Input() data: any = [];
  @Output() exportCallData = new EventEmitter();
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;
  displayedColumns: string[] = [];
  dataSource = new MatTableDataSource<any>();
  callDataColumns: any = [
    { label: "Patient Id", key: "patientId" },
    { label: "Patient Name", key: "patientName" },
    { label: "State", key: "state" },
    { label: "District", key: "district" },
    { label: "Village", key: "location" },
    { label: "Doctor Name", key: "doctorName" },
    { label: "Sevika Name", key: "sevikaName" },
    { label: "Start Time", key: "start_time"},
    { label: "End Time", key: "end_time"},
    { label: "Call Duration(In second)", key: "call_duration"},
    { label: "Call Status", key: "call_status" },
    { label: "Reason for call failure", key: "reason" },
  ];
  constructor(private translateService: TranslateService) {
    this.displayedColumns = this.callDataColumns.map((c) => c.key);
  }
  ngOnChanges(changes: SimpleChanges): void {
    this.dataSource.data = [...this.data];
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }
  ngOnInit(): void {
    this.translateService.use(getCacheData(false, languages.SELECTED_LANGUAGE));
    this.dataSource = new MatTableDataSource(this.data);
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }
  export() {
    this.exportCallData.emit();
  }
}