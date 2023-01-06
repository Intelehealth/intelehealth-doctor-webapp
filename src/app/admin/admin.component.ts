import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { environment } from 'src/environments/environment';
import { SetNewPasswordComponent } from '../component/set-new-password/set-new-password.component';
import { SelectLanguageComponent } from '../component/set-up-profile/select-language/select-language.component';
import { AuthService } from '../services/auth.service';

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

  constructor(private authService: AuthService, private dialog: MatDialog) { }

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

  selectLanguage(): void {
    const dialogRef = this.dialog.open(SelectLanguageComponent, {
      data: {},
    });
  }

  changePassword(){
    this.dialog.open(SetNewPasswordComponent, {
      width: "40%"
    });
  }

  logout(){
    this.authService.logout();
  }

}
