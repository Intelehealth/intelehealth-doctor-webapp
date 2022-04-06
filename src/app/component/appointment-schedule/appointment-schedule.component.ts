import { Component, OnInit, TemplateRef, ViewChild } from "@angular/core";
import { FormControl, FormGroup, Validators } from "@angular/forms";
import { MatSnackBar } from "@angular/material/snack-bar";
import { NgbModal } from "@ng-bootstrap/ng-bootstrap";
import { CalendarEvent, CalendarView } from "angular-calendar";
import * as moment from "moment";
import { AppointmentService } from "src/app/services/appointment.service";
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
  selector: "app-appointment-schedule",
  templateUrl: "./appointment-schedule.component.html",
  styleUrls: ["./appointment-schedule.component.css"],
})
export class AppointmentScheduleComponent implements OnInit {
  @ViewChild("modalContent") modalContent: TemplateRef<any>;
  @ViewChild("rescheduleModal") rescheduleModal: TemplateRef<any>;
  @ViewChild("slotModal") slotModal: TemplateRef<any>;
  @ViewChild("schedule") schedule: TemplateRef<any>;
  view: CalendarView = CalendarView.Month;
  CalendarView = CalendarView;
  viewDate: Date = new Date();
  events: CalendarEvent[];
  activeDayIsOpen: boolean = false;
  selectedDays = [];
  saveScheduleBody: any;
  slot = {
    startTime: "9:00 AM",
    endTime: "6:00 PM",
    specialty: "",
  };
  scheduleForm = new FormGroup({
    startTime: new FormControl(this.slot.startTime, [Validators.required]),
    endTime: new FormControl(this.slot.endTime, [Validators.required]),
    specialty: new FormControl(this.slot.endTime, [Validators.required]),
  });
  userSchedule: any = Object;
  allSchedules: any = [];
  unChanged: boolean = true;
  type: string = "month";
  types: any = [
    { day: "All Days", startTime: null, endTime: null, checked: false },
    { day: "Week Day", startTime: null, endTime: null, checked: false },
  ];
  weekDays: any = [
    { day: "Monday", startTime: null, endTime: null, checked: false },
    { day: "Tuesday", startTime: null, endTime: null, checked: false },
    { day: "Wednesday", startTime: null, endTime: null, checked: false },
    { day: "Thursday", startTime: null, endTime: null, checked: false },
    { day: "Friday", startTime: null, endTime: null, checked: false },
  ];
  weekends: any = [
    { day: "Saturday", startTime: null, endTime: null, checked: false },
    { day: "Sunday", startTime: null, endTime: null, checked: false },
  ];
  slotHours = [];
  errorMsg: string = null;
  specialization = [];
  selectedSpecialty: string;
  modalData: {
    date: Date;
    events: CalendarEvent[];
  };
  reschedule = [];
  slots = [];
  scheduleModalRef = null;
  rescheduleModalRef = null;
  slotModalRef = null;
  selectedSchedule: any = {};
  selectedDaySlots = [];
  todaysDate = moment().format("YYYY-MM-DD");
  reasons = ["Doctor Not available", "Patient Not Available", "Other"];
  selectedSlotIdx = null;
  reason = "";
  constructor(
    private appointmentService: AppointmentService,
    private snackbar: MatSnackBar,
    private modal: NgbModal,
    private dialogService: ConfirmDialogService
  ) { }

  ngOnInit(): void {
    this.getSchedule();
    this.slotHours = this.getHours();
    this.specialization = this.appointmentService.getSpecialty();
    this.specialization.sort((textA, textB) =>
      textA.value < textB.value ? -1 : textA.value > textB.value ? 1 : 0
    );
    this.selectedSpecialty = this.specialization[0]?.value;
  }

