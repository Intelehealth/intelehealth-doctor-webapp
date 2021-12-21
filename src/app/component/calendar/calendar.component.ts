import { ChangeDetectionStrategy, Component, OnInit, TemplateRef, ViewChild } from "@angular/core";
import { Router } from "@angular/router";
import { NgbModal } from "@ng-bootstrap/ng-bootstrap";
import { CalendarView, CalendarDateFormatter, CalendarEventTimesChangedEvent } from "angular-calendar";
import { CalendarEvent } from 'calendar-utils';
import { isSameMonth, isSameDay, addMinutes } from "date-fns";
import * as moment from "moment";
import { Subject } from "rxjs";
import { AppointmentService } from "src/app/services/appointment.service";

const colors: any = {
  red: {
    primary: '#ad2121',
    secondary: '#FAE3E3'
  },
  blue: {
    primary: '#1e90ff',
    secondary: '#D1E8FF'
  },
  yellow: {
    primary: '#e3bc08',
    secondary: '#FDF1BA'
  }
};

@Component({
  selector: "app-calendar",
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: "./calendar.component.html",
  styleUrls: ["./calendar.component.css"],
  providers: [
    {
      provide: CalendarDateFormatter
    }
  ]
})
export class CalendarComponent implements OnInit{
  private yesterday: Date;
  @ViewChild('modalContent') modalContent: TemplateRef<any>;
  view: CalendarView = CalendarView.Month;
  CalendarView = CalendarView;
  viewDate: Date = new Date();
  drSlots = [];
  modalData: {
    date: Date,
    events: CalendarEvent[];
  };
  refresh: Subject<any> = new Subject();
  events: CalendarEvent[];
  activeDayIsOpen: boolean = false;
  previousButtonClicks = 0; nextButtonClicks = 0;
  previousDate: Date; nextDate:Date;
  selectedLang: string = 'en';

  constructor(private modal: NgbModal,
     private appointmentService: AppointmentService,
     private router: Router) {
  }

  private initializeEvents(slot) {
    let array :CalendarEvent[] = [];
    for(let i=0; i< slot.length; i++) {
     let event1 = {
        title: `${slot[i].patientName}(${slot[i].openMrsId}) ${slot[i].slotTime}`,
        color: colors.yellow,
        start: new Date(moment(slot[i].slotDate.concat(slot[i].slotTime.substring(0,5)),"DD/MM/YYYY hh:mm:ss").toDate()),
        end: new Date(addMinutes(moment(slot[i].slotDate.concat(slot[i].slotTime.substring(0,5)),"DD/MM/YYYY hh:mm:ss").toDate(), slot[i].slotDuration)),
        patientId:slot[i].patientId,
        visitUuid:slot[i].visitUuid,
        name:slot[i].patientName,
        openMrsId:slot[i].openMrsId,
        slotTime:slot[i].slotTime
      };
      array.push(event1);
    };
    this.events = Object.assign([],array);
    this.refresh.next();
    console.log("events", this.events)
  }

  dayClicked({ date, events }: { date: Date; events: CalendarEvent[] }): void {
    if (isSameMonth(date, this.viewDate)) {
      this.viewDate = date;
      if (
        (isSameDay(this.viewDate, date) && this.activeDayIsOpen === true) ||
        events.length === 0
      ) {
        //this.activeDayIsOpen = false;
      } else {
        this.modalData = {date, events};
        this.modal.open(this.modalContent);
        //this.activeDayIsOpen = true;
      }
    }
  }

  eventTimesChanged({
    event,
    newStart,
    newEnd
  }: CalendarEventTimesChangedEvent): void {
    this.events = this.events.map(iEvent => {
      if (iEvent === event) {
        return {
          ...event,
          start: newStart,
          end: newEnd
        };
      }
      return iEvent;
    });
    this.handleEvent('Dropped or resized', event);
  }

  handleEvent(action: string, event): void {
    this.router.navigate(['/visitSummary', event.patientId, event.visitUuid]);
  }

  setView(view: CalendarView) {
    this.view = view;
    this.getData();
  }

  closeOpenMonthViewDay(selectedMonth) {
    this.activeDayIsOpen = false;
    if(selectedMonth === 'Previous') {
      this.previousButtonClicks++;
      this.nextButtonClicks = 0;
      let startOfMonth = moment(this.nextDate).subtract(this.previousButtonClicks,this.view).startOf(this.view).format('YYYY-MM-DD hh:mm');
      let endOfMonth   = moment(this.nextDate).subtract(this.previousButtonClicks,this.view).endOf(this.view).format('YYYY-MM-DD hh:mm');
      this.previousDate = new Date(startOfMonth);
      //console.log("Previous startOfMonth",startOfMonth,endOfMonth,this.previousDate)
      this.getDrSlots(startOfMonth, endOfMonth);
    } else if(selectedMonth === 'Next') {
      this.nextButtonClicks++;
      this.previousButtonClicks = 0;
      let startOfMonth = moment(this.previousDate).add(this.nextButtonClicks,this.view).startOf(this.view).format('YYYY-MM-DD hh:mm');
      let endOfMonth   = moment(this.previousDate).add(this.nextButtonClicks,this.view).endOf(this.view).format('YYYY-MM-DD hh:mm');
      this.nextDate = new Date(startOfMonth);
      //console.log("Next startOfMonth",startOfMonth,endOfMonth, this.nextDate)
      this.getDrSlots(startOfMonth, endOfMonth);
    } else {
      this.previousButtonClicks = 0;
      this.nextButtonClicks = 0;
      this.previousDate = new Date();
      this.nextDate = new Date();
      //console.log("Previous",this.previousButtonClicks, this.previousDate)
      //console.log("Next",this.nextButtonClicks,this.nextDate)
    }
  }
  
  getData() {
    let dates = this.getDates(this.view);
    this.viewDate = new Date(dates.startOfMonth);
    this.getDrSlots(dates.startOfMonth, dates.endOfMonth);
  }

  ngOnInit(): void {
   this.selectedLang = localStorage.getItem('selectedLanguage');
    let dates = this.getDates('month');
    this.getDrSlots(dates.startOfMonth, dates.endOfMonth);
  }

 getDates(view) {
  let startOfMonth = moment().startOf(view).format('YYYY-MM-DD hh:mm');
  let endOfMonth   = moment().endOf(view).format('YYYY-MM-DD hh:mm');
  //console.log({startOfMonth, endOfMonth})
  return {startOfMonth, endOfMonth};
 }

  getDrSlots(fromDate, toDate) {
    this.appointmentService
      .getUserSlots(this.userId, moment(fromDate).format("DD/MM/YYYY"), moment(toDate).format("DD/MM/YYYY"))
      .subscribe({
        next: (res: any) => {
          this.drSlots = res.data;
        //  console.log("this.drSlots: ", this.drSlots);
          this.initializeEvents(this.drSlots);
        },
      });
  }

  get userId() {
    return JSON.parse(localStorage.user).uuid;
  }
}
