import { Component, OnInit, ViewChild } from "@angular/core";
import { MatTabChangeEvent } from "@angular/material/tabs";
import { CalendarView } from "angular-calendar";
import * as moment from "moment";
import { ToastrService } from "ngx-toastr";
import { AppointmentDetailModalComponent } from "src/app/modals/appointment-detail-modal/appointment-detail-modal.component";
import { CommonModalComponent } from "src/app/modals/common-modal/common-modal.component";
import { RescheduleAppointmentModalComponent } from "src/app/modals/reschedule-appointment-modal/reschedule-appointment-modal.component";
import { TimeOffModalComponent } from "src/app/modals/time-off-modal/time-off-modal.component";
import { AppointmentService } from "src/app/services/appointment.service";
import { VisitService } from "src/app/services/visit.service";

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
    leftBtnOnClick: () => {
       this.openRescheduleTimeSlots();
     },
    rightBtnText: "Confirm",
    rightBtnOnClick: () => {
      this.reschdule();
     },
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
    leftBtnOnClick: () => { 
      this.openModal(this.selectedSlot)
    },
    rightBtnText: "Cancel",
    rightBtnOnClick: () => {
      this.cancel();
     },
    windowClass: "shared-successfull",
    circleIconPath: "assets/svgs/cancel-the-appointment.svg",
  };

  appointmentDetailModal: any = {
    AppointmentOn: "Starts in 3 days",
    leftBtnText: "Cancel",
    leftBtnOnClick: () => { 
      this.confirmCancelAppointment()
    },
    rightBtnText: "Reschedule",
    btnColor: "#efe8ff",
    btnFtColor: "#2e1e91",
    rightBtnOnClick: () => {
      this.openRescheduleTimeSlots();
    },
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
    rightBtnOnClick: (activeSlot, date) => { 
            this.confirmRescheduleTimeSlots(activeSlot, date);
    },
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

  todayDate: Date = new Date();
  view: CalendarView = CalendarView.Day;
  dates = { startOfMonth: "", endOfMonth: "" }
  appointments = [];
  selectedSlot;
  constructor(private appointmentService: AppointmentService,
    private visitService: VisitService,
    private toastr: ToastrService) { }

  ngOnInit(): void {
    this.setView('day');
  }

  onTabChange(event: MatTabChangeEvent) {
    if (event.index === 2) {
      this.setView(CalendarView.Month);
    } else if (event.index === 1) {
      this.setView(CalendarView.Week);
    } else {
      this.setView(CalendarView.Day);
    }
  }

  setView(view) {
    this.view = view;
    this.getData();
  }

  getData() {
    this.dates = this.getDates(this.view);
    this.getDrSlots(this.dates.startOfMonth, this.dates.endOfMonth);
  }

  getDates(view) {
    let startOfMonth = moment(this.todayDate)
      .startOf(view)
      .format("YYYY-MM-DD hh:mm");
    let endOfMonth = moment(this.todayDate)
      .endOf(view)
      .format("YYYY-MM-DD hh:mm");
    return { startOfMonth, endOfMonth };
  }

  getDrSlots(fromDate, toDate) {
    this.appointmentService
      .getUserSlots(
        this.userId,
        moment(fromDate).format("DD/MM/YYYY"),
        moment(toDate).format("DD/MM/YYYY")
      )
      .subscribe({
        next: (res: any) => {
          this.appointments = res.data;
        },
      });
  }


  get userId() {
    return JSON.parse(localStorage.user).uuid;
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

  openModal(slot) {
    this.visitService
      .fetchVisitDetails(slot.visitId)
      .subscribe((visitDetails) => {
        let recentComplaints: any = [];
        const encounters = visitDetails.encounters;
        encounters.forEach(encounter => {
          const display = encounter.display;
          if (display.match('ADULTINITIAL') !== null) {
            const obs = encounter.obs;
            obs.forEach(currentObs => {
              if (currentObs.display.match('CURRENT COMPLAINT') !== null) {
                const currentComplaint = currentObs.display.split('<b>');
                for (let i = 1; i < currentComplaint.length; i++) {
                  const obs1 = currentComplaint[i].split('<');
                  if (!obs1[0].match('Associated symptoms')) {
                    recentComplaints.push(obs1[0]);
                  }
                }
              }
            });
            const providerAttribute =
              encounter.encounterProviders[0].provider.attributes;
            if (providerAttribute.length) {
              providerAttribute.forEach((attribute) => {
                if (attribute.display.match("phoneNumber") != null) {
                  slot["hwPhoneNo"] = attribute.value;
                }
              });
            }
          }
        });
        slot["complaints"] = recentComplaints;
        slot["visitStatus"] = this.getVisitStatus(encounters[0]?.encounterType.display);
        if (slot.modal === "details") {
          this.appointmentDetailModal["data"] = slot;
          this.selectedSlot = slot;
          this.appointmentDetail.openAppointmentModal();
        }
      });
  }

  openRescheduleTimeSlots() {
    // this.visitService
    // .fetchVisitDetails(
    //   this.selectedSlot.visitId,
    //   "custom:(uuid,encounters:(display,uuid,display))"
    // )
    // .subscribe((res) => {
    //   const len = res.encounters.filter((e) => {
    //     return (
    //       e.display.includes("Patient Exit Survey") ||
    //       e.display.includes("Visit Complete")
    //     );
    //   }).length;
    //   const isCompleted = Boolean(len);
    //   if (isCompleted) {
    //     const message = `Visit is already completed, it can't be rescheduled.`;
    //     this.toastr.error(message);
    //   } else {
    //     this.rescheduleTimeSlotsModal["data"] = this.selectedSlot;
    //     this.rescheduleTimeSlots.openRescheduleTimeSlotsModal();
    //   }
    // });
    this.rescheduleTimeSlotsModal["data"] = this.selectedSlot;
    this.rescheduleTimeSlots.openRescheduleTimeSlotsModal();
  }

  confirmRescheduleTimeSlots(slotTime, date) {
    this.reschduleTheAppointmentModal.subText = this.reschduleTheAppointmentModal.subText.replace('muskan kala', this.selectedSlot?.patientName);
    this.reschduleTheAppointmentModal.timings = {
      fromDate: this.selectedSlot.date,
      fromTime: this.selectedSlot.startTime,
      toDate: date,
      toTime: slotTime,
    },
    this.reschduleAppointment.openModal()
  }

  reschdule() {
    // const payload = {
    // };

    // this.appointmentService
    //   .rescheduleAppointment(payload)
    //   .subscribe((res: any) => {
    //     const message = res.message || "Appointment rescheduled successfully!";
    //     this.toastr.success(message);
    //   });
  }

  confirmCancelAppointment() {
    let date = moment(this.selectedSlot?.appointmentDate,'YYYY-MM-DD HH:mm:ss').format('D MMMM');
    this.cancelAppointmentModal.subText =  this.cancelAppointmentModal.subText.replace('5 August', date).replace('10:00 am', this.selectedSlot?.startTime);
    this.cancelAppointment.openModal();
  }

  cancel() {
    const payload = {
      id: this.selectedSlot.id,
      visitUuid: this.selectedSlot.visitId,
      hwUUID: this.userId,
    };
    this.appointmentService
      .cancelAppointment(payload)
      .subscribe((res: any) => {
        const message =
          res.message || "Appointment cancelled successfully!";
          this.toastr.success(message);
      });
  }

  openMonthlyModal() {
    this.timeOff.openTimeOffModal();
  }

  getVisitStatus(status: string) {
    let statusName: string = 'NA';
    switch (status) {
      case "Flagged":
        statusName = "Priority";
        break;
      case "ADULTINITIAL":
      case "Vitals":
        statusName = "Awaiting";
        break;
      case "Visit Note":
        statusName = "In-progress";
        break;
      case "Visit Complete":
        statusName = "Completed";
        break;
      case "Patient Exit Survey":
        statusName = "Ended";
        break;
    }
    return statusName;
  }
}
