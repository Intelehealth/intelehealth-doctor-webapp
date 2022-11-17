import { Component, Input, OnInit } from "@angular/core";

@Component({
  selector: "app-test",
  templateUrl: "./test.component.html",
  styleUrls: ["./test.component.scss"],
})
export class TestComponent implements OnInit {
  @Input() iconImg = "assets/svgs/test.svg";
  @Input() readOnly = false;
  @Input() showToggle = true;

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
