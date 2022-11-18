import { Component, Input, OnInit } from "@angular/core";

@Component({
  selector: "app-follow-up-v4",
  templateUrl: "./follow-up-v4.component.html",
  styleUrls: ["./follow-up-v4.component.scss"],
})
export class FollowUpV4Component implements OnInit {
  @Input() iconImg = "assets/svgs/follow-up.svg";
  @Input() readOnly = false;
  @Input() showToggle = true;

  isCollapsed = false;
  followUpData = [
    "Do you want to have follow up with the patient",
    "Select date",
    "Reason for follow-up",
  ];

  constructor() {}

  ngOnInit(): void {}
}
