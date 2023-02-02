import { Component, OnInit, ViewChild } from "@angular/core";
import { MatTabChangeEvent } from "@angular/material/tabs";
import { Router } from "@angular/router";
import { CalendarView } from "angular-calendar";
import * as moment from "moment";
import { ToastrService } from "ngx-toastr";
import { AppointmentDetailModalComponent } from "src/app/modals/appointment-detail-modal/appointment-detail-modal.component";
import { CommonModalComponent } from "src/app/modals/common-modal/common-modal.component";
import { RescheduleAppointmentModalComponent } from "src/app/modals/reschedule-appointment-modal/reschedule-appointment-modal.component";
import { TimeOffModalComponent } from "src/app/modals/time-off-modal/time-off-modal.component";
import { AppointmentService } from "src/app/services/appointment.service";
import { VisitService } from "src/app/services/visit.service";

class FollowUp {
  id: number
  slotTime: string
  openMrsId: string
  patientName: string
  patientPic: string
  patientGender:string
  patientAge: string
  healthWorker: string
  hwName: string
  hwPic: string
  hwAge: string
  hwGender: string
  type: string
  patientId: string
  visitUuid:string;
  createdAt: string
  slotJsDate: string
  appointmentDate: string
  speciality: string
}

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
    rightBtnOnClick: () => {
        this.navigateToSummaray();
     },
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
    rightBtnOnClick: () => {
      this.saveHoursOff();
    },
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
    rightBtnOnClick: () => {
      this.saveDaysoff();
    },
    windowClass: "mark-as-days-off-height",
    circleIconPath: "assets/svgs/cannot-share-prescription.svg",
  };

  timeOffModal: any = {
    mainText: "5 August, 2022",
    appointmentTime: [],
    FollowUpTime: [],
    isShowFromAndToFields: false,
    leftBtnText: "Cancel",
    leftBtnOnClick: () => { },
    rightBtnText: "Continue",
    rightBtnOnClick: (data) => {
      if (data.selectedValue === "dayOff") {
        this.confirmMarkAsDaysOff();
      } else {
        this.confirmMarkAsHoursOff(data.selectedFrom, data.selectedToTime);
      }
    },
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
  followUpVisits = [];
  selectedSlot;
  daysOff = [];
  drScheduleForMonth;
  constructor(private appointmentService: AppointmentService,
    private visitService: VisitService,
    private toastr: ToastrService,
    private router: Router) { }

  ngOnInit(): void {
    this.setView('day');
    this.getFollowUpVisit();
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
    this.getDrSchedule();
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
          this.getFollowUpVisitByDates(this.dates.startOfMonth, this.dates.endOfMonth);
        },
      });
  }

  getDrSchedule(
    year = moment(this.dates.startOfMonth).format("YYYY"),
    month = moment(this.dates.endOfMonth).format("MMMM")
  ) {
    this.appointmentService
      .getUserAppoitment(this.userId, year, month)
      .subscribe({
        next: (res: any) => {
          if (res && res.data) {
            this.drScheduleForMonth = res.data;
            this.daysOff = res.data.daysOff;
          } else {
            this.daysOff = [];
          }
        }
      });
  }

  getFollowUpVisit() {
    this.followUpVisits = [];
    this.appointmentService
    .getFollowUpVisit(this.providerId)
    .subscribe({
      next: (res: any) => {
        if(res) {
          let followUpVisits = res;
            followUpVisits.forEach(visit => {
            this.visitService.getVisitDetails(visit.visit_id)
            .subscribe((result)=> {
              this.setFollowUpVisit(visit, result);
            })
          });
        }
      },
    });
  }

  setFollowUpVisit(followUpVisit, visit) {
    let obj = new FollowUp;
    obj.slotTime = (followUpVisit.followup_text.includes("Time")) ? followUpVisit.followup_text.split(", Time: ")[1]?.split(", Remark: ")[0]: "10:00 AM";
    obj.patientName = visit.patient.person.display;
    obj.patientAge = visit.patient.person.age;
    obj.patientGender = visit.patient.person.gender;
    obj.patientPic = "";
    obj.openMrsId = visit.patient.identifiers[0].identifier;
    obj.patientId = visit.patient.uuid;
    obj.visitUuid = visit.uuid;
    obj.appointmentDate = (followUpVisit.followup_text.includes(",")) ? followUpVisit.followup_text.split(", Time: ")[0] : followUpVisit.followup_text;
    obj.type = 'followUp';
    obj.createdAt = moment(obj.appointmentDate, 'DD-MM-YYYY').format("YYYY-MM-DD HH:mm:ss");
    obj.slotJsDate = moment(obj.appointmentDate, 'DD-MM-YYYY').format("YYYY-MM-DD HH:mm:ss")
    const encounters = visit.encounters;
        encounters.forEach(encounter => {
          const display = encounter.display;
          if (display.match('ADULTINITIAL') !== null) {
            obj.hwName = encounter.encounterProviders[0].provider.person.display;
            obj.hwAge = encounter.encounterProviders[0].provider.person.age;
            obj.hwGender = encounter.encounterProviders[0].provider.person.gender;
            obj.hwPic = "";
          }
        });
       this.followUpVisits.push(obj);
  }

  getFollowUpVisitByDates(start, end) {
    let array = [];
    this.followUpVisits.forEach(visit => {
      if(moment(start,"YYYY-MM-DD").isSame(moment(visit.createdAt,"YYYY-MM-DD")) || moment(end,"YYYY-MM-DD").isSame(moment(visit.createdAt,"YYYY-MM-DD")) || 
      moment(visit.createdAt,"YYYY-MM-DD").isBetween(moment(start,"YYYY-MM-DD"),(moment(end,"YYYY-MM-DD")))) {
        array.push(visit);
      }
    });
    this.appointments = this.appointments.concat(array);
  }

  get userId() {
    return JSON.parse(localStorage.user).uuid;
  }

  get providerId() {
    return JSON.parse(localStorage.provider).uuid;
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
        this.selectedSlot = slot;
        let days = moment(encounters[0]?.encounterDatetime, "YYYY-MM-DD HH:mm:ss").diff(moment(), 'days');
        if (slot.modal === "details" && slot.type === 'appointment') {
          this.appointmentDetailModal["data"] = slot;
          let day = moment(slot.appointmentDate, "YYYY-MM-DD HH:mm:ss").diff(moment(), 'days')
          this.appointmentDetailModal.AppointmentOn = day > 0 ?  `Starts in ${Math.abs(day)} days` : `Awaiting since ${Math.abs(day)} day`;
          this.appointmentDetail.openAppointmentModal();
        } else if( slot["visitStatus"] === 'Completed' ||  slot["visitStatus"] === 'Ended') {
          this.editEditPrescriptionModal.AppointmentOn = days < 1 ? `Prescription created ${Math.abs(days)} days ago`: `Prescription created ${Math.abs(days)} day ago`;
          this.editEditPrescriptionModal["data"] = slot;
          this.editEditPrescription.openAppointmentModal();
        } else {
          this.providePrescriptionModal.AppointmentOn = `Awaiting since ${Math.abs(days)} day`;
          this.providePrescriptionModal["data"] = slot;
          this.providePrescription.openAppointmentModal();
        }
      });
  }

  openRescheduleTimeSlots() {
    this.visitService
      .fetchVisitDetails(
        this.selectedSlot.visitId,
        "custom:(uuid,encounters:(display,uuid,display))"
      )
      .subscribe((res) => {
        const len = res.encounters.filter((e) => {
          return (
            e.display.includes("Patient Exit Survey") ||
            e.display.includes("Visit Complete")
          );
        }).length;
        const isCompleted = Boolean(len);
        if (isCompleted) {
          const message = `Visit is already completed, it can't be rescheduled.`;
          this.toastr.error(message, 'Rescheduling failed');
        } else {
          this.rescheduleTimeSlotsModal["data"] = this.selectedSlot;
          this.rescheduleTimeSlots.openRescheduleTimeSlotsModal();
        }
      });
  }

  confirmRescheduleTimeSlots(slotTime, date) {
    this.reschduleTheAppointmentModal.subText = this.reschduleTheAppointmentModal.subText.replace('muskan kala', this.selectedSlot?.patientName);
    this.reschduleTheAppointmentModal.timings = {
      fromDate: this.selectedSlot.appointmentDate,
      fromTime: this.selectedSlot.startTime,
      toDate: date,
      toTime: slotTime,
    },
      this.reschduleAppointment.openModal()
  }

  reschdule() {
    let apt = this.appointments.find(apt => apt.id === this.selectedSlot.id);
    apt.appointmentId = apt.id;
    apt.slotDate = moment(this.reschduleTheAppointmentModal.timings.toDate, "YYYY-MM-DD").format('DD/MM/YYYY');
    apt.slotTime = this.reschduleTheAppointmentModal.timings.toTime;
    this.appointmentService
      .rescheduleAppointment(apt)
      .subscribe((res: any) => {
        this.getDrSlots(this.dates.startOfMonth, this.dates.endOfMonth);
        const message = res.message || "Appointment rescheduled successfully!";
        this.toastr.success(message, 'Rescheduling successful');
      });
  }

  confirmCancelAppointment() {
    let date = moment(this.selectedSlot?.appointmentDate, 'YYYY-MM-DD HH:mm:ss').format('D MMMM');
    this.cancelAppointmentModal.subText = this.cancelAppointmentModal.subText.replace('5 August', date).replace('10:00 am', this.selectedSlot?.startTime);
    this.cancelAppointment.openModal();
  }

  cancel(slot?) {
    const payload = {
      id: slot ? slot.id : this.selectedSlot.id,
      visitUuid: slot ? slot.visitId : this.selectedSlot.visitId,
      hwUUID: this.userId,
    };
    this.appointmentService
      .cancelAppointment(payload)
      .subscribe((res: any) => {
        const message =
          res.message || "Appointment cancelled successfully!";
        this.toastr.success(message, 'Canceling successful');
        this.getDrSlots(this.dates.startOfMonth, this.dates.endOfMonth);
      });
  }

  openMonthlyModal(slot) {
    this.timeOffModal.appointmentTime = [];
    this.timeOffModal.FollowUpTime = [];
    this.selectedSlot = slot;
    slot.slots.forEach(slot => {
      if(slot.type === 'appointment') {
        let value = slot.startTime + "-" + slot.endTime
        this.timeOffModal.appointmentTime.push(value);
      } else {
        this.timeOffModal.FollowUpTime.push(slot.startTime);
      }
     
    });
    this.timeOffModal.mainText = moment(slot?.appointmentDate, 'YYYY-MM-DD HH:mm:ss').format("DD MMM, YYYY")
    this.timeOff.openTimeOffModal();
  }

  confirmMarkAsDaysOff() {
    this.markAsDaysOffModal.subText = this.markAsDaysOffModal.subText.replace('5 August, 2022', moment(this.selectedSlot?.appointmentDate, 'YYYY-MM-DD HH:mm:ss').format("DD MMM, YYYY"));
    this.markAsDaysOff.openModal();
  }

  confirmMarkAsHoursOff(startTime, endTime) {
    this.markAsHoursOffModal.subText = this.markAsHoursOffModal.subText.replace('5 August, 2022', moment(this.selectedSlot?.appointmentDate, 'YYYY-MM-DD HH:mm:ss').format("DD MMM, YYYY"))
      .replace('3:00 pm', startTime).replace('7:00 pm', endTime);
    this.selectedSlot['startTimeforHoursOff'] = startTime;
    this.selectedSlot['endTimeforHoursOff'] = endTime;
    this.markAsHoursOff.openModal();
  }

  saveDaysoff() {
    if (this.daysOff?.length > 0 && !this.daysOff?.includes(moment(this.selectedSlot.appointmentDate).format("DD/MM/YYYY"))) {
      this.daysOff?.push(moment(this.selectedSlot.appointmentDate).format("DD/MM/YYYY"));
    } else {
      this.daysOff = [];
      this.daysOff?.push(moment(this.selectedSlot.appointmentDate).format("DD/MM/YYYY"));
    }
    let body = {
      userUuid: this.userId,
      daysOff: this.daysOff,
      month: this.selectedSlot.monthName,
      year: this.selectedSlot.year
    };
    this.appointmentService.updateDaysOff(body).subscribe({
      next: (res: any) => {
        if (res.status) {
          this.selectedSlot.slots.forEach((slot) => {
            this.cancel(slot);
          });
        }
      },
    });
  }

  saveHoursOff() {
    this.selectedSlot.slots.forEach((slot) => {
      if (moment(slot.startTime, "LT").isBetween(moment(this.selectedSlot.startTimeforHoursOff, "LT"), moment(this.selectedSlot.endTimeforHoursOff, "LT")) ||
        moment(slot.endTime, "LT").isBetween(moment(this.selectedSlot.startTimeforHoursOff, "LT"), moment(this.selectedSlot.endTimeforHoursOff, "LT"))) {
        this.cancel(slot);
      }
    });
  }

  navigateToSummaray() {
    this.router.navigate(['/dashboard/visit-summary', this.selectedSlot.patientId, this.selectedSlot.visitId]);
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
