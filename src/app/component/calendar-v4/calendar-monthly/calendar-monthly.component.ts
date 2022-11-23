import { Component, OnInit } from '@angular/core';
import * as moment from 'moment';

@Component({
  selector: 'app-calendar-monthly',
  templateUrl: './calendar-monthly.component.html',
  styleUrls: ['./calendar-monthly.component.scss']
})
export class CalendarMonthlyComponent implements OnInit {
  calendar: any = [];
  hoursOffSlotsObj = {};

  weekDay = [
    { day: 'MON', date: 4, isCurrentDay: false, isDayOff: false },
    { day: 'TUE', date: 5, isCurrentDay: true, isDayOff: false },
    { day: 'WED', date: 6, isCurrentDay: false, isDayOff: false },
    { day: 'THU', date: 7, isCurrentDay: false, isDayOff: false },
    { day: 'FRI', date: 8, isCurrentDay: false, isDayOff: false },
    { day: 'SAT', date: 9, isCurrentDay: false, isDayOff: true },
    { day: 'SUN', date: 10, isCurrentDay: false, isDayOff: true },
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

  hoursOffSlots = [
    { startTime: '1:00 pm', date: 4 },
    { startTime: '1:00 pm', date: 5 },
    { startTime: '1:00 pm', date: 6 },
    { startTime: '1:00 pm', date: 7 },
    { startTime: '1:00 pm', date: 8 },
    { startTime: '1:30 pm', date: 4 },
    { startTime: '1:30 pm', date: 5 },
    { startTime: '1:30 pm', date: 7 },
    { startTime: '1:30 pm', date: 8 },
  ];

  constructor() { }

  ngOnInit(): void {
    this.setCalendar();
  }

  /**
   * generates a calendar dynamically
   */
  setCalendar(offWeekDays = ['Sat', 'Sun']) {
    const calendar = [];
    const today = moment();
    const startDay = today.clone().startOf('month').startOf('isoWeek');
    const endDay = today.clone().endOf('month').endOf('isoWeek');

    let date = startDay.clone().subtract(1, 'day');

    while (date.isBefore(endDay, 'day')) {
      calendar.push({
        days: Array(7).fill(0).map(() => {
          let newDate: any = date.add(1, 'day').clone();
          newDate.isWeekDayOff = !!offWeekDays.includes(newDate.format('ddd'));
          newDate.isToday = this.today(newDate);
          console.log('newDate.isToday: ', newDate.isToday);

          return newDate;
        }),
      });
    }

    this.calendar = calendar;
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
      const date = Number(day.format('D'));

      return date === Number(moment().format('D'));
    } else {
      return false;
    }
  }

}
