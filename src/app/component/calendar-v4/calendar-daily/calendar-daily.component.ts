import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import * as moment from 'moment';
import { environment } from 'src/environments/environment';

class Appointment {
  id: number
  startTime: string
  endTime: string
  openMrsId: string
  patientName: string
  patientPic: string
  gender:string
  age: string
  healthWorker: string
  hwPic: string
  hwAge: string
  hwGender: string
  type: string
  patientId: string
  visitId:string;
  createdAt: Date
  appointmentDate: Date
  speciality: string
}

@Component({
  selector: 'app-calendar-daily',
  templateUrl: './calendar-daily.component.html',
  styleUrls: ['./calendar-daily.component.scss']
})
export class CalendarDailyComponent implements OnInit,OnChanges {
  @Input() data: any;
  @Output() openModal = new EventEmitter();

  timings: any = [];
  availableSlotsObj = {};
  hoursOffSlotsObj = {};
  availableSlots = [];
  hoursOffSlots = []
  baseUrl = environment.baseURL;
  constructor() { }

  ngOnInit(): void {
    this.setTimings();
    this.setAppointments();
  }


  ngOnChanges(changes: SimpleChanges): void {
    if(changes?.data?.currentValue) {
      this.setAppointments();
   }
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

    this.timings.forEach(time => {
      let availableTime = this.availableSlots.filter(slot => time === slot.startTime);
      if(availableTime.length === 0) {
        this.hoursOffSlots.push(time);
      }
    });
 
    this.hoursOffSlots.forEach(slot => {
      this.hoursOffSlotsObj[slot] = slot;
    });
    console.log("availableSlots", this.availableSlots)
  }

  setAppointments() {
    this.availableSlots=[];
    this.hoursOffSlots = [];
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
      appointment.hwPic = d1?.hwPic;
      appointment.type = d1?.type ? d1?.type : 'appointment';
      appointment.patientId = d1?.patientId;
      appointment.visitId = d1?.visitUuid;
      appointment.createdAt = d1?.createdAt;
      appointment.appointmentDate = d1?.slotJsDate;
      appointment.speciality = d1?.speciality;
      this.availableSlots.push(appointment);
    });
    this.setAvailableTimeSlotObject();
  }

  slot(time) {
    return this.availableSlotsObj[time];
  }

  offSlot(time) {
    return this.hoursOffSlotsObj[time];
  }

  handleClick(slot) {
    slot["modal"] = "details";
    this.openModal.emit(slot)
  }

  onImgError(event: any) {
    event.target.src = 'assets/svgs/user-light-bg.svg';
  }
}
