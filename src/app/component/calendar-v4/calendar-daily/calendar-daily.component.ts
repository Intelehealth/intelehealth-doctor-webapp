import { Component, OnInit } from '@angular/core';
import * as moment from 'moment';

@Component({
  selector: 'app-calendar-daily',
  templateUrl: './calendar-daily.component.html',
  styleUrls: ['./calendar-daily.component.scss']
})
export class CalendarDailyComponent implements OnInit {
  timings: any = [];

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
    for (let idx = 0; idx <= 24; idx++) {
      timings.push(momentTime.format('h:mm A'));
      momentTime.add(30, 'minutes');
    }
    this.timings = timings;
  }
}
