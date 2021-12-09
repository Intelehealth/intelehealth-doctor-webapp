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
export class AppointmentComponent implements OnInit, AfterViewInit {
  @ViewChild("anchorTh") anchorTh: ElementRef;
  days = [];
  slotHours = [];
  scheduleForm: FormGroup;
  thTdWidth = 50;
  weekDays: any = [
    { day: "Monday", startTime: null, endTime: null },
    { day: "Tuesday", startTime: null, endTime: null },
    { day: "Wednesday", startTime: null, endTime: null },
    { day: "Thursday", startTime: null, endTime: null },
    { day: "Friday", startTime: null, endTime: null },
    { day: "Saturday", startTime: null, endTime: null },
    { day: "Sunday", startTime: null, endTime: null },
  ];

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

  ngOnInit(): void {}

  ngAfterViewInit() {
    this.setCalenderBlockWidth();
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

  @HostListener("window:resize", ["$event"])
  setCalenderBlockWidth() {
    const { nativeElement: th } = this.anchorTh;
    this.thTdWidth = Math.round(th.getBoundingClientRect().width) - 30;
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

  saveSchedule() {
    console.log(this.val, this.slotTimes);
    this.appointmentService.updateOrCreateAppointment({}).subscribe({
      next: (res: any) => {
        console.log("res: ", res);
        if (res.status) {
          this.toast({ message: res.message });
        }
      },
    });
  }
}
