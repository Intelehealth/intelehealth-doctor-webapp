import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-dashboard-body',
  templateUrl: './dashboard-body.component.html',
  styleUrls: ['./dashboard-body.component.scss']
})
export class DashboardBodyComponent implements OnInit {
  @Input() collapsed: boolean = false;
  @Input() screenWidth: number = 0;
  doctorName = "";
  constructor() { }

  ngOnInit(): void {
  }
  getBodyClass() {
    let styleClass = "";
    if (this.collapsed && this.screenWidth > 1068) {
      styleClass = "body-trimmed";
    }
    return styleClass;
  }
}
