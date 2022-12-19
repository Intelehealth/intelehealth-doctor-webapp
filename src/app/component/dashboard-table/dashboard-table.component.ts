import { Component, OnInit, Input } from "@angular/core";

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
  viewDate: Date = new Date();
  drSlots = [];
  setSpiner = false;
  constructor(  ) { }

  ngOnInit(): void {
    
  }
}