  checkDaysFromSchedule() {
    try {
      this.weekDays.forEach((day) => (day.checked = false));
      this.weekends.forEach((day) => (day.checked = false));
      if (
        this.userSchedule.slotDays &&
        this.userSchedule.slotSchedule.length > 0
      ) {
        const slotDays = this.userSchedule.slotDays.split("||");
        slotDays.forEach((day) => {
          const weekIdx = this.weekDays.findIndex((d) => d.day === day);
          const weekndIdx = this.weekends.findIndex((d) => d.day === day);
          if (weekIdx != -1) {
            this.weekDays[weekIdx].checked = true;
          }
          if (weekndIdx != -1) {
            this.weekends[weekndIdx].checked = true;
          }
        });
      }
      let weekDayCheck = true;
      let allDayCheck = true;
      this.weekDays.forEach((day) => {
        if (!day.checked) {
          weekDayCheck = false;
          allDayCheck = false;
        }
      });
      this.weekends.forEach((day) => {
        if (!day.checked) {
          allDayCheck = false;
        }
      });
      let [allDay, weekDay] = this.types;
      weekDay.checked = weekDayCheck;
      allDay.checked = allDayCheck;
    } catch (error) {
      console.log("error: ", error);
    }
  }

  get locale() {
    return localStorage.getItem("selectedLanguage");
  }

  get viewDateLabel() {
    return moment(this.viewDate).locale(this.locale).format("MMMM YYYY");
  }

  getSchedule(
    year = moment(this.viewDate).format("YYYY"),
    month = moment(this.viewDate).format("MMMM")
  ) {
    this.appointmentService
      .getUserAppoitment(this.userId, year, month)
      .subscribe({
        next: (res: any) => {
          if (res && res.data) {
            this.allSchedules = res.data;
            this.checkSpecialty();
          } else {
            this.userSchedule = {
              slotSchedule: [],
            };
            this.initializeEvents(this.userSchedule.slotSchedule);
          }
        },
      });
  }

  private initializeEvents(slots) {
    this.unChanged = true;
    let slot = slots.reverse();
    let array: CalendarEvent[] = [];
    for (let i = 0; i < slot.length; i++) {
      let event1 = {
        title: `${slot[i].startTime}-${slot[i].endTime}`,
        color: colors.yellow,
        start: new Date(slot[i].date),
        startTime: slot[i].startTime,
        endTime: slot[i].endTime,
        day: slot[i].day,
        id: slot[i].id
      };
      const isToday = this.isToday(event1.start);
      if (isToday) {
        event1["isTimeOver"] = false;
      } else {
        event1["isTimeOver"] = event1.start < new Date();
      }
      array.push(event1);
    }
    array.sort((a, b) => a.start.getTime() - b.start.getTime());
    this.events = Object.assign([], array);
    this.checkDaysFromSchedule();
    const { startTime, endTime } = this.userSchedule?.slotSchedule?.length
      ? this.userSchedule?.slotSchedule[0]
      : this.slot;
    this.ctr.startTime.setValue(startTime);
    this.ctr.endTime.setValue(endTime);
    this.ctr.specialty.setValue(this.userSchedule?.speciality);
  }

  get ctr() {
    return this.scheduleForm.controls;
  }

  getHours(returnAll = true, date?) {
    const hours = Array.from(
      {
        length: 24,
      },
      (_, hour) =>
        moment({
          hour,
          minutes: 0,
        }).format("LT")
    );
    hours.splice(0, 9);
    if (this.isToday(date) && !returnAll) {
      const hrs = hours.filter((h) => moment(h, "LT").isAfter(moment()));
      return hrs;
    } else {
      return hours;
    }
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
    this.snackbar.open(message, null, opts);
  }

  getSpeciality() {
    return JSON.parse(localStorage.provider).attributes.find((a) =>
      a.display.includes("specialization")
    ).value;
  }

  get userId() {
    return JSON.parse(localStorage.user).uuid;
  }

  get drName() {
    return (
      JSON.parse(localStorage.user)?.person?.display ||
      JSON.parse(localStorage.user)?.display
    );
  }

  validateTimeSlots(t1) {
    if (t1.startTime == null || t1.endTime == null) {
      return false;
    } else if (
      moment(t1.startTime, ["h:mm A"]).format("HH:mm:ss") >
      moment(t1.endTime, ["h:mm A"]).format("HH:mm:ss")
    ) {
      return false;
    }
    return true;
  }

