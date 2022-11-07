import { Component, OnInit } from "@angular/core";

@Component({
  selector: "app-check-up-reason-v4",
  templateUrl: "./check-up-reason-v4.component.html",
  styleUrls: ["./check-up-reason-v4.component.scss"],
})
export class CheckUpReasonV4Component implements OnInit {
  checkUpReason = {
    id: "checkUpReason",
    image: "assets/svgs/check-up-reason.svg",
    mainlable: "Check-up reason",
    collapse: "#collapseCheckUpReason",
    toggle: "collapse",

    data: [
      {
        label: "Site",
        value: "Upper (R) - Right Hypohondrium",
      },
      {
        label: "Pain radiates to",
        value: "Upper (C) - Epigastric",
      },
      {
        label: "Onset",
        value: "Rapidly increasing",
      },
      {
        label: "Timming",
        value: "Morning",
      },
      {
        label: "Character of pain",
        value: "Cramping",
      },
      {
        label: "Serverity",
        value: "Moderate, 4-6",
      },
      {
        label: "Exacerbating factors",
        value: "Food movement",
      },
      {
        label: "Relieving factor",
        value: "Leaning forward",
      },
      {
        label: "Menstrual history",
        value: "Menstruating - 14,20 April 2022.",
      },
      {
        label: "Prior treatment sought",
        value: "None",
      },
      {
        label: "Additonal Informaton",
        value: "Trouble sleep",
      },
    ],
    associatedData: [
      {
        label: "Patient reports:",
        value:
          "Nausea, Anorexia, Constipation, Abdominal distinction / bloating, passing GAS, Restlessness, Injury, Breathlessness, Wheezing, Shortness of breath, Pain/Tightness of chest, Hemoptysis, Hoarseness, Naval congestion/Stuffy nose, Runny nose, Recurrent Diarrhea.",
      },

      {
        label: "Patient denies:",
        value:
          "Vomiting, Diarrhea, Fever, Belching/Burping, Blood in stool, change in frequency of urination, Color change in urine, Hiccups, Vaginal discharge(describe), Burning felling in a throat at night/early in the morning, Post nasal drip, Recent severe stress.",
      },
    ],
  };

  constructor() {}

  ngOnInit(): void {}
}
