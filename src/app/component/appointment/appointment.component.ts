import {
  Component,
  OnInit,
  TemplateRef,
  ViewChild,
} from "@angular/core";
import { FormBuilder, FormControl, FormGroup, Validators } from "@angular/forms";
import { MatSnackBar } from "@angular/material/snack-bar";
import { NgbModal } from "@ng-bootstrap/ng-bootstrap";
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
  @ViewChild('modalContent') modalContent: TemplateRef<any>;
  @ViewChild('schedule') schedule: TemplateRef<any>;
  view: CalendarView = CalendarView.Month;
  CalendarView = CalendarView;
  viewDate: Date = new Date();
  events: CalendarEvent[];
  activeDayIsOpen: boolean = false;
  selectedLang: string = 'en';
  days = [];
  scheduleForm = new FormGroup({
    selectedDay: new FormControl('',[Validators.required]),
    startTime: new FormControl('', [Validators.required]),
    endTime: new FormControl('', [Validators.required])
  });
  userSchedule: any = null;
  type: string = 'month';
  types: any = [
    { day: "All Days", startTime: null, endTime: null, checked: false },
    { day: "Week Day", startTime: null, endTime: null, checked: false }
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
    { day: "Sunday", startTime: null, endTime: null, checked: false }
  ]; 
  slotHours = [];
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
  ) {}

  ngOnInit(): void {
    this.selectedLang = localStorage.getItem('selectedLanguage');
    this.getSchedule();
    this.slotHours = this.getHours();
  }

  getSchedule() {
    this.appointmentService.getUserAppoitment(this.userId).subscribe({
      next: (res: any) => {
        this.userSchedule = res.data.slotSchedule;
        this.initializeEvents(res.data.slotSchedule)
      },
    });
  }

  private initializeEvents(slot) {
    let array: CalendarEvent[] = [];
    for (let i = 0; i < slot.length; i++) {
      let event1 = {
        title: `${slot[i].startTime}-${slot[i].endTime}`,
        color: colors.yellow,
        start: new Date(slot[i].date),
        startTime: slot[i].startTime,
        endTime: slot[i].endTime,
        day:slot[i].day
      };
      event1["isTimeOver"] = event1.start < new Date();
      array.push(event1);
    }
    array.sort((a, b) => a.start.getTime() - b.start.getTime());
    this.events = Object.assign([], array);
    console.log("events", this.events);
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
      return false
    } else if (moment(t1.startTime, ["h:mm A"]).format("HH:mm:ss") > moment(t1.endTime, ["h:mm A"]).format("HH:mm:ss")) {
      return false
    }
    return true;
  }

  addSchedule() {
    this.modal.open(this.modalContent);
  }

  set(type) {
    console.log(type)
    if (type.day === "All Days") {
      this.type = 'month';
      this.weekDays.forEach(element => type.checked === true ? (element.checked = true) : (element.checked = false));
    } else if (type.day === "Week Day") {
      this.type = 'week';
      let array = [];
      for (let element of this.weekDays) {
        if (type.checked === true && ['Week Day', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'].includes(element.day)) {
          element.checked = true;
        } else {
          element.checked = false;
        }
        array.push(element);
      };
      this.weekDays = array;
    } else {
      this.type = 'week';
    }
  }

  getSlotSchedule(selectedDays) {
    let schedules = [];
    for (let d of selectedDays) {
      var day = moment(this.viewDate).startOf('month').day(d.day);
      if (day.date() > 7) day.add(7, 'd');
      var month = day.month();
      while (month === day.month()) {
        day.add(7, 'd');
        schedules.push({
          day:d.day,
          endTime:this.scheduleForm.value.endTime,
          startTime:this.scheduleForm.value.startTime,
          date: day.toString()
        })
      }
    }
    return schedules;
  }

  submit() {
    if (this.validateTimeSlots(this.scheduleForm.value)) {
      const selectedDays = this.weekDays.filter((day) => day.checked);
      const speciality = this.getSpeciality();
      let body = this.getJson(speciality, selectedDays)
      this.appointmentService
        .updateOrCreateAppointment(body).subscribe({
          next: (res: any) => {
            if (res.status) {
              this.initializeEvents(body.slotSchedule)
              this.translationService.getTranslation(res.message);
            }
          },
        });
      console.log(selectedDays, body)
    } else {
      this.translationService.getTranslation('Check Time Message');
    }
    this.scheduleForm.reset();
  }

  private getJson(speciality: any, selectedDays: any) {
    return {
      speciality,
      type: this.type,
      userUuid: this.userId,
      slotDays: selectedDays.map((d) => d.day).join("||"),
      slotSchedule: this.getSlotSchedule(selectedDays),
      drName: this.drName,
    };
  }

  clear() {
    let array = [];
    this.weekDays.forEach(element => {
      element.checked = false;
      array.push(element);
    });
    this.weekDays = array;
    console.log(array)
  }

  closeOpenMonthViewDay() {
    this.getSchedule();
  }

  dayClicked({ date, events }: { date: Date; events: CalendarEvent[] }): void {
    if (events.length !== 0) {
    this.modalData = { date, events };
    this.modal.open(this.schedule);
    }
  }

  cancel(day) {
    console.log(day,this.userSchedule)
  }

  update(day) {
    console.log(day)
  }

}
