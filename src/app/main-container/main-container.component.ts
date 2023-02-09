import { AfterContentChecked, ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { environment } from 'src/environments/environment';
import { SetNewPasswordComponent } from '../component/set-new-password/set-new-password.component';
import { PageTitleItem } from '../core/models/page-title-model';
import { PageTitleService } from '../core/page-title/page-title.service';
import { AuthService } from '../services/auth.service';
import { BreakpointObserver, BreakpointState } from '@angular/cdk/layout';
import { CoreService } from '../services/core/core.service';
import { FindPatientComponent } from '../component/find-patient/find-patient.component';
import { HttpClient } from '@angular/common/http';
import { ToastrService } from 'ngx-toastr';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';

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

  subscription: Subscription;
  searchForm: FormGroup;
  values: any = [];

  constructor(
    private cdref: ChangeDetectorRef,
    private authService: AuthService,
    private dialog: MatDialog,
    private pageTitleService: PageTitleService,
    private breakpointObserver: BreakpointObserver,
    private coreService: CoreService,
    private toastr: ToastrService,
    private http: HttpClient) {
      this.searchForm = new FormGroup({
        keyword: new FormControl('', Validators.required)
      });
    }

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

    this.subscription = this.searchForm.valueChanges.pipe(
      debounceTime(1000),
      distinctUntilChanged()
    ).subscribe(val=>{
      if (this.searchForm.invalid) {
        return;
      }
      this.search();
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

  search() {
    if (this.searchForm.value.keyword === null || this.searchForm.value.keyword.length < 3) {
      this.dialog.open(FindPatientComponent, {
        width: "50%",
        data: { value: "Please enter min 3 characters" },
      });
    } else {
      const url = `${this.baseUrl}/patient?q=${this.searchForm.value.keyword}&v=custom:(uuid,identifiers:(identifierType:(name),identifier),person)`;
      this.http.get(url).subscribe(
        (response) => {
          this.values = [];
          response["results"].forEach((value) => {
            if (value) {
              if (value.identifiers.length) {
                this.values.push(value);
              }
            }
          });
          this.dialog.open(FindPatientComponent, {
            width: "90%",
            data: { value: this.values },
          });
          this.searchForm.reset();
        },
        (err) => {
          if (err.error instanceof Error) {
            this.toastr.error("Client-side error", null, { timeOut: 2000 });
          } else {
            this.toastr.error("Server-side error", null, { timeOut: 2000 });
          }
        }
      );
    }
  }

}
