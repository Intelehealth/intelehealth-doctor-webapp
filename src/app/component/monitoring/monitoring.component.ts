import { Component, OnInit, ViewChild } from "@angular/core";
import { MatPaginator } from "@angular/material/paginator";
import { MatSort } from "@angular/material/sort";
import { MatTableDataSource } from "@angular/material/table";
import { MonitoringService } from "src/app/services/monitoring.service";
import * as moment from "moment";
import { MatTabChangeEvent } from "@angular/material/tabs";
import { ExportToCsv } from "export-to-csv";

@Component({
  selector: "app-monitoring",
  templateUrl: "./monitoring.component.html",
  styleUrls: ["./monitoring.component.css"],
})
export class MonitoringComponent implements OnInit {
  @ViewChild("page0") paginator0: MatPaginator;
  @ViewChild("page1") paginator1: MatPaginator;
  @ViewChild("sort0") sort0: MatSort;
  @ViewChild("sort1") sort1: MatSort;
  drDisplayedColumns: string[] = [];
  hwDisplayedColumns: string[] = [];
  drColumns: any = [
    { label: "Name of HW", key: "name" },
    { label: "Last Sync", key: "lastSyncTimestamp" },
    { label: "Consultation Device", key: "device" },
    { label: "Average Time Spent(In a day)", key: "avgTimeSpentInADay" },
    { label: "Total Time", key: "totalTime" },
    { label: "No. of Days", key: "days", class: 'n-day' },
    { label: "Current Status", key: "status" },
  ];
  hwColumns: any = [
    { label: "Name of HW", key: "name" },
    { label: "Last Sync", key: "lastSyncTimestamp" },
    { label: "Consultation Device", key: "device" },
    { label: "Android Version", key: "androidVersion" },
    { label: "App Version", key: "version" },
    { label: "Average Time Spent(In a day)", key: "avgTimeSpentInADay" },
    { label: "Total Time", key: "totalTime" },
    { label: "Last Activity", key: "lastActivity" },
    { label: "No. of Days", key: "days", class: 'n-day' },
    { label: "Current Status", key: "status" },
  ];
  data: any = [];
  allData: any = [];
  dataSource;
  selectedIndexBinding;
  csvExporter;

  constructor(private monitorService: MonitoringService) {
    this.hwDisplayedColumns = this.hwColumns.map((c) => c.key);
    this.drDisplayedColumns = this.drColumns.map((c) => c.key);
  }

  ngOnInit(): void {
    this.getStatuses();
    setTimeout(() => {
      this.getStatuses();
    }, 2000);
  }

  filterData() {
    setTimeout(() => {
      let page = 0;
      this.allData.filter((d) => {
        this.setTableData(d);
        if (this.selectedIndexBinding) {
          page = 0;
          return d.userType === "Doctor";
        } else {
          page = 1;
          return d.userType === "Health Worker";
        }
      });
      this.dataSource = new MatTableDataSource(this.data);
      this.dataSource.paginator = page == 1 ? this.paginator0 : this.paginator1;
      this.dataSource.sort = page === 1 ? this.sort0 : this.sort1;
    }, 0);
  }

  setTableData(item) {
    switch (item.userType) {
      case 'Doctor': {
        let tableCol: any = {}
        this.drColumns.forEach(col => {
          tableCol[col.key] = this.showValue(item, col.key);
          tableCol.userType = item.userType;
        });
        this.data.push(tableCol);
      }
        break;
      case 'Health Worker': {
        let tableCol: any = {}
        this.hwColumns.forEach(col => {
          tableCol[col.key] = this.showValue(item, col.key);
          tableCol.userType = item.userType;
        });
        this.data.push(tableCol);
      }
        break;
    }

  }

  get len() {
    return this.data.length;
  }

  getStatuses() {
    this.monitorService.getAllStatuses().subscribe({
      next: (res: any) => {
        this.allData = res?.data || this.allData;
        this.filterData();
      },
    });
  }

  tabChange(changeEvent: MatTabChangeEvent) {
    // console.log("Tab position: " + changeEvent.tab.position);
    this.filterData();
  }

  trunc(value) {
    return Math.trunc(value);
  }

  showValue(obj, key) {
    if (key === 'days') {
      const createdAt = moment(obj.createdAt)
      const duration = moment.duration(moment().diff(createdAt));
      return duration.asDays().toFixed();
    } else if (key === 'avgTimeSpentInADay') {
      const createdAt = moment(obj.createdAt)
      const duration = moment.duration(moment().diff(createdAt));
      const totalTime = moment(obj.totalTime, 'h[h] m[m]');
      const totalDuration = moment.duration({ minutes: totalTime.minutes(), hours: totalTime.hours() });
      const avgTimeSpentInADayInMins = totalDuration.asMinutes() / this.trunc(duration.asDays());
      const hours = this.trunc(avgTimeSpentInADayInMins / 60);
      const mins = this.trunc(avgTimeSpentInADayInMins - (hours * 60));
      return `${!isNaN(hours) ? hours : 0}h ${!isNaN(mins) ? mins : 0}m`;
    } else if (["lastSyncTimestamp", "lastLogin"].includes(key)) {
      return moment(obj[key]).format("MMM DD YYYY hh:mm A");
    } else {
      return obj[key];
    }
  }

  get user() {
    try {
      return JSON.parse(localStorage.user);
    } catch (error) {
      return {};
    }
  }

  export() {
    this.hwExport();
    setTimeout(() => {
      this.drExport();
    }, 1000);
  }

  hwExport() {
    const headers = this.hwColumns.map(col => col.label);
    const csvExporter = new ExportToCsv({
      fieldSeparator: ',',
      quoteStrings: '"',
      decimalSeparator: '.',
      showLabels: true,
      showTitle: true,
      title: `hw-${Date.now()}`,
      filename: `hw-${Date.now()}`,
      useTextFile: false,
      useBom: true,
      // useKeysAsHeaders: true,
      headers// ['Column 1', 'Column 2', etc...] <-- Won't work with useKeysAsHeaders present!
    });
    const _data: any = Array.from(this.data.filter(d => d.userType === "Health Worker"))
    const data = _data.map(d => {
      delete d.userType
      return d;
    });
    csvExporter.generateCsv(data);
  }

  drExport() {
    const headers = this.drColumns.map(col => col.label);
    const csvExporter = new ExportToCsv({
      fieldSeparator: ',',
      quoteStrings: '"',
      decimalSeparator: '.',
      showLabels: true,
      showTitle: true,
      title: `doctor-${Date.now()}`,
      filename: `doctor-${Date.now()}`,
      useTextFile: false,
      useBom: true,
      // useKeysAsHeaders: true,
      headers// ['Column 1', 'Column 2', etc...] <-- Won't work with useKeysAsHeaders present!
    });
    let _data: any = Array.from(this.data.filter(d => d.userType === "Doctor"))
    const data = _data.map(d => {
      delete d.userType
      return d;
    });
    csvExporter.generateCsv(data);
  }
}
