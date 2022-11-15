import { Component, OnInit } from "@angular/core";
import { HeaderService } from "src/app/services/header.service";

@Component({
  selector: "app-visit-summary-v4",
  templateUrl: "./visit-summary-v4.component.html",
  styleUrls: ["./visit-summary-v4.component.scss"],
})
export class VisitSummaryV4Component implements OnInit {
  constructor(private headerSvc: HeaderService) {
    this.headerSvc.showSearchBar = false;
  }

  ngOnInit(): void {}
}
