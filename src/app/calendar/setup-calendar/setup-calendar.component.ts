import { Component, OnInit } from '@angular/core';
import { PageTitleService } from 'src/app/core/page-title/page-title.service';

@Component({
  selector: 'app-setup-calendar',
  templateUrl: './setup-calendar.component.html',
  styleUrls: ['./setup-calendar.component.scss']
})
export class SetupCalendarComponent implements OnInit {

  days: any = [
    {
      id: 1,
      name: 'Monday',
      shortName: 'Mon'
    },
    {
      id: 2,
      name: 'Tuesday',
      shortName: 'Tue'
    },
    {
      id: 3,
      name: 'Wednesday',
      shortName: 'Wed'
    },
    {
      id: 4,
      name: 'Thursday',
      shortName: 'Thu'
    },
    {
      id: 5,
      name: 'Friday',
      shortName: 'Fri'
    },
    {
      id: 6,
      name: 'Saturday',
      shortName: 'Sat'
    },
    {
      id: 7,
      name: 'Sunday',
      shortName: 'Sun'
    },
    {
      id: 8,
      name: 'Weekdays',
      shortName: 'Weekdays'
    },
    {
      id: 1,
      name: 'Weekends',
      shortName: 'Weekends'
    }
  ];
  timeList: any = [
    { id: 1, name: "09:00" },
    { id: 2, name: "10:00" },
    { id: 3, name: "11:00" },
    { id: 4, name: "12:00" },
    { id: 5, name: "01:00" },
    { id: 6, name: "02:00" },
    { id: 7, name: "03:00" },
    { id: 8, name: "04:00" },
    { id: 9, name: "05:00" },
    { id: 10, name: "06:00" },
    { id: 11, name: "07:00" },
    { id: 12, name: "08:00" }
  ];
  clockTimeAmPM: any = [
    { id: 1, name: "AM" },
    { id: 2, name: "PM" }
  ];

  constructor(private pageTitleService: PageTitleService) { }

  ngOnInit(): void {
    this.pageTitleService.setTitle({ title: 'Calendar', imgUrl: 'assets/svgs/menu-calendar-circle.svg' })
  }

}
