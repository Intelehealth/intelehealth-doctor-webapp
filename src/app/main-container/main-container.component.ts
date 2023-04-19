import { AfterContentChecked, ChangeDetectorRef, Component, OnInit, ViewChild, OnDestroy } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { environment } from 'src/environments/environment';
import { PageTitleItem } from '../core/models/page-title-model';
import { PageTitleService } from '../core/page-title/page-title.service';
import { AuthService } from '../services/auth.service';
import { BreakpointObserver, BreakpointState } from '@angular/cdk/layout';
import { CoreService } from '../services/core/core.service';
import { HttpClient } from '@angular/common/http';
import { ToastrService } from 'ngx-toastr';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { debounceTime, distinctUntilChanged, filter } from 'rxjs/operators';
import { ActivatedRoute, ActivatedRouteSnapshot, Event, NavigationEnd, Router, RouterState, RouterStateSnapshot } from '@angular/router';
import { MatDrawer } from '@angular/material/sidenav';
import { Subscription } from 'rxjs';
import { HelpMenuComponent } from '../modal-components/help-menu/help-menu.component';
import * as introJs from 'intro.js/intro.js';

@Component({
  selector: 'app-main-container',
  templateUrl: './main-container.component.html',
  styleUrls: ['./main-container.component.scss']
})
export class MainContainerComponent implements OnInit, AfterContentChecked, OnDestroy {

  collapsed = false;
  baseUrl: string = environment.baseURL;
  baseURLLegacy: string = environment.baseURLLegacy;
  // user: any;
  // provider: any;
  username: string = '';
  header: PageTitleItem;
  _mode: string = 'side';
  isMobile: boolean = false;
  _opened: boolean = true;
  _showBackdrop: boolean = false;
  _closeOnClickOutside: boolean = false;
  sidebarClosed: boolean = false;
  subscription: Subscription;
  searchForm: FormGroup;
  public breadcrumbs: any[];
  @ViewChild('drawer') drawer: MatDrawer;
  dialogRef: MatDialogRef<HelpMenuComponent>;
  introJs: any;

  constructor(
    private cdref: ChangeDetectorRef,
    private authService: AuthService,
    private dialog: MatDialog,
    private pageTitleService: PageTitleService,
    private breakpointObserver: BreakpointObserver,
    private coreService: CoreService,
    private toastr: ToastrService,
    private http: HttpClient,
    private activatedRoute: ActivatedRoute,
    private router: Router) {
    this.searchForm = new FormGroup({
      keyword: new FormControl('', Validators.required)
    });
    this.breadcrumbs = this.buildBreadCrumb(this.activatedRoute.root);
  }

