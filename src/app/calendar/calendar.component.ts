import { Component, OnInit } from '@angular/core';
import { CalendarEvent, CalendarView } from 'angular-calendar';
import { setHours, setMinutes } from 'date-fns';
import { PageTitleService } from '../core/page-title/page-title.service';

@Component({
  selector: 'app-calendar',
  templateUrl: './calendar.component.html',
  styleUrls: ['./calendar.component.scss']
})
export class CalendarComponent implements OnInit {

  viewDate = new Date();
  view: CalendarView = CalendarView.Day;
  CalendarView = CalendarView;

  constructor(private pageTitleService: PageTitleService) { }

  ngOnInit(): void {
    this.pageTitleService.setTitle({ title: "Calendar", imgUrl: "assets/svgs/menu-calendar-circle.svg" });
  }

  onTabChanged(event: number) {
    switch (event) {
      case 0:
        this.setView(CalendarView.Day);
        break;
      case 1:
        this.setView(CalendarView.Week);
        break;
      case 2:
        this.setView(CalendarView.Month);
        break;
    }
  }

  setView(view: CalendarView) {
    this.view = view;
  }

  events: CalendarEvent[] = [
    {
      start: setHours(setMinutes(new Date(), 0), 9),
      end: setHours(setMinutes(new Date(), 30), 9),
      title: 'An event',
    },
    {
      start: setHours(setMinutes(new Date(), 0), 12),
      end: setHours(setMinutes(new Date(), 30), 12),
      title: 'An event',
    }
  ];

  getCount(type: string, events: any) {
    return 1;
  }

  dayClickedMonthView(day: any) {
    console.log(day);
  }

  handleEvent(action: any, event: any) {
    console.log(action, event);
  }

}
