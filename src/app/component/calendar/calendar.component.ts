import { Component, OnInit } from "@angular/core";
import * as moment from "moment";
import { AppointmentService } from "src/app/services/appointment.service";

@Component({
  selector: "app-calendar",
  templateUrl: "./calendar.component.html",
  styleUrls: ["./calendar.component.css"],
})
export class CalendarComponent implements OnInit {
  weekDays: any = [];
  slotHours = [];
  drSlots = [];
  fromDate;
  toDate;

  constructor(private appointmentService: AppointmentService) {
    this.fromDate = moment().format("DD/MM/YYYY");
    this.toDate = moment().add(6, "days").format("DD/MM/YYYY");

    this.weekDays = this.getWeekdays();
    this.slotHours = this.getHours();
  }

  getWeekdays() {
    const date = moment();
    const days = Array.from({
      length: 7,
    }).map((_) => {
      const data = {
        day: date.format("dddd"),
        date: date.format("DD/MM/YYYY"),
      };
      date.add(1, "days");
      return data;
    });
    return days;
  }

  ngOnInit(): void {
    this.getDrSlots();
  }

  getDrSlots() {
    this.appointmentService
      .getUserSlots(this.userId, this.fromDate, this.toDate)
      .subscribe({
        next: (res: any) => {
          this.drSlots = res.data;
          console.log("this.drSlots: ", this.drSlots);
        },
      });
  }

  get userId() {
    return JSON.parse(localStorage.user).uuid;
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

  get todayDay() {
    return moment().format("dddd");
  }

  appointment(day, time) {
    const _day = day.day;
    const _date = day.date;
    const halfTime = moment(time, "LT").add(30, "minutes").format("LT");
    //console.log("halfTime: ", halfTime);
    day.appointment = this.drSlots
      .filter(
        (d) =>
          d.slotDay === _day &&
          (d.slotTime === time || d.slotTime === halfTime) &&
          d.slotDate === _date
      )
      .map((d) => ({
        title: `${d.patientName}(${d.openMrsId}) ${d.slotDuration} ${d.slotDurationUnit}`,
        value: d.openMrsId,
        patientId: d.patientId,
        visitUuid: d.visitUuid
      }));
    if (day.appointment.length)
      console.log("day.appointment: ", day.appointment);
  }
}
