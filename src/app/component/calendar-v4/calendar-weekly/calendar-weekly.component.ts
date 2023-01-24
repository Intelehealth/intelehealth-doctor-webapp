import { Component, EventEmitter, Input, OnInit, Output, SimpleChanges } from '@angular/core';
import * as moment from 'moment';

class Appointment {
  id:number
  startTime: string
  endTime: string
  patientName: string
  gender: string
  age: string
  healthWorker: string
  hwAge: string
  hwGender: string
  openMrsId: string
  type: string
  isCurrentDay: boolean
  date: Number
  patientId: string
  visitId:string;
  createdAt: Date
  appointmentDate: Date
  speciality: string
}

@Component({
  selector: 'app-calendar-weekly',
  templateUrl: './calendar-weekly.component.html',
  styleUrls: ['./calendar-weekly.component.scss']
})
export class CalendarWeeklyComponent implements OnInit {
  @Input() data: any;
  @Input() selectedDate: any;
  @Output() openModal = new EventEmitter();
  timings: any = [];
  hoursOffSlotsObj = {};

  weekDay = [
    { day: 'SUN', date: 10, isCurrentDay: false, isDayOff: false },
    { day: 'MON', date: 4, isCurrentDay: false, isDayOff: false },
    { day: 'TUE', date: 5, isCurrentDay: false, isDayOff: false },
    { day: 'WED', date: 6, isCurrentDay: false, isDayOff: false },
    { day: 'THU', date: 7, isCurrentDay: false, isDayOff: false },
    { day: 'FRI', date: 8, isCurrentDay: false, isDayOff: false },
    { day: 'SAT', date: 9, isCurrentDay: false, isDayOff: false },
  ];
  availableSlots = [];

  hoursOffSlots = [];

  constructor() { }

  ngOnInit(): void {
    this.setTimings();
    this.setAppointments();
    this.setCalendar(this.selectedDate.startOfMonth, this.selectedDate.endOfMonth);
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes?.selectedDate?.currentValue.startOfMonth)
      this.setCalendar(changes?.selectedDate?.currentValue.startOfMonth, changes?.selectedDate?.currentValue.endOfMonth);
    if (changes?.data?.currentValue) {
      this.setAppointments();
    }
  }

  setCalendar(start, end) {
    let days = [];
    const startDay = moment(start).startOf('week');
    const endDay = moment(end).endOf('week');
    let date = startDay.clone().subtract(1, 'day');
    while (date.isBefore(endDay, 'day')) {
      days = Array(7).fill(0).map(() => {
        let newDate: any = date.add(1, 'day').clone();
        return newDate;
      });
    }
    days.forEach(currentDay => {
      this.weekDay.forEach(day => {
        if (day.day === currentDay.format("ddd").toUpperCase()) {
          day.date = Number(currentDay.format("D"));
          day.isCurrentDay = false;
        }
      });
    })
    this.weekDay.forEach(day => {
      if (day.date === Number(moment().format("D")))
        day.isCurrentDay = true;
    });
  }
  /**
   * generates a day timing dynamically
   */
  setTimings() {
    const timings = [];
    let momentTime = moment({ hour: 9, minute: 0 });
    for (let idx = 0; idx <= 20; idx++) {
      timings.push(momentTime.format('h:mm a'));
      momentTime.add(30, 'minutes');
    }
    this.timings = timings;
  }

  setAppointments() {
    this.availableSlots = [];
    this.data.forEach(d1 => {
      let appointment = new Appointment;
      appointment.id = d1?.id;
      appointment.startTime = d1?.slotTime.toLowerCase();
      appointment.endTime = moment(d1?.slotTime, "LT").add(d1.slotDuration, 'minutes').format('LT').toLocaleLowerCase();
      appointment.patientName = d1?.patientName;
      appointment.gender = 'F';
      appointment.age = '32';
      appointment.openMrsId = d1?.openMrsId;
      appointment.healthWorker = d1?.hwUUID;
      appointment.hwAge = '28';
      appointment.hwGender = 'M';
      appointment.type = 'appointment';
      appointment.date = Number(moment(d1?.slotJsDate, 'YYYY-MM-DD HH:mm:ss').format("D"));
      appointment.patientId = d1?.patientId;
      appointment.visitId = d1?.visitUuid;
      appointment.createdAt = d1?.createdAt;
      appointment.appointmentDate = d1?.slotJsDate;
      appointment.speciality = d1?.speciality;
      this.availableSlots.push(appointment);
    });
  }

  slot(date, time) {
    const slot = this.availableSlots.filter(slot => slot.date === date && slot.startTime === time);
    if (slot.length > 0) {
      return slot[0];
    } else {
      return false;
    }
  }

  offSlot(date, time) {
    let isDayOff = null;
    const slot = this.hoursOffSlots.find(slot => slot?.appointmenDate === date && slot?.startTime === time);

    if (!slot) isDayOff = this.weekDay.find(day => day?.date === date)?.isDayOff;

    if (slot) {
      return slot;
    } else if (isDayOff) {
      return 'day';
    } else {
      return false;
    }
  }

  handleClick(slot) {
    slot["modal"] = "details";
    this.openModal.emit(slot)
  }
}
