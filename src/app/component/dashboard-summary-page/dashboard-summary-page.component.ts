import { Component, OnInit, ViewEncapsulation } from "@angular/core";

@Component({
  selector: "app-dashboard-summary-page",
  templateUrl: "./dashboard-summary-page.component.html",
  styleUrls: ["./dashboard-summary-page.component.scss"],
  encapsulation: ViewEncapsulation.None,
})
export class DashboardSummaryPageComponent implements OnInit {
  appointmentTable: any = {
    id: "appointmentTable",
    label: "Appointments",
    lableIconPath: "assets/svgs/video-frame.svg",
    collapse: "#collapseAppointment",
    toggle: "collapse",
    dataCount: 0,
    headers: [
      {
        name: "Patient",
        type: "stringwithimage",
        key: "patientName",
        imageKey: "profile",
      },
      { name: "Age", type: "string", key: "age" },
      { name: "Start In", type: "string", key: "startIn" },
      { name: "Location", type: "string", key: "location" },
      { name: "Cheif complaint", type: "string", key: "complaint" },
      {
        name: "Action",
        type: "multibutton",
        headerClass: "text-center",
        buttons: [
          {
            label: "Reschedule",
            onClick: this.onRescheduleClick,
            btnClass: "mr-3 re-btn",
          },
          {
            label: "Cancel",
            onClick: this.onCancelClick,
            btnClass: "ce-btn",
          },
        ],
      },
    ],
    data: [
      {
        patientName: "Muskan Kala",
        age: "25y",
        startIn: "15 Mins",
        location: "TM clinic 1",
        complaint: "Fever",
        profile: "assets/svgs/table-profile.svg",
        isActive: true,
      },
      {
        patientName: "Muskan Kala",
        age: "25y",
        startIn: "15 Mins",
        location: "TM clinic 1",
        complaint: "Fever",
        profile: "assets/svgs/table-profile.svg",
      },
      {
        patientName: "Muskan Kala",
        age: "25y",
        startIn: "15 Mins",
        location: "TM clinic 1",
        complaint: "Fever",
        profile: "assets/svgs/table-profile.svg",
      },
      {
        patientName: "Muskan Kala",
        age: "25y",
        startIn: "15 Mins",
        location: "TM clinic 1",
        complaint: "Fever",
        profile: "assets/svgs/table-profile.svg",
      },
    ],
  };

  priorityVisits: any = {
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

  awaitingVisits: any = {
    id: "awaitingTable",
    label: "Awaiting Visits",
    lableIconPath: "assets/svgs/green-profile.svg",
    dataCount: 12,
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
            label: "16 hr ago",

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
        complaint: "Fever & Headache",
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

  inProgressVisits: any = {
    id: "inProgressTable",
    label: "In-progress visits",
    lableIconPath: "assets/svgs/pen-board.svg",
    dataCount: 15,
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
        name: "Prescription started",
        type: "pill",
        headerClass: "text-center",
        imageKey: "summaryListIcon",

        buttons: [
          {
            label: "16 hr ago",

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
        age: "27y",
        location: "TM clinic 1",
        complaint: "Fever",
        summaryListIcon: "assets/svgs/summary-list.svg",
      },
      {
        patientName: "Muskan Kala",
        age: "25y",
        location: "TM clinic 1",
        complaint: "Fever & Headache",
        summaryListIcon: "assets/svgs/summary-list.svg",
      },
      {
        patientName: "Muskan Kala",
        age: "29y",
        location: "TM clinic 1",
        complaint: "Fever & Cough",
        summaryListIcon: "assets/svgs/summary-list.svg",
      },
    ],
  };

  constructor() {}

  ngOnInit(): void {}

  onRescheduleClick() {}

  onCancelClick() {}

  onVisitCreatedClick() {}

  onAwaitingVisitClick() {}

  onProgressVisitClick() {}
}
