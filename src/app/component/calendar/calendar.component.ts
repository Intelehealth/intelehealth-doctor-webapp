import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  TemplateRef,
  ViewChild,
} from "@angular/core";
import { Router } from "@angular/router";
import { NgbModal } from "@ng-bootstrap/ng-bootstrap";
import {
  CalendarView,
  CalendarDateFormatter,
  CalendarEventTimesChangedEvent,
} from "angular-calendar";
import { CalendarEvent } from "calendar-utils";
import { isSameMonth, isSameDay, addMinutes } from "date-fns";
import * as moment from "moment";
import { Subject } from "rxjs";
import { AppointmentService } from "src/app/services/appointment.service";
import { TranslationService } from "src/app/services/translation.service";
import { VisitService } from "src/app/services/visit.service";
import { ConfirmDialogService } from "../visit-summary/reassign-speciality/confirm-dialog/confirm-dialog.service";

const colors: any = {
  red: {
    primary: "#ad2121",
    secondary: "#FAE3E3",
  },
  blue: {
    primary: "#1e90ff",
    secondary: "#D1E8FF",
  },
  yellow: {
    primary: "#e3bc08",
    secondary: "#FDF1BA",
  },
};

@Component({
  selector: "app-calendar",
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: "./calendar.component.html",
  styleUrls: ["./calendar.component.css"],
  providers: [
    {
      provide: CalendarDateFormatter,
    },
  ],
})
export class CalendarComponent implements OnInit {
  @ViewChild("modalContent") modalContent: TemplateRef<any>;
  @ViewChild("rescheduleModal") rescheduleModal: TemplateRef<any>;
  view: CalendarView = CalendarView.Day;
  CalendarView = CalendarView;
  viewDate: Date = new Date();
  drSlots = [];
  modalData: {
    date: Date;
    events: CalendarEvent[];
  };
  refresh: Subject<any> = new Subject();
  events: CalendarEvent[];
  activeDayIsOpen: boolean = false;
  selectedLang: string = "en";
  setSpiner = false;
  selectedReason = "";
  otherReason = "";
  reasons = ["Doctor Not Available", "Patient Not Available", "Other"];
  constructor(
    private modal: NgbModal,
    private appointmentService: AppointmentService,
    private vService: VisitService,
    private translationService: TranslationService,
    private dialogService: ConfirmDialogService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.selectedLang = localStorage.getItem("selectedLanguage");
    this.getSlots();

    setInterval(this.tick.bind(this), 30000);
  }

  tick() {
    const mins: any = new Date().getMinutes();
    if ([0, 15, 30, 45].includes(mins)) {
      this.getSlots();
    }
  }

  getSlots() {
    let dates = this.getDates("month");
    this.getDrSlots(dates.startOfMonth, dates.endOfMonth);
  }

  private initializeEvents(slot) {
    let array: CalendarEvent[] = [];
    for (let i = 0; i < slot.length; i++) {
      let event1 = {
        ...slot[i],
        title: `${slot[i].patientName}(${slot[i].openMrsId}) ${slot[i].slotTime}`,
        color: colors.yellow,
        start: new Date(slot[i].slotJsDate),
        end: new Date(moment(slot[i].slotJsDate).add(30, 'minutes').toDate()),
        // start: new Date(
        //   moment(
        //     slot[i].slotDate.concat(
        //       moment(slot[i].slotTime, ["h:mm A"]).format("HH:mm:ss")
        //     ),
        //     "DD/MM/YYYY hh:mm:ss"
        //   ).toDate()
        // ),
        // end: new Date(
        //   addMinutes(
        //     moment(
        //       slot[i].slotDate.concat(
        //         moment(slot[i].slotTime, ["h:mm A"]).format("HH:mm:ss")
        //       ),
        //       "DD/MM/YYYY hh:mm:ss"
        //     ).toDate(),
        //     slot[i].slotDuration
        //   )
        // ),
        patientId: slot[i].patientId,
        visitUuid: slot[i].visitUuid,
        patientName: slot[i].patientName,
        openMrsId: slot[i].openMrsId,
        slotTime: slot[i].slotTime,
        speciality: slot[i].speciality,
        locationUuid: slot[i].locationUuid,
        hwUUID: slot[i].hwUUID,
        appointmentId: slot[i].id,
      };
      event1["isTimeOver"] = event1.start < new Date();
      array.push(event1);
    }
    array.sort((a, b) => a.start.getTime() - b.start.getTime());
    this.events = Object.assign([], array);
    this.refresh.next();
  }

  dayClicked({ date, events }: { date: Date; events: CalendarEvent[] }): void {
    if (isSameMonth(date, this.viewDate)) {
      //  this.viewDate = date;
      if (
        (isSameDay(this.viewDate, date) && this.activeDayIsOpen === true) ||
        events.length === 0
      ) {
        //this.activeDayIsOpen = false;
      } else {
        this.modalData = { date, events };
        this.detailModalRef = this.modal.open(this.modalContent);
        //this.activeDayIsOpen = true;
      }
    }
  }

