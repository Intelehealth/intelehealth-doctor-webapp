import { Component, OnInit } from '@angular/core';
import { PageTitleService } from '../core/page-title/page-title.service';

@Component({
  selector: 'app-help-and-support',
  templateUrl: './help-and-support.component.html',
  styleUrls: ['./help-and-support.component.scss']
})
export class HelpAndSupportComponent implements OnInit {

  panelOpenState = false;

  constructor(private pageTitleService: PageTitleService) { }

  ngOnInit(): void {
    this.pageTitleService.setTitle({ title: "Help & Support", imgUrl: "assets/svgs/menu-info-circle.svg" });
  }

}