  addSchedule() {
    this.selectedDays = [];
    this.ctr.specialty.setValue(this.selectedSpecialty);
    this.slotHours = this.getHours(true);
    this.checkDaysFromSchedule();
    this.scheduleModalRef = this.modal.open(this.modalContent);
  }

  set(type) {
    this.unChanged = false;
    this.errorMsg = null;
    if (type.day === "All Days") {
      this.type = "month";
      this.weekDays.forEach((element) => (element.checked = !!type.checked));
      this.weekends.forEach((element) => (element.checked = !!type.checked));
      this.types.forEach((element) => (element.checked = !!type.checked));
    } else if (type.day === "Week Day") {
      this.weekDays.forEach((element) => (element.checked = !!type.checked));
      this.type = "week";
    } else {
      this.type = "week";
    }
    this.selectedDays = this.weekDays
      .filter((day) => day.checked)
      .concat(this.weekends.filter((day) => day.checked));
    let weekDayCheck = true;
    let allDayCheck = true;
    this.weekDays.forEach((day) => {
      if (!day.checked) {
        weekDayCheck = false;
        allDayCheck = false;
      }
    });
    this.weekends.forEach((day) => {
      if (!day.checked) {
        allDayCheck = false;
      }
    });
    let [allDay, weekDay] = this.types;
    weekDay.checked = weekDayCheck;
    allDay.checked = allDayCheck;
  }

  getSlotSchedule(selectedDays) {
    let schedules = [];
    const start = moment(this.viewDate).startOf("month");
    const end = moment(this.viewDate).endOf("month");
    const todaysDate = moment(moment().format("LL"), "LL");
    let currentDay = moment(start.format());
    const days = selectedDays.map((d) => d.day);
    while (currentDay < end) {
      if (currentDay > todaysDate) {
        const day = currentDay.format("dddd");
        if (days.includes(day)) {
          schedules.push({
            day,
            endTime: this.scheduleForm.value.endTime,
            startTime: this.scheduleForm.value.startTime,
            date: currentDay.format("YYYY-MM-DD HH:mm:ss"),
            id: this.getUniqueId()
          });
        }
      }
      currentDay.add(1, "day");
    }
    let existingToKeep = [];
    const { slotSchedule = [] } = this.userSchedule;
    slotSchedule.forEach((s) => {
      const date = moment(s.date);
      let slotToPush = s;
      if (
        !date.isSame(end) &&
        !date.isSame(start) &&
        (!date.isBetween(start, end) || date <= todaysDate)
      ) {
        existingToKeep.push(slotToPush);
      }
    });
    return existingToKeep.concat(schedules);
  }

  isToday(date = this.viewDate) {
    const start = moment().startOf("day");
    const end = moment().endOf("day");
    return (
      moment().startOf("day").isSame(moment(date)) ||
      moment(date).isBetween(start, end)
    );
  }

  isPast() {
    const lastDayOfMonthStart = moment().endOf("month").startOf("day");
    const lastDayOfMonthEnd = moment().endOf("month").endOf("day");
    return moment(this.viewDate).isBetween(
      lastDayOfMonthStart,
      lastDayOfMonthEnd
    );
  }

  submit() {
    if (this.isPast()) {
      this.toast({
        message: `You can't create/update past and schedule`,
      });
      return;
    }
    if (this.validateTimeSlots(this.scheduleForm.value)) {
      if (this.unChanged && this.selectedDays.length <= 0) {
        if (this.userSchedule?.slotSchedule?.length > 0) {
          this.selectedDays = this.userSchedule?.slotSchedule;
        } else {
          this.error("Please select/update days for schedule");
          return;
        }
      }
      const speciality = this.scheduleForm.value.specialty;
      let body = this.getJson(speciality);
      this.saveSchedule(body);
      this.getSchedule();
      this.modal.dismissAll();
      this.errorMsg = null;
    } else {
      this.error(
        "Time cannot be empty and start time should be less than end time"
      );
    }
  }

