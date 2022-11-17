import { Component, Input, OnInit } from "@angular/core";

@Component({
  selector: "app-advice-v4",
  templateUrl: "./advice-v4.component.html",
  styleUrls: ["./advice-v4.component.scss"],
})
export class AdviceV4Component implements OnInit {
  @Input() iconImg = "assets/svgs/advice.svg";

  @Input() readOnly = false;

  @Input() showToggle = true;
  showAddMore = false;

  isCollapsed = false;
  adviceData = [
    "Please make sure the patient takes all the medicines",
    "Please let the patient know that taking proper rest is very important for atleast 1 week",
  ];

  constructor() {}

  ngOnInit(): void {}
}
