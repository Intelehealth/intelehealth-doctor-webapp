import { Component, OnInit, Input, ViewChild, TemplateRef } from "@angular/core";
import * as moment from "moment";
import { AppointmentService } from "src/app/services/appointment.service";
import { VisitService } from "src/app/services/visit.service";
import { ConfirmDialogService } from "../visit-summary/reassign-speciality/confirm-dialog/confirm-dialog.service";

@Component({
  selector: "app-dashboard-table",
  templateUrl: "./dashboard-table.component.html",
  styleUrls: ["./dashboard-table.component.scss"],
})
export class DashboardTableComponent implements OnInit {
  @Input("tableConfig") set tableConfig(tableConfig) {
    this.table = tableConfig;
  }
  table: any;
  @Input() data;
  @Input() visitCounts;
  viewDate: Date = new Date();
  drSlots = [];
  setSpiner = false;
  constructor(
    private appointmentService: AppointmentService,
    private vService: VisitService,
    private dialogService: ConfirmDialogService,
  ) { }

  ngOnInit(): void {
    let endOfMonth = moment(this.viewDate).endOf("month").format("YYYY-MM-DD hh:mm");
    this.getDrSlots(endOfMonth);
  }

  getDrSlots(toDate) {
    this.appointmentService
      .getUserSlots(
        this.userId,
        moment('2022-01-01 12:00').format("DD/MM/YYYY"),
        moment(toDate).format("DD/MM/YYYY")
      )
      .subscribe({
        next: (res: any) => {
          this.drSlots = res.data;
          console.log(this.drSlots,"Response");
        },
      });
  }

  get userId() {
    return JSON.parse(localStorage.user).uuid;
  }

  selectedSchedule = null;
  selectedSlotIdx = null;
  rescheduleModalRef = null;
  detailModalRef = null;
  todaysDate = moment().format("YYYY-MM-DD");
  slots = [];
  rescheduleClick(schedule) {
    this.vService
    .fetchVisitDetails(
      schedule.visitUuid,
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
      } else {
        this.selectedSchedule = schedule;
        const e = { target: { value: moment().format("YYYY-MM-DD") } };
      }
    });
  }

  reschedule() {
    const payload = {
      ...this.selectedSchedule,
      ...this.slots[this.selectedSlotIdx],
    };
    this.appointmentService
      .rescheduleAppointment(payload)
      .subscribe((res: any) => {
        const message = res.message || "Appointment rescheduled successfully!";
        this.rescheduleModalRef.close();
        this.detailModalRef.close();
        this.selectedSlotIdx = null;
        this.ngOnInit();
      });
  }

  getAppointmentSlots(
    fromDate = this.todaysDate,
    toDate = this.todaysDate,
    speciality = this.selectedSchedule?.speciality
  ) {
    this.setSpiner = true;
    this.appointmentService
      .getAppointmentSlots(
        moment(fromDate).format("DD/MM/YYYY"),
        moment(toDate).format("DD/MM/YYYY"),
        speciality
      )
      .subscribe((res: any) => {
        this.slots = res.dates;
        this.setSpiner = false;
      });
  }

  cancelAppointment(schedule) {
    this.dialogService
    .openConfirmDialog(
      "Are you sure to cancel this appointment?",
      "cancelAppointment"
    )
    .afterClosed()
    .subscribe((res) => {
      if (res) {
        const payload = {
          id: schedule.appointmentId,
          visitUuid: schedule.visitUuid,
          reason: localStorage.reason,
          hwUUID: this.userId,
        };
        this.appointmentService
          .cancelAppointment(payload)
          .subscribe((res: any) => {
            const message =
              res.message || "Appointment cancelled successfully!";
            this.detailModalRef.close();
            this.ngOnInit();
          });
      }
    });
  }

  get rescheduleDisabled() {
    return !this.slots[this.selectedSlotIdx]
  }
}
