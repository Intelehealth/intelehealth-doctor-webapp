import { Component, OnInit } from '@angular/core';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-admin',
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.scss']
})
export class AdminComponent implements OnInit {

  collapsed = false;
  user: any;
  provider: any;
  username: string = '';
  baseUrl: string = environment.baseURL;
  baseURLLegacy = environment.baseURLLegacy;

  constructor() { }

  ngOnInit(): void {
    this.user = JSON.parse(localStorage.getItem('user'));
    this.provider = JSON.parse(localStorage.getItem('provider'));
  }

  getUrl() {
    return `assets/icons/dashboard-icons/Vector${this.collapsed?'2':''}.png`
  }

  onImgError(event: any) {
    event.target.src = 'assets/svgs/user.svg';
  }

}
