import { Component, OnInit } from "@angular/core";

@Component({
  selector: "app-referal-v4",
  templateUrl: "./referal-v4.component.html",
  styleUrls: ["./referal-v4.component.scss"],
})
export class ReferalV4Component implements OnInit {
  showAddMore = false;

  isCollapsed = false;

  selected: any;
  referalList = [{ name: "select of type" }, { name: "500 Mg" }];

  headers = [
    {
      name: "Referral facility",
      type: "string",
      key: "referal",
      thClass: "referal-table",
    },
    { name: "Remarks", type: "remark", key: "remark" },
  ];

  data = [
    {
      referal: "Physiotherapist",
      remark: "Please give a visit as soon as possible",
    },
  ];

  constructor() {}

  ngOnInit(): void {
    this.selected = this.referalList[0];
  }
}
