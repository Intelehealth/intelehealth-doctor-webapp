import { Component, EventEmitter, Input, OnInit, Output, SimpleChanges } from '@angular/core';
import * as moment from 'moment';

class Appointment {
  id: number
  startTime: string
  endTime: string
  patientName: string
  patientPic: string
  gender: string
  age: string
  healthWorker: string
  hwAge: string
  hwGender: string
  type: string
  date: number
  month: number
  monthName: string;
  openMrsId: string
  patientId: string
  visitId:string;
  createdAt: Date
  appointmentDate: Date
  speciality: string
  year: string
}

@Component({
  selector: 'app-calendar-monthly',
  templateUrl: './calendar-monthly.component.html',
  styleUrls: ['./calendar-monthly.component.scss']
})
export class CalendarMonthlyComponent implements OnInit {
  @Input() data: any;
  @Input() selectedDate: any;
  @Input() daysOff;
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

  availableSlots = [];

  hoursOffSlots = [];

  constructor() { }

  ngOnInit(): void {
    this.setCalendar(this.selectedDate.startOfMonth);
    this.setAppointments();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if(changes?.selectedDate?.currentValue.startOfMonth)
     this.setCalendar(changes?.selectedDate?.currentValue.startOfMonth);
     if (changes?.data?.currentValue) {
      this.setAppointments();
    }  
    if(changes?.daysOff?.currentValue) 
    this.daysOff = changes?.daysOff?.currentValue;
  }
  
  
  /**
   * generates a calendar dynamically
   */
  setCalendar(selectedDay?, offWeekDays = this.daysOff) {
    const calendar = [];
    const today = moment(selectedDay);
    const startDay = today.clone().startOf('month').startOf('isoWeek');
    const endDay = today.clone().endOf('month').endOf('isoWeek');
    let date = startDay.clone().subtract(1, 'day');

    while (date.isBefore(endDay, 'day')) {
      calendar.push({
        days: Array(7).fill(0).map(() => {
          let newDate: any = date.add(1, 'day').clone();
          newDate.isWeekDayOff = offWeekDays?.includes(newDate.format("DD/MM/YYYY"));
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
     appointment.patientPic = d1?.patientPic;
     appointment.gender= d1?.patientGender;
     appointment.age= d1?.patientAge;
     appointment.openMrsId = d1?.openMrsId;
     appointment.healthWorker = d1?.hwName;
     appointment.hwAge =d1?.hwAge;
     appointment.hwGender = d1?.hwGender;
     appointment.type = d1?.type ? d1?.type :'appointment';
     appointment.date = Number(moment(d1?.slotJsDate,'YYYY-MM-DD HH:mm:ss').format("D"));
     appointment.month = Number(moment(d1?.slotJsDate,'YYYY-MM-DD HH:mm:ss').format("M"));
     appointment.monthName = moment(d1?.slotJsDate,'YYYY-MM-DD HH:mm:ss').format("MMMM");
     appointment.year = moment(d1?.slotJsDate,'YYYY-MM-DD HH:mm:ss').format("Y");
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
