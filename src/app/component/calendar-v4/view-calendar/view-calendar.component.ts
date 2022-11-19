import { Component, OnInit } from '@angular/core';
import * as moment from 'moment';

@Component({
  selector: 'app-view-calendar',
  templateUrl: './view-calendar.component.html',
  styleUrls: ['./view-calendar.component.scss'],
})
export class ViewCalendarComponent implements OnInit {
  todayDate = null;
  constructor() { }

  ngOnInit(): void {
    this.todayDate = moment().format('DD MMMM, YYYY');
  }

}
