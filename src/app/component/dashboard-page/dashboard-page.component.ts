import { Component, OnInit, Input } from "@angular/core";
declare const getFromStorage: Function;
@Component({
  selector: "app-dashboard-page",
  templateUrl: "./dashboard-page.component.html",
  styleUrls: ["./dashboard-page.component.scss"],
})
export class DashboardPageComponent implements OnInit {
  doctorName = "";
  constructor() {}

  ngOnInit(): void {
    const doctorName = getFromStorage("doctorName");
    this.doctorName = doctorName;
  }

}
