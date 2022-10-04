import { Component, OnInit, Input } from "@angular/core";
declare const getFromStorage: Function;
@Component({
  selector: "app-dashboard-page",
  templateUrl: "./dashboard-page.component.html",
  styleUrls: ["./dashboard-page.component.scss"],
})
export class DashboardPageComponent implements OnInit {
  @Input() collapsed: boolean = false;
  @Input() screenWidth: number = 0;
  doctorName = "";
  constructor() {}

  ngOnInit(): void {
    const doctorName = getFromStorage("doctorName");
    this.doctorName = doctorName;
  }

  getBodyClass() {
    let styleClass = "";
    if (this.collapsed && this.screenWidth > 768) {
      styleClass = "body-trimmed";
    }
    return styleClass;
  }
}
