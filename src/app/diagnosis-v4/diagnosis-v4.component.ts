import { Component, Input, OnInit } from "@angular/core";

@Component({
  selector: "app-diagnosis-v4",
  templateUrl: "./diagnosis-v4.component.html",
  styleUrls: ["./diagnosis-v4.component.scss"],
})
export class DiagnosisV4Component implements OnInit {
  @Input() iconImg = "assets/svgs/diagnosis.svg";
  @Input() showToggle = true;
  @Input() readOnly = false;

  selected: any;
  diagnosisList = ["Viral Flu"];

  isCollapsed = false;
  diagnosisData = [
    "Do you have enough information for diagnosis?",
    "Select diagnosis",
    "Diagnosis type",
    "Select",
  ];

  constructor() {}

  ngOnInit(): void {
    this.selected = this.diagnosisList[0];
  }
}
