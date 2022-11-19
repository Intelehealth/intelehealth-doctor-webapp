import { Component, Input, OnInit } from "@angular/core";

@Component({
  selector: "app-physical-examination-v4",
  templateUrl: "./physical-examination-v4.component.html",
  styleUrls: ["./physical-examination-v4.component.scss"],
})
export class PhysicalExaminationV4Component implements OnInit {
  @Input() pastVisit = false;

  physicalExaminaton = {
    data: [
      {
        label: "In",
        value: "Person Consultation",
      },
      {
        label: "Eyes",
        value: "Jaundice - no Jaundice seen",
      },
      {
        label: "Eyes",
        value: "Pallor - Normal pallor",
      },
      {
        label: "Arm",
        value: "Pinch skin* - appeared slow on pinch test",
      },
      {
        label: "Nail abnormality",
        value: "Clubbing",
      },
      {
        label: "Nail anemia",
        value: "Nails are normal",
      },
      {
        label: "Ankle",
        value: "Pedal oedema in left foot",
      },
      {
        label: "Eye images",
        images: [
          "assets/svgs/eyes1.svg",
          "assets/svgs/eyes2.svg",
          "assets/svgs/eyes3.svg",
        ],
      },
    ],
    physicalData: [
      "Distension seen",
      "No scarring",
      "Tenderness seen - Location - Upper(R)",
      "No lumps",
    ],
  };

  constructor() {}

  ngOnInit(): void {}
}
