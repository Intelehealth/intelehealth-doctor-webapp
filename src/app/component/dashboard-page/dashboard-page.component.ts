import { Component, OnInit, Input } from "@angular/core";

@Component({
  selector: "app-dashboard-page",
  templateUrl: "./dashboard-page.component.html",
  styleUrls: ["./dashboard-page.component.scss"],
})
export class DashboardPageComponent implements OnInit {
  isProfileCompeleted: boolean = false;

  constructor() {}

  ngOnInit(): void {}
}