  private saveSchedule(body: {
    speciality: any;
    type: string;
    userUuid: any;
    slotDays: any;
    slotSchedule: any[];
    drName: any;
  }) {
    if (body) this.saveScheduleBody = body;
    if (this.saveScheduleBody) {
      this.appointmentService
        .updateOrCreateAppointment(this.saveScheduleBody)
        .subscribe({
          next: (res: any) => {
            if (res.status) {
              this.getSchedule();
              if (res.reschedule) {
                this.reschedule = res.reschedule;
                this.rescheduleModalRef = this.modal.open(
                  this.rescheduleModal,
                  {
                    size: "lg",
                  }
                );
              }
            }
            res.message &&
              this.toast({
                message: res.message,
              });
          },
        });
      this.modal.dismissAll();
      this.scheduleModalRef.close();
    }
  }

  private getJson(speciality: any) {
    return {
      speciality,
      type: this.type,
      userUuid: this.userId,
      slotDays: this.selectedDays.map((d) => d.day).join("||"),
      slotSchedule: this.getSlotSchedule(this.selectedDays),
      drName: this.drName,
      year: moment(this.viewDate).format("YYYY"),
      month: moment(this.viewDate).format("MMMM"),
    };
  }

  clear() {
    this.weekDays.forEach((element) => {
      element.checked = false;
    });
    this.weekends.forEach((element) => {
      element.checked = false;
    });
    this.types.forEach((element) => {
      element.checked = false;
    });
    this.errorMsg = null;
    this.selectedDays = [];
    this.unChanged = false;
  }

  closeOpenMonthViewDay(type?) {
    this.getSchedule();
  }

  dayClicked({ date, events }: { date: Date; events }): void {
    events.sort((a, b) => (moment(a.startTime, "LT") < moment(b.startTime, "LT")) ? -1 : (moment(a.startTime, "LT") > moment(b.startTime, "LT")) ? 1 : 0);
    if (events.length !== 0) {
      this.modalData = { date, events };
      this.slotHours = this.getHours(false, date);
      this.modal.open(this.schedule);
    }
    this.selectedDaySlots = [];
  }

  addSlots(selectedDay) {
    let newId = this.getUniqueId();
    this.modalData.events.splice(0,0,{ start: selectedDay.start, title: selectedDay.title, id: newId });
    let obj = {
      startTime: selectedDay.startTime,
      endTime: selectedDay.endTime,
      day: selectedDay.day,
      date: moment(selectedDay.start).format("YYYY-MM-DD HH:mm:ss"),
      id: newId
    }
    this.selectedDaySlots.push(obj);
  }

  deleteSlot(selectedDay) {
    if (selectedDay.startTime && selectedDay.endTime) {
      let array = this.userSchedule.slotSchedule;
      array.forEach((element, index) => {
        if (element.id === selectedDay.id) {
          array.splice(index, 1);
          this.userSchedule.slotSchedule = array;
          this.dialogService
            .openConfirmDialog("Are you sure to cancel this schedule?")
            .afterClosed()
            .subscribe((res) => {
              if (res) {
                let body = this.getBody(array);
                this.saveSchedule(body);
              }
            });
        }
      });
    } else {
      this.modalData.events.forEach((element, index) => {
        if (element.id === selectedDay.id) {
          this.modalData.events.splice(index, 1);
        }
      });
    }
  }

  saveSlots(slots) {
    if (this.validateSlotTime(slots)) {
      let array = this.userSchedule.slotSchedule;
      slots.forEach(selectedDay => {
        let element = array.find((a) => a.id === selectedDay.id);
        if (element && new Date(element.date).getTime() ===
          new Date(selectedDay.start).getTime() &&
          element.id === selectedDay.id
        ) {
          element.startTime = selectedDay.startTime;
          element.endTime = selectedDay.endTime;
        } else {
          let newSlot = this.selectedDaySlots.find(i => i.id === selectedDay.id);
          newSlot.startTime = selectedDay.startTime;
          newSlot.endTime = selectedDay.endTime;
          array.push(newSlot);
        }
      });
      this.userSchedule.slotSchedule = array;
      let body = this.getBody(array);
      this.saveSchedule(body);
    } else {
      this.toast({
        message: "Please check the slot start & end time it cannot be same and between the other slots"
      });
    }
  }