  eventTimesChanged({
    event,
    newStart,
    newEnd,
  }: CalendarEventTimesChangedEvent): void {
    this.events = this.events.map((iEvent) => {
      if (iEvent === event) {
        return {
          ...event,
          start: newStart,
          end: newEnd,
        };
      }
      return iEvent;
    });
    this.handleEvent("Dropped or resized", event);
  }

  handleEvent(action: string, event: CalendarEvent): void {
    let events = [];
    events.push(event);
    let date = new Date(event.start);
    this.modalData = { date, events };
    this.detailModalRef = this.modal.open(this.modalContent);
  }

  setView(view: CalendarView) {
    this.view = view;
    this.getData();
  }

  closeOpenMonthViewDay(selectedMonth) {
    this.activeDayIsOpen = false;
    if (selectedMonth === "Previous") {
      let startOfMonth = moment(this.viewDate)
        .startOf(this.view)
        .format("YYYY-MM-DD hh:mm");
      let endOfMonth = moment(this.viewDate)
        .endOf(this.view)
        .format("YYYY-MM-DD hh:mm");
      this.getDrSlots(startOfMonth, endOfMonth);
    } else if (selectedMonth === "Next") {
      let startOfMonth = moment(this.viewDate)
        .startOf(this.view)
        .format("YYYY-MM-DD hh:mm");
      let endOfMonth = moment(this.viewDate)
        .endOf(this.view)
        .format("YYYY-MM-DD hh:mm");
      this.getDrSlots(startOfMonth, endOfMonth);
    } else {
      let startOfMonth = moment(new Date())
        .startOf(this.view)
        .format("YYYY-MM-DD hh:mm");
      let endOfMonth = moment(new Date())
        .endOf(this.view)
        .format("YYYY-MM-DD hh:mm");
      this.getDrSlots(startOfMonth, endOfMonth);
    }
  }

  getData() {
    let dates = this.getDates(this.view);
    this.getDrSlots(dates.startOfMonth, dates.endOfMonth);
  }

  getDates(view) {
    let startOfMonth = moment(this.viewDate)
      .startOf(view)
      .format("YYYY-MM-DD hh:mm");
    let endOfMonth = moment(this.viewDate)
      .endOf(view)
      .format("YYYY-MM-DD hh:mm");
    return { startOfMonth, endOfMonth };
  }

  public getSpeciality() {
    return JSON.parse(localStorage.provider).attributes.find((a) =>
      a.display.includes("specialization")
    ).value;
  }

  getDrSlots(fromDate, toDate) {
    this.appointmentService
      .getSpecialitySlots(
        this.getSpeciality(),
        moment(fromDate).format("DD/MM/YYYY"),
        moment(toDate).format("DD/MM/YYYY")
      )
      .subscribe({
        next: (res: any) => {
          this.drSlots = res.data;
          this.initializeEvents(this.drSlots);
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
  minDate = moment().format("YYYY-MM-DD");
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
          this.toast({ message });
        } else {
          this.selectedSchedule = schedule;
          const e = { target: { value: moment().format("YYYY-MM-DD") } };
          this.changeCalender(e);
          this.rescheduleModalRef = this.modal.open(this.rescheduleModal);
        }
      });
  }

  changeCalender(e) {
    this.todaysDate = e.target.value;
    this.getAppointmentSlots();
  }

  selectSlot(slot) {
    this.selectedSlotIdx = slot;
  }

  reschedule() {
    const payload = {
      ...this.selectedSchedule,
      ...this.slots[this.selectedSlotIdx],
      reason: this.reason,
    };

    this.appointmentService
      .rescheduleAppointment(payload)
      .subscribe((res: any) => {
        const message = res.message || "Appointment rescheduled successfully!";
        this.toast({ message });
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
              this.toast({ message });
              this.detailModalRef.close();
              this.ngOnInit();
            });
        }
      });
  }

  toast({
    message,
    duration = 5000,
    horizontalPosition = "center",
    verticalPosition = "bottom",
  }) {
    const opts: any = {
      duration,
      horizontalPosition,
      verticalPosition,
    };
    this.translationService.getTranslation(message);
    //this.snackbar.open(message, null, opts);
  }

  clear() {
    this.selectedSlotIdx = null;
    this.selectedReason = null;
    this.otherReason = "";
  }

  get locale() {
    return localStorage.getItem("selectedLanguage");
  }

  get reason() {
    let reason;
    if (this.selectedReason === this.reasons[2]) reason = this.otherReason;
    else reason = this.selectedReason;
    return reason;
  }

  get rescheduleDisabled() {
    return !this.slots[this.selectedSlotIdx] || !this.reason;
  }

  startAppointment(appnt) {
    this.appointmentService.startAppointment({
      appointmentId: appnt.appointmentId || appnt.id,
      drName: this.drName,
      userUuid: this.userId
    }).subscribe((res: any) => {
      if (res.status) {
        this.toast({ message: 'Appointment started' });
        this.router.navigate(['/visitSummary', appnt.patientId, appnt.visitUuid])
      }
    });
  }

  isAppointmentTime(appnt) {
    const isTime = moment().isBefore(moment(appnt.slotJsDate));
    return isTime;
  }

  get drName() {
    return (
      JSON.parse(localStorage.user)?.person?.display ||
      JSON.parse(localStorage.user)?.display
    );
  }
}
