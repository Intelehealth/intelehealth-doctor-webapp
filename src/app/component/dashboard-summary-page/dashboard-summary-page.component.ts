import { Component, OnInit, ViewEncapsulation } from "@angular/core";

@Component({
  selector: "app-dashboard-summary-page",
  templateUrl: "./dashboard-summary-page.component.html",
  styleUrls: ["./dashboard-summary-page.component.scss"],
  encapsulation: ViewEncapsulation.None,
})
export class DashboardSummaryPageComponent implements OnInit {
  appointmentTable: any = {
    label: "Appointments",
    lableIconPath: "assets/svgs/video-frame.svg",
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

  constructor() {}

  ngOnInit(): void {}

  onRescheduleClick(item) {
    console.log("onRescheduleClick: ", item);
  }

  onCancelClick(item) {
    console.log("onCancelClick: ", item);
  }
}
