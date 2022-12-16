import { Component, OnInit } from "@angular/core";
import { HeaderService } from "src/app/services/header.service";
declare var getFromStorage : any;

@Component({
  selector: "app-header",
  templateUrl: "./header.component.html",
  styleUrls: ["./header.component.scss"],
})
export class HeaderComponent implements OnInit {
  isShowNotification: boolean = false;

  showBreadCrumb: boolean = false;

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

  breadCrumb = [
    {
      text: "Dashboard",
      route: "/dashboard",
    },
    {
      text: "Visit summary",
      route: "/dashboard/visit-summary",
    },
  ];

  userName: string;
  constructor(public headerService: HeaderService) {}

  ngOnInit(): void {
    let user = getFromStorage("user");
    this.userName = user?.person?.display;
  }

  notificationClick() {
    this.isShowNotification = !this.isShowNotification;
  }

  get showSearchBar() {
    return this.headerService?.showSearchBar;
  }

  close() {
    this.isShowNotification =  false;
  }
}
