import { Component, OnInit } from "@angular/core";
import { FormGroup, FormControl, FormArray, FormBuilder } from "@angular/forms";

@Component({
  selector: "app-setup-calendar-v4",
  templateUrl: "./setup-calendar-v4.component.html",
  styleUrls: ["./setup-calendar-v4.component.scss"],
})
export class SetupCalendarV4Component implements OnInit {
  showAddMore = false;

  values = [];

  isCollapsed = false;

  selectedStartTime: any;
  startTimeList = [{ name: "10:00" }, { name: "11:00" }, { name: "12:00" }];

  clockTimeAmPM= [{ name: "am" },{ name: "pm" }];
  selectedStartAmPm:any;

  selectedEndAmPm:any;

  selectedEndTime: any;
  endTimeList = [{ name: "1:00" }, { name: "2:00" }, { name: "3:00" }];

  selectedDays: any;
  weekDaysList = [];

  selectedTiming: any;
  daysList = [
    { name: "Monday", checked: false },
    { name: "Tueday", checked: false },
    { name: "Wednesday", checked: false },
    { name: "Thursday", checked: false },
    { name: "Friday", checked: false },
    { name: "Saturday", checked: false },
    { name: "Sunday", checked: false },
  ];

  headers = [
    {
      name: "Start time",
      type: "string",
      key: "startTime",
    },
    { name: "End time", type: "string", key: "endTime" },
    { name: "Days", type: "remark", key: "days" },
  ];

  data = [
    {
      startTime: "10 am",
      endTime: "1 pm ",
      days: "7",
    },
    {
      startTime: "2 pm",
      endTime: "11 am",
      days: "14",
    },
  ];

  showDays: boolean = false;

  constructor() {}

  ngOnInit(): void {
    this.selectedStartTime = this.startTimeList[0];

    this.selectedEndTime = this.endTimeList[0];

    this.selectedStartAmPm=this.clockTimeAmPM[0];

    this.selectedEndAmPm=this.clockTimeAmPM[0];
  }

  get weekDays() {
    return this.weekDaysList.map((val) => val.slice(0, 3)).join();
  }

  removevalue(i) {
    this.values.splice(i, 1);
  }

  addvalue() {
    this.values.push({ value: "" });
  }

  onCheckboxChange(e, days) {
    if (!e.target.checked) {
      let element = this.weekDaysList.find((itm) => itm === days.name);
      this.weekDaysList.splice(this.weekDaysList.indexOf(element), 1);
      return;
    }
    this.weekDaysList.push(days?.name);
  }
}
