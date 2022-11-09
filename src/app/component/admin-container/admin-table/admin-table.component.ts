import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-admin-table',
  templateUrl: './admin-table.component.html',
  styleUrls: ['./admin-table.component.scss']
})
export class AdminTableComponent implements OnInit {
  table: any = {
    id: "priorityTable",
    label: "Priority Visits",
    lableIconPath: "assets/svgs/red-profile.svg",
    dataCount: 8,
    headers: [
      {
        name: "Patient",
        type: "stringwithimage",
        key: "patientName",
        imageKey: "profile",
      },
      { name: "Age", type: "string", key: "age" },
      { name: "Location", type: "string", key: "location" },
      { name: "Cheif complaint", type: "string", key: "complaint" },
      {
        name: "Visit Created",
        type: "pill",
        headerClass: "text-center",
        imageKey: "summaryListIcon",

        buttons: [
          {
            label: "1 hr ago",
            btnClass: "summay-btn pill-btn",
          },
        ],
      },
    ],
    data: [
      {
        patientName: "Muskan Kala",
        age: "25y",
        location: "TM clinic 1",
        complaint: "Fever",
        summaryListIcon: "assets/svgs/summary-list.svg",
        isActive: true,
      },
      {
        patientName: "Muskan Kala",
        age: "25y",
        location: "TM clinic 1",
        complaint: "Fever",
        summaryListIcon: "assets/svgs/summary-list.svg",
      },
      {
        patientName: "Muskan Kala",
        age: "25y",
        location: "TM clinic 1",
        complaint: "Headache",
        summaryListIcon: "assets/svgs/summary-list.svg",
      },
      {
        patientName: "Muskan Kala",
        age: "25y",
        location: "TM clinic 1",
        complaint: "Fever",
        summaryListIcon: "assets/svgs/summary-list.svg",
      },
    ],
  };
  constructor() { }

  ngOnInit(): void {
  }

}
