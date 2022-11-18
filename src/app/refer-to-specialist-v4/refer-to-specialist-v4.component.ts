import { Component, OnInit } from "@angular/core";

@Component({
  selector: "app-refer-to-specialist-v4",
  templateUrl: "./refer-to-specialist-v4.component.html",
  styleUrls: ["./refer-to-specialist-v4.component.scss"],
})
export class ReferToSpecialistV4Component implements OnInit {
  selected: any;
  specaiList = ["Cardiologist"];

  referToSpecailist = {
    data: [
      {
        label: "Refer to another speciality",
        value: "Yes",
        id: "yes",
      },
      {
        label: "Specialization",
        value: "",
      },
    ],
  };

  constructor() {}

  ngOnInit(): void {
    this.selected = this.specaiList[0];
  }
}
