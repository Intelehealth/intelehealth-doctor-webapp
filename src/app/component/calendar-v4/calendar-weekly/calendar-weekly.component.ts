import { Component, OnInit } from '@angular/core';
import * as moment from 'moment';

@Component({
  selector: 'app-calendar-weekly',
  templateUrl: './calendar-weekly.component.html',
  styleUrls: ['./calendar-weekly.component.scss']
})
export class CalendarWeeklyComponent implements OnInit {
  timings: any = [];
  hoursOffSlotsObj = {};

  weekDay = [
    { day: 'MON', date: 4, isCurrentDay: false, isDayOff: false },
    { day: 'TUE', date: 5, isCurrentDay: true, isDayOff: false },
    { day: 'WED', date: 6, isCurrentDay: false, isDayOff: false },
    { day: 'THU', date: 7, isCurrentDay: false, isDayOff: false },
    { day: 'FRI', date: 8, isCurrentDay: false, isDayOff: false },
    { day: 'SAT', date: 9, isCurrentDay: false, isDayOff: true },
    { day: 'SUN', date: 10, isCurrentDay: false, isDayOff: true },
  ]

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
      date: 5
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
      date: 6,
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
      date: 6,
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
  ]

  constructor() { }

  ngOnInit(): void {
    this.setTimings();
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

  slot(date, time) {
    const slot = this.availableSlots.find(slot => slot?.date === date && slot?.startTime === time)
    if (slot) {
      return slot;
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

}
