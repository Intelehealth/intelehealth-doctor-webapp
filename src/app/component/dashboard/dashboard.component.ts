import { animate, style, transition, trigger } from '@angular/animations';
import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
  animations: [
    trigger('fadeInOut', [
      transition(':enter', [
        style({opacity: 0}),
        animate('350ms',
          style({opacity: 1})
        )
      ])
    ])
  ]
})

export class DashboardComponent implements OnInit {
  @Input() collapsed = true;
  @Input() screenWidth = 0;
  changeSide: boolean = false;

  constructor() { }

  ngOnInit(): void {
    this.screenWidth = window.innerWidth;
  }

  toggleCollapse(): void {
    this.collapsed = !this.collapsed;
  }

  getBodyClass(): string {
    let styleClass = '';
    if(this.collapsed && this.screenWidth > 768) {
      styleClass = 'body-trimmed';
    } 
    return styleClass;
  }

  iconMove() {
    this.changeSide = !this.changeSide;
  }
}
