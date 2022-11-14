import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-admin-table',
  templateUrl: './admin-table.component.html',
  styleUrls: ['./admin-table.component.scss']
})
export class AdminTableComponent implements OnInit {
  table: any = {
    headers: [
      { name: "Select", type: "fill", imageKey: "selectIcon",headerClass: "col-1" },
      { name: "Sr. No", type: "number", key: "sequence", headerClass: "col-1" },
      { name: "Patient", type: "stringwithimage", key: "patientName", headerClass: "patientName" },
      { name: "Last Updated", type: "string", key: "LastUpdated", headerClass: "lastUpdate" },
      { name: "Active", type: "boolean", imageKey: "ActiveStatusIcon", headerClass: "activeStatus" },
      { name: "Download", type: "file", imageKey: "DownloadIcon", headerClass: "download" },
      { name: "Info", type: "data", imageKey: "InfoDataIcon" },
    ],
    data: [
      {
        selectIcon:"/assets/svgs/frame.svg",
        sequence:"1",
        patientName: "Muskan Kala",
        LastUpdated: "5 May, 2022",
        ActiveStatusIcon: "/assets/svgs/toggle.svg",
        DownloadIcon: "/assets/svgs/downloading.svg",
        InfoDataIcon: "assets/svgs/info.svg",
      },
      {
        selectIcon:"/assets/svgs/frame.svg",
        sequence:"2",
        patientName: "Muskan Kala",
        LastUpdated: "5 May, 2022",
        ActiveStatusIcon: "/assets/svgs/toggle.svg",
        DownloadIcon: "/assets/svgs/downloading.svg",
        InfoDataIcon: "assets/svgs/info.svg",
      },
      {
        selectIcon:"/assets/svgs/frame.svg",
        sequence:"3",
        patientName: "Muskan Kala",
        LastUpdated: "5 May, 2022",
        ActiveStatusIcon: "/assets/svgs/toggle.svg",
        DownloadIcon: "/assets/svgs/downloading.svg",
        InfoDataIcon: "assets/svgs/info.svg",
        isActive: true,
      },
      {
        selectIcon:"/assets/svgs/frame.svg",
        sequence:"4",
        patientName: "Muskan Kala",
        LastUpdated: "5 May, 2022",
        ActiveStatusIcon: "/assets/svgs/toggle.svg",
        DownloadIcon: "/assets/svgs/downloading.svg",
        InfoDataIcon: "assets/svgs/info.svg",
      },
      {
        selectIcon:"/assets/svgs/frame.svg",
        sequence:"5",
        patientName: "Muskan Kala",
        LastUpdated: "5 May, 2022",
        ActiveStatusIcon: "/assets/svgs/toggle.svg",
        DownloadIcon: "/assets/svgs/downloading.svg",
        InfoDataIcon: "assets/svgs/info.svg",
      },
      {
        selectIcon:"/assets/svgs/frame.svg",
        sequence:"6",
        patientName: "Muskan Kala",
        LastUpdated: "5 May, 2022",
        ActiveStatusIcon: "/assets/svgs/toggle.svg",
        DownloadIcon: "/assets/svgs/downloading.svg",
        InfoDataIcon: "assets/svgs/info.svg",
      },
      {
        selectIcon:"/assets/svgs/frame.svg",
        sequence:"7",
        patientName: "Muskan Kala",
        LastUpdated: "5 May, 2022",
        ActiveStatusIcon: "/assets/svgs/toggle.svg",
        DownloadIcon: "/assets/svgs/downloading.svg",
        InfoDataIcon: "assets/svgs/info.svg",
      },
      {
        selectIcon:"/assets/svgs/frame.svg",
        sequence:"8",
        patientName: "Muskan Kala",
        LastUpdated: "5 May, 2022",
        ActiveStatusIcon: "/assets/svgs/toggle.svg",
        DownloadIcon: "/assets/svgs/downloading.svg",
        InfoDataIcon: "assets/svgs/info.svg",
      },
      {
        selectIcon:"/assets/svgs/frame.svg",
        sequence:"9",
        patientName: "Muskan Kala",
        LastUpdated: "5 May, 2022",
        ActiveStatusIcon: "/assets/svgs/toggle.svg",
        DownloadIcon: "/assets/svgs/downloading.svg",
        InfoDataIcon: "assets/svgs/info.svg",
      },
      {
        selectIcon:"/assets/svgs/frame.svg",
        sequence:"10",
        patientName: "Muskan Kala",
        LastUpdated: "5 May, 2022",
        ActiveStatusIcon: "/assets/svgs/toggle.svg",
        DownloadIcon: "/assets/svgs/downloading.svg",
        InfoDataIcon: "assets/svgs/info.svg",
      },
    ],
  };
  constructor() { }

  ngOnInit(): void {
  }

}
