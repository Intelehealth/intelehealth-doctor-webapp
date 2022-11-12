import { Component, OnInit } from "@angular/core";

@Component({
  selector: "app-test",
  templateUrl: "./test.component.html",
  styleUrls: ["./test.component.scss"],
})
export class TestComponent implements OnInit {
  showAddMore = false;

  isCollapsed = false;

  testData = [
    {
      label: "Blood test",
    },
    {
      label: "Stool test",
    },
  ];

  constructor() {}

  ngOnInit(): void {}
}
