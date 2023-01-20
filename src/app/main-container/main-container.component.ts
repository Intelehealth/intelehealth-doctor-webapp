import { AfterContentChecked, ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { environment } from 'src/environments/environment';
import { SetNewPasswordComponent } from '../component/set-new-password/set-new-password.component';
import { PageTitleItem } from '../core/models/page-title-model';
import { PageTitleService } from '../core/page-title/page-title.service';
import { AuthService } from '../services/auth.service';
import { BreakpointObserver, BreakpointState } from '@angular/cdk/layout';
import { CoreService } from '../services/core/core.service';

@Component({
  selector: 'app-main-container',
  templateUrl: './main-container.component.html',
  styleUrls: ['./main-container.component.scss']
})
export class MainContainerComponent implements OnInit, AfterContentChecked {

  collapsed = false;
  baseUrl: string = environment.baseURL;
  baseURLLegacy: string = environment.baseURLLegacy;
  user: any;
  provider: any;
  username: string = '';
  header: PageTitleItem;
  _mode                  : string = 'side';
  isMobile               : boolean = false;
  _opened                : boolean = true;
	_showBackdrop          : boolean = false;
	_closeOnClickOutside   : boolean = false;
  sidebarClosed          : boolean = false;

  constructor(
    private cdref: ChangeDetectorRef,
    private authService: AuthService,
    private dialog: MatDialog,
    private pageTitleService: PageTitleService,
    private breakpointObserver: BreakpointObserver,
    private coreService: CoreService) { }

  ngOnInit(): void {
    this.user = JSON.parse(localStorage.getItem('user'));
    this.provider = JSON.parse(localStorage.getItem('provider'));

    this.pageTitleService.title.subscribe((val: PageTitleItem) => {
			this.header = val;
		});

    this.breakpointObserver.observe(["(max-width: 768px)"]).subscribe((result: BreakpointState) => {
      if (result.matches) {
        this.isMobile = true;
      } else {
        this.isMobile = false;
      }
      this._mode = (this.isMobile) ? 'over' : 'side';
      this._closeOnClickOutside = (this.isMobile) ? true : false;
			this._showBackdrop = (this.isMobile) ? true : false;
			this._opened = !this.isMobile;
			this.sidebarClosed = false;
    });
  }

  ngAfterContentChecked(): void {
    this.cdref.detectChanges();
  }

  onImgError(event: any) {
    event.target.src = 'assets/svgs/user.svg';
  }

  selectLanguage(): void {
    this.coreService.openSelectLanguageModal().subscribe((res: any) => {
      console.log(res);
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
    this.authService.logOut();
  }

}