  private getBody(array: any) {
    this.userSchedule.slotSchedule = array;
    let body = {
      speciality: this.userSchedule.speciality,
      type: this.userSchedule.type,
      userUuid: this.userSchedule.userUuid,
      slotDays: this.userSchedule.slotDays,
      slotSchedule: this.userSchedule.slotSchedule,
      drName: this.userSchedule.drName,
      year: moment(this.viewDate).format("YYYY"),
      month: moment(this.viewDate).format("MMMM"),
    };
    return body;
  }

  validateSlotTime(daySchedules) {
    daySchedules.forEach((element, index) => {
      if (!element.startTime || !element.endTime) {
        daySchedules.splice(index, 1);
      }
    });
    let isSameSlotAvailable = [];
      for (let i = 0; i < daySchedules.length; i++) {
        if (daySchedules.length === 1 || (i + 1) == (daySchedules.length)) {
          if (moment(daySchedules[0].startTime, "LT").isSame(moment(daySchedules[0].endTime, "LT")) ||
            moment(daySchedules[0].startTime, "LT").isAfter(moment(daySchedules[0].endTime, "LT"))) {
            isSameSlotAvailable.push(daySchedules[0]);
          }
        } else {
        let newStart = moment(daySchedules[i].startTime, "LT");
        let newEnd = moment(daySchedules[i].endTime, "LT");
        let strt = moment(daySchedules[i + 1].startTime, "LT");
        let end = moment(daySchedules[i + 1].endTime, "LT");
        let sameStartEndTime = newStart.isSame(newEnd);
        let sameStartGreaterEndTime = newStart.isAfter(newEnd);
        let totalSameToIgnore = strt.isSame(newStart) && end.isSame(newEnd);
        let endTimeBetween = newEnd.isBetween(strt, end);
        let startTimeBetween = newStart.isBetween(strt, end);
        if (sameStartEndTime || sameStartGreaterEndTime || totalSameToIgnore || endTimeBetween || startTimeBetween) {
          isSameSlotAvailable.push(daySchedules[i]);
        }
      }
    }
    if (isSameSlotAvailable.length > 0) {
      return false
    } else return true;
  }

  checkSpecialty() {
    let schedule = this.allSchedules.filter(
      (sp) => sp.speciality === this.selectedSpecialty
    )[0];
    if (schedule) {
      this.userSchedule = schedule;
    } else {
      this.userSchedule = {
        slotSchedule: [],
      };
    }
    this.initializeEvents(this.userSchedule.slotSchedule);
  }

  private error(msg) {
    this.errorMsg = msg;
  }

  rescheduleClick(schedule) {
    this.selectedSchedule = schedule;
    const e = { target: { value: moment().format("YYYY-MM-DD") } };
    this.changeCalender(e);
    this.slotModalRef = this.modal.open(this.slotModal);
  }

  changeCalender(e) {
    this.todaysDate = e.target.value;
    this.getAppointmentSlots();
  }

  getAppointmentSlots(
    fromDate = this.todaysDate,
    toDate = this.todaysDate,
    speciality = this.selectedSchedule?.speciality
  ) {
    this.appointmentService
      .getAppointmentSlots(
        moment(fromDate).format("DD/MM/YYYY"),
        moment(toDate).format("DD/MM/YYYY"),
        speciality
      )
      .subscribe((res: any) => {
        this.slots = res.dates;
      });
  }

  Reschedule() {
    const payload = {
      ...this.selectedSchedule,
      ...this.slots[this.selectedSlotIdx],
      reason: this.reason,
      appointmentId: this.selectedSchedule?.id,
    };

    this.appointmentService
      .rescheduleAppointment(payload)
      .subscribe((res: any) => {
        const message = res.message || "Appointment rescheduled successfully!";
        this.toast({ message });
        this.selectedSlotIdx = null;
        // this.rescheduleModalRef.close();
        // this.modal.dismissAll();
        this.saveSchedule(this.saveScheduleBody);
      });
  }

  selectSlot(slot) {
    this.selectedSlotIdx = slot;
  }

  //  Math.random should be unique because of its seeding algorithm.
  // Convert it to base 36 (numbers + letters), and grab the first 9 characters
  // after the decimal.
  getUniqueId() {
    return Math.random().toString(36).substr(2, 9);
  };
}
