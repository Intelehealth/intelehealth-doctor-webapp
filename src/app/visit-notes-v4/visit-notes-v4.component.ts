import { Component, OnInit, ViewChild } from "@angular/core";
import { CommonModalComponent } from "../modals/common-modal/common-modal.component";

@Component({
  selector: "app-visit-notes-v4",
  templateUrl: "./visit-notes-v4.component.html",
  styleUrls: ["./visit-notes-v4.component.scss"],
})
export class VisitNotesV4Component implements OnInit {
  @ViewChild("sharePrescription") sharePrescription: CommonModalComponent;

  @ViewChild("sharedSuccessfully")
  sharedSuccessfully: CommonModalComponent;

  @ViewChild("cannotSharePrescription")
  cannotSharePrescription: CommonModalComponent;
  

  sharePrescModal: any = {
    mainText: "Share prescription",
    subText: "Are you sure you want to share this prescription?",
    leftBtnText: "Go Back",
    leftBtnOnClick: () => {},
    rightBtnText: "Confirm",
    rightBtnOnClick: () => {},

    circleIconPath: "assets/svgs/prescription.svg",
  };

  sharedSuccessfullyModal: any = {
    mainText: "Shared prescription successfully",
    subText:
      "The prescription has been succsessfully sent. View prescription or go to dashboard",
    leftBtnText: "View Prescription",
    leftBtnOnClick: () => {},
    rightBtnText: "Go to dashboard",
    rightBtnOnClick: () => {},
    windowClass: "shared-successfull",
    circleIconPath: "assets/svgs/pre-successfully.svg",
  };

  cannotSharePrescriptionModal: any = {
    mainText: "Cannot share prescription",
    subText:
      "Unable to send prescription due to poor network connection. Please try again or come back later",
    leftBtnText: "Go Back",
    leftBtnOnClick: () => {},
    rightBtnText: "Try again",
    rightBtnOnClick: () => {},
    windowClass: "shared-successfull",
    circleIconPath: "assets/svgs/cannot-share-prescription.svg",
  };

  constructor() {}

  ngOnInit(): void {}
}
