import { Component, OnInit } from '@angular/core';
import { HeaderService } from "src/app/services/header.service";

@Component({
  selector: 'app-profile-container',
  templateUrl: './profile-container.component.html',
  styleUrls: ['./profile-container.component.scss']
})
export class ProfileContainerComponent implements OnInit {
  // showBreadCrumb: boolean = false;
  breadCrumb = [
    {
      text: "Dashboard",
      route: "/dashboard",
    },
    {
      text: "Profile",
      route: "/dashboard/profile",
    },
  ];
  constructor(
    public headerService: HeaderService
  ) { }

  ngOnInit(): void {
  }

  get showSearchBar() {
    return this.headerService?.showSearchBar;
  }
}
