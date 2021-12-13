import {
  AfterViewInit,
  Component,
  ElementRef,
  HostListener,
  OnInit,
  ViewChild,
} from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { MatSnackBar } from "@angular/material/snack-bar";
import * as moment from "moment";
import { AppointmentService } from "src/app/services/appointment.service";

@Component({
  selector: "app-appointment",
  templateUrl: "./appointment.component.html",
  styleUrls: ["./appointment.component.css"],
})
export class AppointmentComponent implements OnInit {
  days = [];
  scheduleForm: FormGroup;
  thTdWidth = 50;
  userSchedule: any = null;
  weekDays: any = [
    { day: "Monday", startTime: null, endTime: null },
    { day: "Tuesday", startTime: null, endTime: null },
    { day: "Wednesday", startTime: null, endTime: null },
    { day: "Thursday", startTime: null, endTime: null },
    { day: "Friday", startTime: null, endTime: null },
    { day: "Saturday", startTime: null, endTime: null },
    { day: "Sunday", startTime: null, endTime: null },
  ];
  slotHours = [];

  constructor(
    private fb: FormBuilder,
    private appointmentService: AppointmentService,
    private snackbar: MatSnackBar
  ) {
    this.days = this.getWeekDays();
    this.scheduleForm = this.fb.group({
      selectedDays: [["Friday"], [Validators.required]],
    });
    this.slotHours = this.getHours();
  }

  ngOnInit(): void {
    this.getSchedule();
  }

  getSchedule() {
    this.appointmentService.getUserAppoitment(this.userId).subscribe({
      next: (res: any) => {
        this.userSchedule = res.data;
        this.setSchedule();
      },
    });
  }

  setSchedule() {
    if (!this.userSchedule) {
      return;
    }
    this.ctl.selectedDays.setValue(
      this.userSchedule.slotSchedule.map((d) => d.day)
    );
    this.userSchedule.slotSchedule.forEach((day) => {
      this.weekDays.find((d) => d.day === day.day).startTime = day.startTime;
      this.weekDays.find((d) => d.day === day.day).endTime = day.endTime;
    });
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

  get todayDay() {
    return moment().format("dddd");
  }

  get ctl() {
    return this.scheduleForm.controls;
  }

  get val() {
    return this.scheduleForm.value;
  }

  get slotTimes() {
    return this.weekDays.filter((w) => this.val.selectedDays.includes(w.day));
  }

  getWeekDays() {
    return Array.apply(null, Array(7)).map(function (_, i) {
      return moment(i, "e")
        .startOf("week")
        .isoWeekday(i + 1)
        .format("dddd");
    });
  }

  daysChange() {
    console.log("this.val: ", this.val);
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

  saveSchedule(userUuid?) {
    const speciality = this.getSpeciality();
    this.appointmentService
      .updateOrCreateAppointment({
        speciality,
        userUuid: userUuid ? userUuid : this.userId,
        slotDays: this.slotTimes.map((d) => d.day).join("||"),
        slotSchedule: this.slotTimes,
        drName: this.drName,
      })
      .subscribe({
        next: (res: any) => {
          console.log("res: ", res);
          if (res.status) {
            this.toast({ message: res.message });
          }
        },
      });
  }
}
