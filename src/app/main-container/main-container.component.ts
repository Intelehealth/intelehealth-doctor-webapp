import { AfterContentChecked, ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { environment } from 'src/environments/environment';
import { SetNewPasswordComponent } from '../component/set-new-password/set-new-password.component';
import { SelectLanguageComponent } from '../component/set-up-profile/select-language/select-language.component';
import { PageTitleItem } from '../core/models/page-title-model';
import { PageTitleService } from '../core/page-title/page-title.service';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-main-container',
  templateUrl: './main-container.component.html',
  styleUrls: ['./main-container.component.scss']
})
export class MainContainerComponent implements OnInit, AfterContentChecked {

  collapsed = false;
  baseUrl: string = environment.baseURL;
  baseURLLegacy = environment.baseURLLegacy;
  user: any;
  provider: any;
  username: string = '';
  header: PageTitleItem;
  _mode: string = 'side';

  constructor(
    private cdref: ChangeDetectorRef,
    private authService: AuthService,
    private dialog: MatDialog,
    private pageTitleService: PageTitleService) { }

  ngOnInit(): void {
    this.user = JSON.parse(localStorage.getItem('user'));
    this.provider = JSON.parse(localStorage.getItem('provider'));

    this.pageTitleService.title.subscribe((val: PageTitleItem) => {
			this.header = val;
		});
  }

  ngAfterContentChecked(): void {
    this.cdref.detectChanges();
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

  getUrl() {
    return `assets/icons/dashboard-icons/Vector${this.collapsed?'2':''}.png`
  }

  logout(){
    this.authService.logout();
  }

}
