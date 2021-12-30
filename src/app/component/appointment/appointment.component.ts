import { Component, OnInit, TemplateRef, ViewChild } from "@angular/core";
import {
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from "@angular/forms";
import { MatSnackBar } from "@angular/material/snack-bar";
import { NgbModal } from "@ng-bootstrap/ng-bootstrap";
import { TranslateService } from "@ngx-translate/core";
import { CalendarEvent, CalendarView } from "angular-calendar";
import * as moment from "moment";
import { AppointmentService } from "src/app/services/appointment.service";
import { TranslationService } from "src/app/services/translation.service";

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
  selector: "app-appointment",
  templateUrl: "./appointment.component.html",
  styleUrls: ["./appointment.component.css"],
})
export class AppointmentComponent implements OnInit {
  @ViewChild("modalContent") modalContent: TemplateRef<any>;
  @ViewChild("schedule") schedule: TemplateRef<any>;
  view: CalendarView = CalendarView.Month;
  CalendarView = CalendarView;
  viewDate: Date = new Date();
  events: CalendarEvent[];
  activeDayIsOpen: boolean = false;
  selectedLang: string = "en";
  selectedDays = [];
  scheduleForm = new FormGroup({
    startTime: new FormControl("9:00 AM", [Validators.required]),
    endTime: new FormControl("6:00 PM", [Validators.required]),
  });
  userSchedule: any = Object;
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
  modalData: {
    date: Date;
    events: CalendarEvent[];
  };
  constructor(
    private fb: FormBuilder,
    private appointmentService: AppointmentService,
    private snackbar: MatSnackBar,
    private translationService: TranslationService,
    private modal: NgbModal,
    private translateService: TranslateService
  ) {}

  ngOnInit(): void {
    this.selectedLang = localStorage.getItem("selectedLanguage");
    this.getSchedule();
    this.slotHours = this.getHours();
  }

  getSchedule() {
    this.appointmentService.getUserAppoitment(this.userId).subscribe({
      next: (res: any) => {
        if (res && res.data) {
          this.userSchedule = res.data;
        } else {
          this.userSchedule.slotSchedule = [];
        }
        this.initializeEvents(this.userSchedule.slotSchedule);
      },
    });
  }

  private initializeEvents(slots) {
    let slot = slots.reverse().filter(
      (
        (set) => (f) =>
          !set.has(new Date(f.date).getTime()) &&
          set.add(new Date(f.date).getTime())
      )(new Set())
    );
    let array: CalendarEvent[] = [];
    for (let i = 0; i < slot.length; i++) {
      let event1 = {
        title: `${slot[i].startTime}-${slot[i].endTime}`,
        color: colors.yellow,
        start: new Date(slot[i].date),
        startTime: slot[i].startTime,
        endTime: slot[i].endTime,
        day: slot[i].day,
      };
      event1["isTimeOver"] = event1.start < new Date();
      array.push(event1);
    }
    array.sort((a, b) => a.start.getTime() - b.start.getTime());
    this.events = Object.assign([], array);
  }

  getHours() {
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
    return hours;
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
    this.clear();
    this.selectedDays = [];
    this.modal.open(this.modalContent);
  }

  set(type) {
    this.errorMsg = null;
    if (type.day === "All Days") {
      this.type = "month";
      this.weekDays.forEach((element) =>
        type.checked === true
          ? (element.checked = true)
          : (element.checked = false)
      );
      this.weekends.forEach((element) =>
        type.checked === true
          ? (element.checked = true)
          : (element.checked = false)
      );
    } else if (type.day === "Week Day") {
      this.type = "week";
      this.weekDays.forEach((element) =>
        type.checked === true
          ? (element.checked = true)
          : (element.checked = false)
      );
    } else {
      this.type = "week";
    }
    this.selectedDays = this.weekDays
      .filter((day) => day.checked)
      .concat(this.weekends.filter((day) => day.checked));
  }

  getSlotSchedule(selectedDays) {
    let schedules = [];
    const start = moment(this.viewDate).startOf("month");
    const end = moment(this.viewDate).endOf("month");
    let currentDay = moment(start.format());
    const days = selectedDays.map((d) => d.day);
    while (currentDay < end) {
      const day = currentDay.format("dddd");
      if (days.includes(day)) {
        schedules.push({
          day,
          endTime: this.scheduleForm.value.endTime,
          startTime: this.scheduleForm.value.startTime,
          date: currentDay.format(),
        });
      }
      currentDay.add(1, "day");
    }
    let existingToKeep = [];
    this.userSchedule.slotSchedule.forEach((s) => {
      const date = moment(s.date);
      if (!date.isSame(start) && !date.isBetween(start, end)) {
        existingToKeep.push(s);
      }
    });
    let current = existingToKeep.concat(schedules);
    return current;
  }

  submit() {
    if (this.validateTimeSlots(this.scheduleForm.value)) {
      if (this.selectedDays.length > 0) {
        const speciality = this.getSpeciality();
        let body = this.getJson(speciality);
        this.saveSchedule(body);
        this.modal.dismissAll();
        this.errorMsg = null;
      } else {
        this.error("Select Day Message");
      }
    } else {
      this.error("Check Time Message");
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
    console.log("body", body);
    this.appointmentService.updateOrCreateAppointment(body).subscribe({
      next: (res: any) => {
        if (res.status) {
          this.userSchedule = body;
          this.initializeEvents(body.slotSchedule);
          this.translationService.getTranslation(res.message);
        }
      },
    });
  }

  private getJson(speciality: any) {
    return {
      speciality,
      type: this.type,
      userUuid: this.userId,
      slotDays: this.selectedDays.map((d) => d.day).join("||"),
      slotSchedule: this.getSlotSchedule(this.selectedDays),
      drName: this.drName,
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
  }

  closeOpenMonthViewDay(type?) {
    this.getSchedule();
  }

  dayClicked({ date, events }: { date: Date; events: CalendarEvent[] }): void {
    if (events.length !== 0) {
      this.modalData = { date, events };
      this.modal.open(this.schedule);
    }
  }

  update(selectedDay, operation) {
    let array = this.userSchedule.slotSchedule;
    array.forEach((element, index) => {
      if (
        operation === "cancel" &&
        new Date(element.date).getTime() ===
          new Date(selectedDay.start).getTime()
      ) {
        array.splice(index, 1);
      }
      if (
        operation === "update" &&
        new Date(element.date).getTime() ===
          new Date(selectedDay.start).getTime()
      ) {
        element.startTime = selectedDay.startTime;
        element.endTime = selectedDay.endTime;
      }
    });
    this.userSchedule.slotSchedule = array;
    let body = {
      speciality: this.userSchedule.speciality,
      type: this.userSchedule.type,
      userUuid: this.userSchedule.userUuid,
      slotDays: this.userSchedule.slotDays,
      slotSchedule: this.userSchedule.slotSchedule,
      drName: this.userSchedule.drName,
    };
    this.saveSchedule(body);
  }

  private error(msg) {
    this.translateService.get(`messages.${msg}`).subscribe((res: string) => {
      this.errorMsg = res;
    });
  }
}