  ngOnInit(): void {
    // this.user = JSON.parse(localStorage.getItem('user'));
    // this.provider = JSON.parse(localStorage.getItem('provider'));

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

    // this.subscription = this.searchForm.valueChanges.pipe(
    //   debounceTime(1000),
    //   distinctUntilChanged()
    // ).subscribe(val => {
    //   if (this.searchForm.invalid) {
    //     return;
    //   }
    //   this.search();
    // });

    this.router.events.pipe(
      filter((event: Event) => event instanceof NavigationEnd),
      distinctUntilChanged(),
    ).subscribe(() => {
        this.breadcrumbs = this.buildBreadCrumb(this.activatedRoute.root);
        document.getElementsByClassName('admin-sidenav-content')[0]?.scrollTo(0, 0);
    });

    this.introJs = introJs();
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

  changePassword() {
    this.router.navigate(['/dashboard/change-password']);
  }

  getUrl() {
    return `assets/icons/dashboard-icons/Vector${this.collapsed ? '2' : ''}.png`
  }

  logout() {
    this.coreService.openConfirmationDialog({ confirmationMsg: "Are you sure you want to logout?", cancelBtnText: "No", confirmBtnText: "Yes" }).afterClosed().subscribe(res => {
      if (res) {
        this.authService.logOut();
      }
    });
  }

  search() {
    if (this.searchForm.value.keyword === null || this.searchForm.value.keyword.length < 3) {
      this.toastr.warning("Please enter minimum 3 characters to search patient....", "Warning");
    } else {
      const url = `${this.baseUrl}/patient?q=${this.searchForm.value.keyword}&v=custom:(uuid,identifiers:(identifierType:(name),identifier),person)`;
      this.http.get(url).subscribe((response: any) => {
        let values = [];
        response["results"].forEach((value: any) => {
          if (value) {
            if (value.identifiers.length) {
              values.push(value);
            }
          }
        });
        this.coreService.openSearchedPatientModal(values).subscribe((result: any)=> {});
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

  buildBreadCrumb(route: ActivatedRoute, url: string = '', breadcrumbs: any[] = []): any[] {
    //If no routeConfig is avalailable we are on the root path
    let label = route.routeConfig && route.routeConfig.data ? route.routeConfig.data.breadcrumb : '';
    let path = route.routeConfig && route.routeConfig.data ? route.routeConfig.path : '';
    // If the route is dynamic route such as ':id', remove it
    const lastRoutePart = path.split('/').pop();
    const isDynamicRoute = lastRoutePart.startsWith(':');
    const rs = (route.snapshot)? route.snapshot : this.searchData(this.router.routerState.snapshot, path);
    if(isDynamicRoute && !!rs) {
      const paramName = lastRoutePart.split(':')[1];
      path = path.replace(lastRoutePart, rs.params[paramName]);
      // label = rs.params[paramName];
    }

    //In the routeConfig the complete path is not available,
    //so we rebuild it each time
    const nextUrl = path ? `${url}/${path}` : url;

    const breadcrumb: any = {
        label: label,
        url: nextUrl,
    };
    // Only adding route with non-empty label
    const newBreadcrumbs = breadcrumb.label ? [ ...breadcrumbs, breadcrumb ] : [ ...breadcrumbs];
    if (route.firstChild) {
        //If we are not on our current path yet,
        //there will be more children to look after, to build our breadcumb
        return this.buildBreadCrumb(route.firstChild, nextUrl, newBreadcrumbs);
    }
    return newBreadcrumbs;
  }

  searchData(state: RouterStateSnapshot, path: string): ActivatedRouteSnapshot {
    let expectedChild: ActivatedRouteSnapshot | null;
    let child: ActivatedRouteSnapshot | null;
    child = state.root.firstChild;
    while (child != null) {
        if (child.routeConfig.path == path) {
          expectedChild = child;
          break;
        }
        child = child.firstChild;
    }
    return expectedChild;
  }

  toggleSidebar() {
    if (this.isMobile) {
      this.drawer.toggle();
    }
  }

  openHelpMenu() {
    if (this.dialogRef) {
      this.dialogRef.close();
      return;
    };
    this.dialogRef = this.coreService.openHelpMenuModal();
    this.dialogRef.afterClosed().subscribe(result => {
      this.dialogRef = undefined;
    });
  }

  startTour() {
    this.introJs.setOptions({
      steps: [
        {
          intro: 'Welcome to the Doctor portal. In less than 1 min, we will show you how to check labour status and give consultation to a patient.'
        },
        {
          element: document.querySelector('#priority-cases'),
          intro: 'These are visits that are marked as priority by health worker. Tip - Always provide consultation for priority visit table first.'
        },
        {
          element: document.querySelector('#normal-cases'),
          intro: 'These are visits that are in-progress.'
        },
        {
          element: document.querySelector('#completed-cases'),
          intro: 'All visits that are completed by the doctor.'
        },
        {
          element: document.querySelector('.search-bar'),
          intro: 'Type patients name, id to search a patient.'
        },
        // {
        //   element: document.querySelector('.table-record'),
        //   intro: "Click on anywhere on row to add doctor's consultation for the patient."
        // },
        {
          element: document.querySelector('.user-info-wrap'),
          intro: 'Click here to view and edit your profile.'
        },
        {
          intro: 'Great job, you have completed the tour'
        }
      ],
      showProgress: false,
      nextLabel: 'Next',
      prevLabel: 'Back',
      doneLabel: 'Finish',
      skipLabel: 'X',
      hidePrev: true,
      showStepNumbers: false,
      showBullets: false,
      autoPosition: false,
      tooltipClass: 'my-tooltip-class',
      highlightClass: 'my-highlight-class',
      helperElementPadding: 10,
      buttonClass: 'my-button-class',
      progressBarAdditionalClass: 'my-progress-bar-class',
      overlayOpacity: 1,
      exitOnOverlayClick: false
    }).start();
  }

  ngOnDestroy(): void {
    this.subscription?.unsubscribe();
  }

  get user() {
    return JSON.parse(localStorage.getItem('user'));
  }

  get provider() {
    return JSON.parse(localStorage.getItem('provider'));
  }
}
