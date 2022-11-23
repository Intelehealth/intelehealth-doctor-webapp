import { Component, OnInit, ViewChild } from "@angular/core";
import * as moment from "moment";
import { AppointmentDetailModalComponent } from "src/app/modals/appointment-detail-modal/appointment-detail-modal.component";
import { CommonModalComponent } from "src/app/modals/common-modal/common-modal.component";

@Component({
  selector: "app-view-calendar",
  templateUrl: "./view-calendar.component.html",
  styleUrls: ["./view-calendar.component.scss"],
})
export class ViewCalendarComponent implements OnInit {
  @ViewChild("reschduleAppointment") reschduleAppointment: CommonModalComponent;
  @ViewChild("cancelAppointment") cancelAppointment: CommonModalComponent;

  @ViewChild("appointmentDetail") appointmentDetail: AppointmentDetailModalComponent;

  reschduleTheAppointmentModal: any = {
    mainText: "Reschdule the appointment",
    subText:
      "Are you sure you want to reschedule muskan kala’s appointment from ",
    leftBtnText: "Go Back",
    leftBtnOnClick: () => { },
    rightBtnText: "Confirm",
    rightBtnOnClick: () => { },
    windowClass: "reschdule-appointment-height",
    circleIconPath: "assets/svgs/reschdule-the-appointment.svg",
    timings: {
      fromDate: "5 August",
      fromTime: "10:00 am",
      toDate: "8 August",
      toTime: "9:30 am",
    },
  };

  cancelAppointmentModal: any = {
    mainText: "Cancel the appointment",
    subText:
      "Are you sure you want to cancel your appointment on 5 August at 10:00 am",
    leftBtnText: "Go Back",
    leftBtnOnClick: () => { },
    rightBtnText: "Cancel",
    rightBtnOnClick: () => { },
    windowClass: "shared-successfull",
    circleIconPath: "assets/svgs/cancel-the-appointment.svg",
  };

  todayDate = null;

  constructor() { }

  ngOnInit(): void {
    this.todayDate = moment().format("DD MMMM, YYYY");
  }

  /**
   * @todo added ngAfterViewInit just to test modal, remove it during implementation
   */
  ngAfterViewInit() {
    // this.reschduleAppointment.openModal();
    // this.cancelAppointment.openModal();
    // this.appointmentDetail.openAppointmentModal();
  }
}
