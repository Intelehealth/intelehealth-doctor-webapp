import { animate, style, transition, trigger } from "@angular/animations";
import { Component, OnInit, Output, EventEmitter } from "@angular/core";
import { AuthService } from "src/app/services/auth.service";

interface SideNavToggle {
  screenWidth: number;
  collapsed: boolean;
}

@Component({
  selector: "app-sidenav",
  templateUrl: "./sidenav.component.html",
  styleUrls: ["./sidenav.component.scss"],
  animations: [
    trigger("fadeInOut", [
      transition(":enter", [
        style({ opacity: 0 }),
        animate("350ms", style({ opacity: 1 })),
      ]),
    ]),
  ],
})
export class SidenavComponent implements OnInit {
  @Output() onToggleSideNav: EventEmitter<SideNavToggle> = new EventEmitter();
  collapsed = false;
  screenWidth = 0;
  changeSide: boolean = false;

  constructor(private authService: AuthService) { }

  ngOnInit(): void {
    this.screenWidth = window.innerWidth;
    this.toggleCollapse();
  }

  toggleCollapse(): void {
    this.collapsed = !this.collapsed;
    this.changeSide = !this.changeSide;

    this.onToggleSideNav.emit({
      collapsed: this.collapsed,
      screenWidth: this.screenWidth,
    });

    const dashboardContainer = document.querySelector(".dashboard-summary");
    const calendarContainer = document.querySelector(".right-side-container");

    if (this.collapsed) {
      dashboardContainer && dashboardContainer.classList.add("nav-collapsed");
      if (dashboardContainer?.classList?.contains('nav-opened')) {
        dashboardContainer?.classList.remove("nav-opened");
      }

      calendarContainer && calendarContainer.classList.add("nav-collapsed");
      if (calendarContainer?.classList?.contains('nav-opened')) {
        calendarContainer.classList.remove("nav-opened");
      }
    } else {
      dashboardContainer &&
        dashboardContainer?.classList.remove("nav-collapsed");
      dashboardContainer?.classList.add("nav-opened");
      calendarContainer &&
        calendarContainer?.classList.remove("nav-collapsed");
      calendarContainer?.classList.add("nav-opened");
    }
  }

  get toggleImage() {
    return `assets/icons/dashboard-icons/${this.changeSide ? "Vector.png" : "Vector2.png"
      }`;
  }

  logout() {
    this.authService.logout();
  }
}
