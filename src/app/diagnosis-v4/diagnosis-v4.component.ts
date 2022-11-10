import { Component, OnInit } from "@angular/core";

@Component({
  selector: "app-diagnosis-v4",
  templateUrl: "./diagnosis-v4.component.html",
  styleUrls: ["./diagnosis-v4.component.scss"],
})
export class DiagnosisV4Component implements OnInit {
  selected: any;
  list = [{ name: "Viral Flu" }];

  diagnosis = {
    id: "diagnosis",
    image: "assets/svgs/diagnosis.svg",
    mainlable: "Diagnosis",
    collapse: "#collapseDiagnosis",
    toggle: "collapse",

    data: [
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
    ],
  };

  constructor() {}

  ngOnInit(): void {
    this.selected = this.list[0];
  }
}
