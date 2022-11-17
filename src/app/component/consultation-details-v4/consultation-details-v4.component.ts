import { Component, Input, OnInit } from "@angular/core";

@Component({
  selector: "app-consultation-details-v4",
  templateUrl: "./consultation-details-v4.component.html",
  styleUrls: ["./consultation-details-v4.component.scss"],
})
export class ConsultationDetailsV4Component implements OnInit {
  @Input() iconImg = "assets/svgs/consultation-details-icon.svg";
  @Input() showToggle = true;
  @Input() readOnly = false;

  constructor() {}

  ngOnInit(): void {}
}
