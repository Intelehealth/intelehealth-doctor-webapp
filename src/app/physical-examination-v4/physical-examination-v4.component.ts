import { Component, OnInit } from "@angular/core";

@Component({
  selector: "app-physical-examination-v4",
  templateUrl: "./physical-examination-v4.component.html",
  styleUrls: ["./physical-examination-v4.component.scss"],
})
export class PhysicalExaminationV4Component implements OnInit {
  physicalExaminaton = {
    id: "physicalExaminaton",
    image: "assets/svgs/physical-examination.svg",
    mainlable: "Physical examination",
    collapse: "#collapsephysicalExaminaton",
    toggle: "collapse",

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
        imge1: "assets/svgs/eyes1.svg",
        imge2: "assets/svgs/eyes2.svg",
        imge3: "assets/svgs/eyes3.svg",
      },
    ],
    physicalExaminatonData: [
      {
        label: "Distension seen",
      },
      {
        label: "No scarring",
      },
      {
        label: "Tenderness seen - Location - Upper(R)",
      },
      {
        label: "No lumps",
      },
    ],
  };

  constructor() {}

  ngOnInit(): void {}
}
