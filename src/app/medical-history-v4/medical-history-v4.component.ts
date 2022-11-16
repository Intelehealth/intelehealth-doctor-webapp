import { Component, Input, OnInit } from "@angular/core";

@Component({
  selector: "app-medical-history-v4",
  templateUrl: "./medical-history-v4.component.html",
  styleUrls: ["./medical-history-v4.component.scss"],
})
export class MedicalHistoryV4Component implements OnInit {
  @Input() pastVisit = false;
  medicalHistory = {
    id: "Medicalhistory",
    image: "assets/svgs/medical-history.svg",
    mainlable: "Medical history",
    collapse: "#collapseMedicalhistory",
    toggle: "collapse",

    data: [
      {
        label: "Pregnancy status",
        value: "Not pregnant",
      },
      {
        label: "Medical history",
        value:
          "Diabetes - 20 May 2021 | Current medication - Not taking any | Last measured blood sugar and HbA1C - Not known",
      },
      {
        label: "Drug history",
        value: "No recent medication",
      },
      {
        label: "Allergies",
        value: "No known allergies",
      },
      {
        label: "Chewing tobacco status",
        value: "Do not chew/Denied answer",
      },
      {
        label: "Smoking history",
        value: "Patient denied/Has no h/o smoking",
      },
      {
        label: "Alcohol use",
        value: "No/Denied",
      },
    ],
    medicalHistoryData: [
      {
        label: "Heart disease",
        value: "Father",
      },
    ],
  };

  constructor() {}

  ngOnInit(): void {}
}
