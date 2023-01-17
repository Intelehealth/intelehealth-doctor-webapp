import { Component, OnInit } from '@angular/core';
import { PageTitleService } from '../core/page-title/page-title.service';

@Component({
  selector: 'app-calendar',
  templateUrl: './calendar.component.html',
  styleUrls: ['./calendar.component.scss']
})
export class CalendarComponent implements OnInit {

  constructor(private pageTitleService: PageTitleService) { }

  ngOnInit(): void {
    this.pageTitleService.setTitle({ title: "Calendar", imgUrl: "assets/svgs/menu-calendar-circle.svg" });
  }

}
