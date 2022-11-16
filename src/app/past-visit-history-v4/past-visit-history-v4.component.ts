import { Component, OnInit, ViewChild } from "@angular/core";
import { NgbModal } from "@ng-bootstrap/ng-bootstrap";
import { VisitSummaryAndPrescriptionModalComponent } from "../modals/visit-summary-and-prescription-modal/visit-summary-and-prescription-modal.component";

@Component({
  selector: "app-past-visit-history-v4",
  templateUrl: "./past-visit-history-v4.component.html",
  styleUrls: ["./past-visit-history-v4.component.scss"],
})
export class PastVisitHistoryV4Component implements OnInit {
  @ViewChild("VisitSummaryModal")
  VisitSummaryModal: VisitSummaryAndPrescriptionModalComponent;

  pastVisitHistory: any = {
    headers: [
      {
        name: "",
        type: "stepper",
        imageKey: "stepper",
      },

      {
        name: "Created on",
        type: "string",
        key: "createdOn",
      },

      {
        name: "Consulted by",
        type: "stringwithimage",
        key: "patientName",
        imageKey: "profile",
        headerClass: "font-size-md font-bold",
      },

      { name: "Cheif complaint", type: "string", key: "complaint" },

      {
        name: "Summary",
        type: "button",
        headerClass: "text-center",
        imageKey: "summary",

        buttons: [
          {
            label: "View",
            onClick: () => {
              this.VisitSummaryModal.openVisitSummaryModal();
            },
            btnClass: "pill-btn pill-blue-view-btn ",
          },
        ],
      },

      {
        name: "Prescription",
        type: "button",
        headerClass: "text-center ",
        imageKey: "PrescriptionIcon",

        buttons: [
          {
            label: "View",
            onClick: this.onPrescriptionModal,
            btnClass: "pill-btn pill-green-view-btn ",
          },
        ],
      },

      {
        name: "Prescription sent",
        type: "pill",
        headerClass: "text-center",
        imageKey: "PrescriptionSentIcon",
        pill: [
          {
            label: "16 hr ago",
            btnClass: "pill-btn",
          },
        ],
      },
    ],
    data: [
      {
        patientName: "Muskan Kala (F,24)",

        profile: "assets/svgs/table-profile.svg",

        complaint: "Fever",

        PrescriptionSentIcon: "assets/svgs/Prescription-sent-icon.svg",

        summary: "assets/svgs/summary-list-blue-icon.svg",

        PrescriptionIcon: "assets/svgs/Prescription-green-Icon.svg",

        createdOn: "5 May, 2022",

        stepper: "assets/svgs/green-color-steper.svg",

        isActive: true,
      },

      {
        patientName: "Dr. Aman Sharma (M)",

        profile: "assets/svgs/table-profile.svg",

        complaint: "Fever & Cough",

        summary: "assets/svgs/summary-list-blue-icon.svg",

        PrescriptionSentIcon: "assets/svgs/Prescription-sent-icon.svg",

        PrescriptionIcon: "assets/svgs/Prescription-green-Icon.svg",

        createdOn: "21 Apr, 2022",

        stepper: "assets/svgs/green-color-steper.svg",

        isActive: true,
        isReassigned: true,
        reassignedHintText: {
          speciality: "Pediatrician",
          date: "10 June",
        },
      },
      {
        patientName: "Dr. Aman Sharma (M)",

        profile: "assets/svgs/table-profile.svg",

        complaint: "Fever & Cough",

        summary: "assets/svgs/summary-list-blue-icon.svg",

        PrescriptionSentIcon: "assets/svgs/Prescription-sent-icon.svg",

        PrescriptionIcon: "assets/svgs/Prescription-green-Icon.svg",

        createdOn: "21 Apr, 2022",

        stepper: "assets/svgs/green-color-steper.svg",

        isActive: true,
      },
    ],
  };
  itemHover: any = null;

  constructor(public modalSvc: NgbModal) {}

  ngOnInit(): void {}

  onPrescriptionModal() {
    console.table("second");
  }

  ngAfterViewInit() {
    // this.VisitSummaryModal.openVisitSummaryModal();
  }
}
