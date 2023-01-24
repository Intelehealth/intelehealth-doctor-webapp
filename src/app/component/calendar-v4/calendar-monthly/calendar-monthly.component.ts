import { Component, EventEmitter, Input, OnInit, Output, SimpleChanges } from '@angular/core';
import * as moment from 'moment';

class Appointment {
  id: number
  startTime: string
  endTime: string
  patientName: string
  gender: string
  age: string
  healthWorker: string
  hwAge: string
  hwGender: string
  type: string
  date: number
  month: number
  openMrsId: string
  patientId: string
  visitId:string;
  createdAt: Date
  appointmentDate: Date
  speciality: string
}

@Component({
  selector: 'app-calendar-monthly',
  templateUrl: './calendar-monthly.component.html',
  styleUrls: ['./calendar-monthly.component.scss']
})
export class CalendarMonthlyComponent implements OnInit {
  @Input() data: any;
  @Input() selectedDate: any;
  @Output() openModal = new EventEmitter();
  calendar: any = [];
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

  availableSlots = [
    {
      startTime: '9:00 am',
      endTime: '9:30 am',
      patientName: 'Muskan Kala',
      gender: 'F',
      age: '32',
      healthWorker: 'Kshitij Kaushik',
      hwAge: '28',
      hwGender: 'M',
      type: 'followUp',
      isCurrentDay: true,
      date: 2,
      month: 11
    },
    {
      startTime: '11:00 am',
      endTime: '11:30 am',
      patientName: 'Muskan Kala',
      gender: 'F',
      age: '32',
      healthWorker: 'Kshitij Kaushik',
      hwAge: '28',
      hwGender: 'M',
      date: 3,
      month: 11,
      type: 'appointment'
    },
    {
      startTime: '1:00 pm',
      endTime: '1:30 am',
      patientName: 'Muskan Kala',
      gender: 'F',
      age: '32',
      healthWorker: 'Kshitij Kaushik',
      hwAge: '28',
      hwGender: 'M',
      date: 3,
      month: 11,
      type: 'appointment'
    }
  ];

  hoursOffSlots = [];

  constructor() { }

  ngOnInit(): void {
    this.setCalendar(this.selectedDate.startOfMonth);
    this.setAppointments();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if(changes?.selectedDate?.currentValue.startOfMonth )
     this.setCalendar(changes?.selectedDate?.currentValue.startOfMonth);
     if (changes?.data?.currentValue) {
      this.setAppointments();
    }
  }
  
  
  /**
   * generates a calendar dynamically
   */
  setCalendar(selectedDay?, offWeekDays = []) {
    const calendar = [];
    const today = moment(selectedDay);
    const startDay = today.clone().startOf('month').startOf('isoWeek');
    const endDay = today.clone().endOf('month').endOf('isoWeek');
    let date = startDay.clone().subtract(1, 'day');

    while (date.isBefore(endDay, 'day')) {
      calendar.push({
        days: Array(7).fill(0).map(() => {
          let newDate: any = date.add(1, 'day').clone();
          newDate.isWeekDayOff = !!offWeekDays.includes(newDate.format('ddd'));
          newDate.isToday = this.today(newDate);
          return newDate;
        }),
      });
    }
    this.calendar = calendar;
  }

  setAppointments() {
    this.availableSlots = [];
   this.data.forEach(d1 => {
     let appointment = new Appointment;
     appointment.id = d1?.id;
     appointment.startTime = d1?.slotTime.toLowerCase();
     appointment.endTime = moment(d1?.slotTime,"LT").add(d1.slotDuration,'minutes').format('LT').toLocaleLowerCase();
     appointment.patientName = d1?.patientName;
     appointment.gender= 'F';
     appointment.age= '32';
     appointment.healthWorker = d1?.hwUUID;
     appointment.openMrsId = d1?.openMrsId;
     appointment.hwAge ='28';
     appointment.hwGender = 'M';
     appointment.type = 'appointment';
     appointment.date = Number(moment(d1?.slotJsDate,'YYYY-MM-DD HH:mm:ss').format("D"));
     appointment.month = Number(moment(d1?.slotJsDate,'YYYY-MM-DD HH:mm:ss').format("M"));
     appointment.patientId = d1?.patientId;
     appointment.visitId = d1?.visitUuid;
     appointment.createdAt = d1?.createdAt;
     appointment.appointmentDate = d1?.slotJsDate;
     appointment.speciality = d1?.speciality;
     this.availableSlots.push(appointment);
   });
 }

  slot(day) {
    if (day?.format) {
      const date = Number(day.format('D'));
      const month = Number(day.format('M'));

      const slot = this.availableSlots.find(slot => slot?.date === date && slot?.month === month);
      const slots = this.availableSlots.filter(slot => slot?.date === date && slot?.month === month);
      if (slot) {
        return { ...slot, slots };
      } else {
        return false;
      }
    } else {
      return false;
    }
  }

  offSlot(date, time) {
    let isDayOff = null;
    const slot = this.hoursOffSlots.find(slot => slot?.date === date && slot?.startTime === time);

    if (!slot) isDayOff = this.weekDay.find(day => day?.date === date)?.isDayOff;

    if (slot) {
      return slot;
    } else if (isDayOff) {
      return 'day';
    } else {
      return false;
    }
  }

  today(day) {
    if (day?.format) {
      return moment(day).format('YYYY-DD-MM')===((moment().format('YYYY-DD-MM')))
    } else {
      return false;
    }
  }

  handleClick(slot) {
    slot["modal"] = "details";
    this.openModal.emit(slot)
  }
}
