import { Component, OnInit, ViewChild } from "@angular/core";
import { MatDatepicker, MatDatepickerInputEvent } from "@angular/material/datepicker";
import * as moment from "moment";
import { AppointmentService } from "../services/appointment.service";

@Component({
  selector: "app-setup-calendar-v4",
  templateUrl: "./setup-calendar-v4.component.html",
  styleUrls: ["./setup-calendar-v4.component.scss"],
})
export class SetupCalendarV4Component implements OnInit {
  showAddMore = false; showSaveButton = false;
  minDate = new Date();
  startDate: Date;
  endDate: Date;
  monthNames = ["January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];
  values = [];
  type: string = "month";
  isCollapsed = false;
  months = [];
  selectedStartTime: any;
  timeList = [{ name: "9:00" }, { name: "10:00" }, { name: "11:00" }, { name: "12:00" }, { name: "1:00" }, { name: "2:00" },
  { name: "3:00" }, { name: "4:00" }, { name: "5:00" }, { name: "6:00" }, { name: "7:00" }, { name: "8:00" }];
  clockTimeAmPM = [{ name: "AM" }, { name: "PM" }];
  selectedStartAmPm: any;
  selectedEndAmPm: any;
  selectedEndTime: any;
  weekDaysList = [];
  selectedTiming: any;
  errorMsg: string;
  daysList = [
    { name: "Monday", checked: false },
    { name: "Tuesday", checked: false },
    { name: "Wednesday", checked: false },
    { name: "Thursday", checked: false },
    { name: "Friday", checked: false },
    { name: "Saturday", checked: false },
    { name: "Sunday", checked: false },
    { name: "Weekdays", checked: false },
    { name: "Weekends", checked: false }
  ];

  headers = [
    {
      name: "Start time",
      type: "string",
      key1: "startTime",
      key2: "startClocktime"
    },
    {
      name: "End time", type: "string",
      key1: "endTime",
      key2: "endClocktime"
    },
    { name: "Days", type: "remark", key1: "days" },
  ];

  data = [];

  showDays: boolean = false;
  userSchedule: any = Object;
  public CLOSE_ON_SELECTED = false;
  public init = new Date();
  public resetModel = new Date(0);
  public model = []; daysOff = [];
  @ViewChild('picker', { static: true }) _picker: MatDatepicker<Date>;

  constructor(private appointmentService: AppointmentService) { }

  ngOnInit(): void {
    this.getScheduledMonths();
  }

  get weekDays() {
    return this.weekDaysList.map((val) => val.slice(0, 3)).join();
  }

  removevalue(i) {
    this.values.splice(i, 1);
  }

  addvalue() {
    this.values.push({ value: "" });
  }

  onCheckboxChange(e, days) {
    if (!e.target.checked) {
      let element = this.weekDaysList.find((itm) => itm === days.name);
      this.weekDaysList.splice(this.weekDaysList.indexOf(element), 1);
      return;
    }
    if (days.name === "Weekdays") {
      for (let i = 0; i <= 4; i++) {
        this.weekDaysList.push(this.daysList[i].name);
      }
    } else if (days.name === "Weekends") {
      for (let i = 5; i <= 6; i++) {
        this.weekDaysList.push(this.daysList[i].name);
      }
    } else {
      this.weekDaysList.push(days.name);
    }
  }

  addTiming() {
    this.showAddMore = true;
    this.selectedStartTime = this.timeList[0];
    this.selectedEndTime = this.timeList[0];
    this.selectedStartAmPm = this.clockTimeAmPM[0];
    this.selectedEndAmPm = this.clockTimeAmPM[1];
    this.weekDaysList = [];
    this.errorMsg = null;
  }

  removeTiming() {
    if (this.data.length > 0)
      this.showAddMore = false;
    this.errorMsg = null;
  }

  addMonth() {
    if (this.months.length !== this.monthNames.length)
      this.months.push({ name: this.monthNames[(new Date()).getMonth() + this.months.length], year: new Date().getFullYear() });
  }

  getScheduledMonths() {
    this.appointmentService.getScheduledMonths(this.userId, new Date().getFullYear())
      .subscribe({
        next: (res: any) => {
          this.months = res.data;
          if (this.months.length === 0) {
            this.months.push({ name: this.monthNames[(new Date()).getMonth() + this.months.length], year: new Date().getFullYear() });
          }
          this.getSchedule(this.months[0].year, this.months[0].name);

        },
      });
  }

  getSchedule(
    year = moment(this.minDate).format("YYYY"),
    month = moment(this.minDate).format("MMMM")
  ) {
    this.appointmentService
      .getUserAppoitment(this.userId, year, month)
      .subscribe({
        next: (res: any) => {
          if (res && res.data) {
            this.userSchedule = res.data;
            this.setData(res.data);
          } else {
            this.addTiming();
            this.userSchedule = {
              slotSchedule: [],
            };
          }
        },
      });
  }

  getMonthDetails(month) {
    this.data = [];
    this.startDate = null;
    this.endDate = null;
    this.getSchedule(month.year, month.name);
  }

  save() {
    let startTime = this.selectedStartTime.name + " " + this.selectedStartAmPm.name;
    let endTime = this.selectedEndTime.name + " " + this.selectedEndAmPm.name;
    let selectedSlots = {
      startTime: startTime,
      endTime: endTime
    }
    if (this.validateTimeSlots(selectedSlots)) {
      if (this.weekDaysList.length > 0) {
        let body = this.getJson(selectedSlots);
        this.saveSchedule(body);
      } else {
        this.errorMsg = " Please select days";
      }
    } else {
      this.errorMsg = "Start time should be less than End time";
    }
  }

  deleteSlots(ids) {
    var remainingSlots = this.userSchedule.slotSchedule.filter((slot) =>
      !ids.includes(slot.id)
    );
    let body = this.getJson(remainingSlots, true);
    this.saveSchedule(body);
  }

  saveDaysOff() {
    let array1 = this.model.filter(val => !this.daysOff.includes(moment(val).format("YYYY-MM-DD HH:mm:ss")));
    let array3 = [];
    this.daysOff.concat(array1).forEach(arr => {
      array3.push(moment(arr).format("DD/MM/YYYY"));
    })

    let body = {
      userUuid: this.userId,
      daysOff: array3
    }
    this.appointmentService.updateDaysOff(body).subscribe({
      next: (res: any) => {
        if (res.status) {
          this.getDaysOff(array3);
          this.model = [];
        }
      },
    });
  }

  private setData(schedule) {
    if (!this.months.some(month => month.name === schedule.month)) {
      this.months.push({ name: schedule.month, year: schedule.year });
    }
    this.startDate = schedule.startDate;
    this.endDate = schedule.endDate;
    this.data = []
    schedule.slotSchedule.forEach((slot, i) => {
      let obj = {
        startTime: "",
        startClocktime: "",
        endTime: "",
        endClocktime: "",
        days: "",
        ids: []
      }
      obj.startTime = schedule.slotSchedule[i].startTime.split(" ")[0];
      obj.startClocktime = schedule.slotSchedule[i].startTime.split(" ")[1];
      obj.endTime = schedule.slotSchedule[i].endTime.split(" ")[0];
      obj.endClocktime = schedule.slotSchedule[i].endTime.split(" ")[1];
      obj.ids.push(schedule.slotSchedule[i].id);
      if (!this.data.some(el => el.startTime === obj.startTime && el.endTime === obj.endTime)) {
        this.data.push(obj);
      }
      this.data.forEach(d1 => {
        if (d1.startTime === obj.startTime && d1.endTime === obj.endTime) {
          d1.ids.push(schedule.slotSchedule[i].id);
          if (!d1.days.includes(schedule.slotSchedule[i].day.slice(0, 3)))
            d1.days = d1.days ? d1.days.concat(",", schedule.slotSchedule[i].day.slice(0, 3)) : schedule.slotSchedule[i].day.slice(0, 3);
        }
      })
    });
    this.getDaysOff(schedule.daysOff);
  }


  private getDaysOff(daysOff) {
    this.daysOff = [];
    daysOff.forEach(arr => {
      this.daysOff.push(moment(arr, "DD/MM/YYYY").format("YYYY-MM-DD HH:mm:ss"));
    });
  }

  private saveSchedule(body: {
    speciality: any;
    type: string;
    userUuid: any;
    slotDays: any;
    slotSchedule: any[];
    drName: any;
  }) {
    this.appointmentService.updateOrCreateAppointment(body).subscribe({
      next: (res: any) => {
        if (res.status) {
          this.getSchedule(moment(this.startDate).format("YYYY"),
            moment(this.startDate).format("MMMM"));
          this.errorMsg = null;
          this.showAddMore = false;
        }
      },
    });
  }

  private getJson(selectedSlots, flag?) {
    return {
      speciality: this.getSpeciality(),
      startDate: this.startDate,
      endDate: this.endDate,
      type: this.type,
      userUuid: this.userId,
      slotDays: this.weekDaysList.map((d) => d).join("||"),
      slotSchedule: flag ? selectedSlots : this.getSlotSchedule(this.weekDaysList, selectedSlots),
      drName: this.drName,
      year: moment(this.startDate).format("YYYY"),
      month: moment(this.startDate).format("MMMM"),
    };
  }

  private getSpeciality() {
    return JSON.parse(localStorage.provider).attributes.find((a) =>
      a.display.includes("specialization")
    ).value;
  }

  private validateTimeSlots(t1) {
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

  private get userId() {
    return JSON.parse(localStorage.user).uuid;
  }

  private get drName() {
    return (
      JSON.parse(localStorage.user)?.person?.display ||
      JSON.parse(localStorage.user)?.display
    );
  }

  private getSlotSchedule(selectedDays, selectedSlots) {
    let schedules = [];
    const start = moment(this.startDate);
    const end = moment(this.endDate);
    const todaysDate = moment(moment().format("LL"), "LL");
    let currentDay = moment(start.format());
    const days = selectedDays.map((d) => d);
    while (currentDay < end) {
      if (currentDay > todaysDate) {
        const day = currentDay.format("dddd");
        if (days.includes(day) && !this.daysOff.includes(moment(currentDay).format("YYYY-MM-DD HH:mm:ss"))) {
          schedules.push({
            day,
            endTime: selectedSlots.endTime,
            startTime: selectedSlots.startTime,
            date: currentDay.format('YYYY-MM-DD HH:mm:ss'),
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
      if (!this.weekDaysList.includes(s.day)
      ) {
        existingToKeep.push(slotToPush);
      }
    });
    return existingToKeep.concat(schedules);
  }

  getUniqueId() {
    return Math.random().toString(36).substr(2, 9);
  };

  public dateClass = (date: Date) => {
    if (this._findDate(date) !== -1) {
      return ['selected'];
    }
    return [];
  }

  public dateChanged(event: MatDatepickerInputEvent<Date>): void {
    if (event.value) {
      const date = event.value;
      const index = this._findDate(date);
      if (index === -1) {
        this.model.push(date);
      } else {
        this.model.splice(index, 1)
      }
      this.resetModel = new Date(0);
      if (!this.CLOSE_ON_SELECTED) {
        const closeFn = this._picker.close;
        this._picker.close = () => { };
        this._picker['_popupComponentRef']?.instance._calendar.monthView._createWeekCells()
        setTimeout(() => {
          this._picker.close = closeFn;
        });
      }
      this.showSaveButton = true;
    }
  }

  public remove(index: number): void {
    this.daysOff.splice(index, 1)
    let body = {
      userUuid: this.userId,
      daysOff: this.daysOff
    }
    this.appointmentService.updateDaysOff(body).subscribe({
      next: (res: any) => {
        if (res.status) {
          this.daysOff = this.daysOff;
        }
      },
    });
  }

  private _findDate(date: Date): number {
    return this.model.map((m) => +m).indexOf(+date);
  }
}
