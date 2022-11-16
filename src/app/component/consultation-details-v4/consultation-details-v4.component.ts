import { Component, Input, OnInit } from "@angular/core";

@Component({
  selector: "app-consultation-details-v4",
  templateUrl: "./consultation-details-v4.component.html",
  styleUrls: ["./consultation-details-v4.component.scss"],
})
export class ConsultationDetailsV4Component implements OnInit {
  @Input() pastVisit = false;
  consultation = {
    id: "consultation",
    image: "assets/svgs/consultation-details-icon.svg",
    mainlable: "Consultation Details",
    collapse: "#collapseConsultation",
    toggle: "collapse",

    data: [
      {
        label: "Visit ID",
        value: "VID123",
      },
      {
        label: "Visit created",
        value: "4 Aug 2022",
      },
      {
        label: "Appointment on",
        value: "8 Aug 2022",
      },
      {
        label: "Status",
        value: "Priority visit",
        redClass: "pirorityRed",
      },
      {
        label: "Provided by",
        value: "Kiran Devi",
        image1: "assets/svgs/dot.svg",
        image2: "assets/svgs/num.svg",
        image3: "assets/svgs/msg.svg",
        valueChw: "Click here to connent with CHW",
      },
    ],
  };

  constructor() {}

  ngOnInit(): void {}
}
