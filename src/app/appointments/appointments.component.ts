import { Component, OnInit } from '@angular/core';
import { PageTitleService } from '../core/page-title/page-title.service';

@Component({
  selector: 'app-appointments',
  templateUrl: './appointments.component.html',
  styleUrls: ['./appointments.component.scss']
})
export class AppointmentsComponent implements OnInit {

  constructor(private pageTitleService: PageTitleService) { }

  ngOnInit(): void {
    this.pageTitleService.setTitle({ title: "Appointments", imgUrl: "assets/svgs/menu-video-circle.svg" });
  }

}
