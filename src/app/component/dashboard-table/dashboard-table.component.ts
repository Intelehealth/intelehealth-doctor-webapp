import { Component, Input, OnInit } from "@angular/core";

@Component({
  selector: "app-dashboard-table",
  templateUrl: "./dashboard-table.component.html",
  styleUrls: ["./dashboard-table.component.scss"],
})
export class DashboardTableComponent implements OnInit {
  @Input("tableConfig") set tableConfig(tableConfig) {
    this.table = tableConfig;
  }
  table: any;

  constructor() {}

  ngOnInit(): void {}
}
