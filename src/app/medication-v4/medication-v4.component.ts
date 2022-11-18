import { Component, Input, OnInit } from "@angular/core";

@Component({
  selector: "app-medication-v4",
  templateUrl: "./medication-v4.component.html",
  styleUrls: ["./medication-v4.component.scss"],
})
export class MedicationV4Component implements OnInit {
  @Input() iconImg = "assets/svgs/medication.svg";
  @Input() readOnly = false;
  @Input() showToggle = true;

  showAddMore = false;
  isCollapsed = false;

  selectedDrugName: any;
  drugNameList = ["Paracetamol", "100mg"];

  selectedStrength: any;
  strengthList = ["500 Mg", "1000 Mg"];

  selectedDays: any;
  daysList = ["14", "20", "25"];

  selectedTiming: any;
  timingList = ["1 - 0 - 1", "1 - 1 - 0", "0 - 1 - 1"];

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
