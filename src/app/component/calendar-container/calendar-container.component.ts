import { Component, OnInit } from '@angular/core';
import { HeaderService } from 'src/app/services/header.service';

@Component({
  selector: 'app-calendar-container',
  templateUrl: './calendar-container.component.html',
  styleUrls: ['./calendar-container.component.scss']
})
export class CalendarContainerComponent implements OnInit {

  constructor(private headerSvc: HeaderService) {
    this.headerSvc.showSearchBar = false;
  }

  ngOnInit(): void {
  }

}
