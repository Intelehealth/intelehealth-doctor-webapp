import { Component, OnInit } from "@angular/core";

@Component({
  selector: "app-header",
  templateUrl: "./header.component.html",
  styleUrls: ["./header.component.scss"],
})
export class HeaderComponent implements OnInit {
  isShowNotification: boolean = false;

  allNotification = [{}];

  showFourNotification = [
    {
      text: "muskan kala's appointment start in 15mints",
      lableIconPath: "assets/svgs/calender-dilog.svg",
      isActive: true,
    },

    {
      text: "muskan kala's appointment start in 15mints",
      lableIconPath: "assets/svgs/video-dilog.svg",
      isActive: false,
    },
    {
      text: "muskan kala's appointment start in 15mints",
      lableIconPath: "assets/svgs/priority-dilog.svg",
      isActive: false,
    },
    {
      text: "muskan kala's",
      lableIconPath: "assets/svgs/progress-dilog.svg",
      isActive: false,
    },
  ];

  constructor() {}

  ngOnInit(): void {}

  notificationClick() {
    this.isShowNotification = !this.isShowNotification;
  }
}
