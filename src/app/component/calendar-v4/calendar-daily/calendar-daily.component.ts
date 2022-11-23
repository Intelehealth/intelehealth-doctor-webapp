import { Component, OnInit } from '@angular/core';
import * as moment from 'moment';

@Component({
  selector: 'app-calendar-daily',
  templateUrl: './calendar-daily.component.html',
  styleUrls: ['./calendar-daily.component.scss']
})
export class CalendarDailyComponent implements OnInit {
  timings: any = [];
  availableSlotsObj = {};
  hoursOffSlotsObj = {};
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
      type: 'followUp'
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
      type: 'appointment'
    },
    {
      startTime: '1:00 am',
      endTime: '1:30 am',
      patientName: 'Muskan Kala',
      gender: 'F',
      age: '32',
      healthWorker: 'Kshitij Kaushik',
      hwAge: '28',
      hwGender: 'M',
      type: 'appointment'
    }
  ];

  hoursOffSlots = [
    "3:00 pm",
    "3:30 pm",
    "4:00 pm",
    "4:30 pm",
    "5:00 pm",
    "5:30 pm",
    "6:00 pm",
    "6:30 pm",
    "7:00 pm"
  ]

  constructor() { }

  ngOnInit(): void {
    this.setTimings();
    this.setAvailableTimeSlotObject()
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

  setAvailableTimeSlotObject() {
    //@todo - fetch available time slots and set in object
    this.availableSlotsObj = {};
    this.hoursOffSlotsObj = {};

    this.availableSlots.forEach(slot => {
      this.availableSlotsObj[slot.startTime] = slot;
    });

    this.hoursOffSlots.forEach(slot => {
      this.hoursOffSlotsObj[slot] = slot;
    });
  }

  slot(time) {
    return this.availableSlotsObj[time];
  }

  offSlot(time) {
    return this.hoursOffSlotsObj[time];
  }
}
