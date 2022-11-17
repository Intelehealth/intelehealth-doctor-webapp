import { Component, Input, OnInit } from "@angular/core";

@Component({
  selector: "app-patient-interaction-v4",
  templateUrl: "./patient-interaction-v4.component.html",
  styleUrls: ["./patient-interaction-v4.component.scss"],
})
export class PatientInteractionV4Component implements OnInit {
  @Input() iconImg = "assets/svgs/patient-interaction.svg";
  @Input() readOnly = false;
  @Input() showToggle = true;

  isCollapsed = false;


  constructor() {}

  ngOnInit(): void {}
}
