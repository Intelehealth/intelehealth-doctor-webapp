import { Component, OnInit } from "@angular/core";

@Component({
  selector: "app-medication-v4",
  templateUrl: "./medication-v4.component.html",
  styleUrls: ["./medication-v4.component.scss"],
})
export class MedicationV4Component implements OnInit {
  showAddMore = false;

  isCollapsed = false;

  selectedDrugName: any;
  drugNameList = [{ name: "Paracetamol" }, { name: "" }];

  selectedStrength: any;
  strengthList = [{ name: "500 Mg" }, { name: "1000 Mg" }];

  selectedDays: any;
  daysList = [{ name: "14" }, { name: "20" }, { name: "25" }];

  selectedTiming: any;
  timingList = [
    { name: "1 - 0 - 1" },
    { name: "1 - 1 - 0" },
    { name: "0 - 1 - 1" },
  ];

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

  ngOnInit(): void {
    this.selectedDrugName = this.drugNameList[0];

    this.selectedStrength = this.strengthList[0];

    this.selectedTiming = this.timingList[0];

    this.selectedDays = this.daysList[0];
  }
}
