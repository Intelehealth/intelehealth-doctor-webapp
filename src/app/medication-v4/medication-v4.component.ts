import { Component, OnInit } from "@angular/core";

@Component({
  selector: "app-medication-v4",
  templateUrl: "./medication-v4.component.html",
  styleUrls: ["./medication-v4.component.scss"],
})
export class MedicationV4Component implements OnInit {
  medication = {
    id: "note",
    image: "assets/svgs/medication.svg",
    mainlable: "Medication",
    collapse: "#collapseMedication",
    toggle: "collapse",
  };

  headers = [
    {
      name: "Drug Name",
      type: "string",
      key: "drug",
    },
    { name: "Strength", type: "string", key: "strength" },
    { name: "No. of days", type: "string", key: "days" },
    { name: "Timing", type: "string", key: "timing" },
    {
      name: "Remark",
      type: "remark",
      key: "remark",
    },
  ];

  data = [
    {
      drug: "Tab. Ecosprin AV",
      strength: "75 MG",
      days: "7",
      remark: "1 - 0 - 1",
      timing: "After meal",
    },
    {
      drug: "Foracort",
      strength: "500 MG",
      days: "14",
      remark: "0 - 1 - 0",
      timing: "Half after meal",
    },
  ];

  constructor() {}

  ngOnInit(): void {}
}
