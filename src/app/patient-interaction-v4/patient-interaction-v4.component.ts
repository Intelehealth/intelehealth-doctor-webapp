import { Component, OnInit } from "@angular/core";

@Component({
  selector: "app-patient-interaction-v4",
  templateUrl: "./patient-interaction-v4.component.html",
  styleUrls: ["./patient-interaction-v4.component.scss"],
})
export class PatientInteractionV4Component implements OnInit {
  patientInteraction = {
    id: "patientInteraction",
    image: "assets/svgs/patient-interaction.svg",
    mainlable: "Patient interaction",
    collapse: "#collapsePatientInteraction",
    toggle: "collapse",

    data: [
      {
        label: "Connect with patient",
        image1: "assets/svgs/interaction-phone.svg",
        image2: "assets/svgs/interaction-whatapp.svg",
        value: "Click here to connent with CHW",
      },

      {
        label: "Have you spoken with the patient directly?",
      },
    ],
  };

  constructor() {}

  ngOnInit(): void {}
}
