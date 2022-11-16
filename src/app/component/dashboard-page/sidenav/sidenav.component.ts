import { animate, style, transition, trigger } from "@angular/animations";
import { Component, OnInit, Output, EventEmitter } from "@angular/core";

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

  constructor() {}

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
    
    if (this.collapsed) {
      dashboardContainer && dashboardContainer.classList.add("nav-collapsed");
    } else {
      dashboardContainer &&
        dashboardContainer.classList.remove("nav-collapsed");
    }
  }

  get toggleImage() {
    return `assets/icons/dashboard-icons/${
      this.changeSide ? "Vector.png" : "Vector2.png"
    }`;
  }
}
