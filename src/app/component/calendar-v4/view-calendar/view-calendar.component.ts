import { Component, OnInit, ViewChild } from "@angular/core";
import * as moment from "moment";
import { AppointmentDetailModalComponent } from "src/app/modals/appointment-detail-modal/appointment-detail-modal.component";
import { CommonModalComponent } from "src/app/modals/common-modal/common-modal.component";
import { RescheduleAppointmentModalComponent } from "src/app/modals/reschedule-appointment-modal/reschedule-appointment-modal.component";
import { TimeOffModalComponent } from "src/app/modals/time-off-modal/time-off-modal.component";

@Component({
  selector: "app-view-calendar",
  templateUrl: "./view-calendar.component.html",
  styleUrls: ["./view-calendar.component.scss"],
})
export class ViewCalendarComponent implements OnInit {
  @ViewChild("reschduleAppointment") reschduleAppointment: CommonModalComponent;

  @ViewChild("cancelAppointment") cancelAppointment: CommonModalComponent;

  @ViewChild("appointmentDetail") appointmentDetail: AppointmentDetailModalComponent;

  @ViewChild("editEditPrescription")
  editEditPrescription: AppointmentDetailModalComponent;

  @ViewChild("providePrescription")
  providePrescription: AppointmentDetailModalComponent;

  @ViewChild("rescheduleTimeSlots")
  rescheduleTimeSlots: RescheduleAppointmentModalComponent;

  @ViewChild("markAsHoursOff") markAsHoursOff: CommonModalComponent;

  @ViewChild("markAsDaysOff") markAsDaysOff: CommonModalComponent;

  @ViewChild("timeOff") timeOff: TimeOffModalComponent;

  @ViewChild("timeOffFromAndTo") timeOffFromAndTo: TimeOffModalComponent;

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

  appointmentDetailModal: any = {
    AppointmentOn: "Starts in 3 days",
    leftBtnText: "Cancel",
    leftBtnOnClick: () => { },
    rightBtnText: "Reschedule",
    btnColor: "#efe8ff",
    btnFtColor: "#2e1e91",
    rightBtnOnClick: () => { },
  };

  editEditPrescriptionModal: any = {
    AppointmentOn: "Prescription created 1 day ago",
    rightBtnText: "Edit Prescription",
    rightBtnOnClick: () => { },
  };

  providePrescriptionModal: any = {
    AppointmentOn: "Awaiting since 1 day",

    rightBtnText: "Provide Prescription",
    rightBtnOnClick: () => { },
  };

  rescheduleTimeSlotsModal: any = {
    mainTitle: "Reschedule appointment",
    selectDate: "Select date",
    timeSlot: "Select a timeslot",
    morningTitle: "Morning",
    afterTitle: "Afternoon",
    eveningTitle: "Evening",
    rightBtnText: "Reschedule",
    rightBtnOnClick: () => { },
  };

  markAsHoursOffModal: any = {
    mainText: "Mark as hours off?",
    subText:
      "Are you sure you wan to mark hours off for 3:00 pm to 7:00 pm on 5 August, 2022? All the appointments for that time will be canceled",
    leftBtnText: "Go Back",
    leftBtnOnClick: () => { },
    rightBtnText: "Confirm",
    rightBtnOnClick: () => { },
    windowClass: "mark-as-hours-off-height",
    circleIconPath: "assets/svgs/cannot-share-prescription.svg",
  };

  markAsDaysOffModal: any = {
    mainText: "Mark as day off?",
    subText:
      "Are you sure you want to mark 5 August, 2022 as day off? All the appointments will be canceled for the day.",
    leftBtnText: "Go Back",
    leftBtnOnClick: () => { },
    rightBtnText: "Confirm",
    rightBtnOnClick: () => { },
    windowClass: "mark-as-days-off-height",
    circleIconPath: "assets/svgs/cannot-share-prescription.svg",
  };

  timeOffModal: any = {
    mainText: "5 August, 2022",
    appointmentTime: "3:00 pm - 3:30 pm 4:00 pm - 4:30 pm",
    FollowUpTime: "3:00 pm",
    isShowFromAndToFields: false,
    leftBtnText: "Cancel",
    leftBtnOnClick: () => { },
    rightBtnText: "Continue",
    rightBtnOnClick: () => { },
  };

  timeOffFromAndToModal: any = {
    mainText: "5 August, 2022",
    appointmentTime: "3:00 pm - 3:30 pm 4:00 pm - 4:30 pm",
    FollowUpTime: "3:00 pm",
    isShowFromAndToFields: true,
    leftBtnText: "Cancel",
    leftBtnOnClick: () => { },
    rightBtnText: "Continue",
    rightBtnOnClick: () => { },
  };

  todayDate = null;

  constructor() { }

  ngOnInit(): void {
    this.todayDate = moment().format("DD MMMM, YYYY");
  }

  /**
   * @todo remove this ngAfterviewInit while implementaion, added just to test that modals are working fine
   */
  ngAfterViewInit() {
    // this.appointmentDetail.openAppointmentModal();
    // this.editEditPrescription.openAppointmentModal();
    // this.providePrescription.openAppointmentModal();
    // this.rescheduleTimeSlots.openRescheduleTimeSlotsModal();
    // this.markAsHoursOff.openModal();
    // this.markAsDaysOff.openModal();
    // this.timeOff.openTimeOffModal();
    // this.timeOffFromAndTo.openTimeOffModal();
  }
}
