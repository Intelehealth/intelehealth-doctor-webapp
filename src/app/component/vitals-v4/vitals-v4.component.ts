import { Component, Input, OnInit } from "@angular/core";

@Component({
  selector: "app-vitals-v4",
  templateUrl: "./vitals-v4.component.html",
  styleUrls: ["./vitals-v4.component.scss"],
})
export class VitalsV4Component implements OnInit {
  @Input() pastVisit = false;
  vital = {
    id: "vital",
    image: "assets/svgs/vital.svg",
    mainlable: "Vitals",
    collapse: "#collapseVital",
    toggle: "collapse",

    data: [
      {
        label: "Height(cm)",
        value: "168",
      },
      {
        label: "Weigth(kg)",
        value: "72",
      },
      {
        label: "BMI",
        value: "25.51",
      },
      {
        label: "BP",
        value: "130/85",
      },
      {
        label: "Pulse",
        value: "75",
      },
      {
        label: "Temperature(F)",
        value: "99",
      },
      {
        label: "SpO2(%)",
        value: "No information",
        noInfoClass: "no-info-color",
      },
      {
        label: "Respiratory rate",
        value: "No information",
        noInfoClass: "no-info-color",
      },
    ],
  };

  constructor() {}

  ngOnInit(): void {}
}
