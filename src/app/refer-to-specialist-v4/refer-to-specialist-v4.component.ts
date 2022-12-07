import { Component, OnInit } from "@angular/core";

@Component({
  selector: "app-refer-to-specialist-v4",
  templateUrl: "./refer-to-specialist-v4.component.html",
  styleUrls: ["./refer-to-specialist-v4.component.scss"],
})
export class ReferToSpecialistV4Component implements OnInit {
  selected: any;
  specaiList = [
    "General Physician",
    "Dermatologist",
    "Physiotherapist",
    "Gynecologist",
    "Pediatrician",
  ];

  referToSpecailist = {
    data: ["Refer to another speciality", "Specialization"],
  };

  constructor() {}

  ngOnInit(): void {
    this.selected = this.specaiList[0];
  }
}
