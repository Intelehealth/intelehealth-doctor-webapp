import { Component, Input, OnInit } from "@angular/core";

@Component({
  selector: "app-diagnosis-v4",
  templateUrl: "./diagnosis-v4.component.html",
  styleUrls: ["./diagnosis-v4.component.scss"],
})
export class DiagnosisV4Component implements OnInit {

  @Input() readOnly = false;

  @Input() showToggle = true;

  @Input() iconImg = "assets/svgs/diagnosis.svg";

  selected: any;
  list = [{ name: "Viral Flu" }];
  isCollapsed = false;

  diagnosisData = [
    {
      label: "Do you have enough information for diagnosis?",
    },
    {
      label: "Select diagnosis",
    },
    {
      label: "Diagnosis type",
    },
    {
      label: "Select",
    },
  ];

  constructor() {}

  ngOnInit(): void {
    this.selected = this.list[0];
  }
}
