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
import { SwPush, SwUpdate } from "@angular/service-worker";
import { PushNotificationsService } from '../services/push-notification.service';
import { SocketService } from '../services/socket.service';
import { NgxRolesService } from 'ngx-permissions';
import FingerprintJS from '@fingerprintjs/fingerprintjs';

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
  subscription1: Subscription;
  subscription2: Subscription;
  subscription3: Subscription;
  searchForm: FormGroup;
  public breadcrumbs: any[];
  @ViewChild('drawer') drawer: MatDrawer;
  dialogRef: MatDialogRef<HelpMenuComponent>;
  routeUrl: string = '';
  introJs: any;
  adminUnread: number = 0;
  notificationEnabled: boolean = false;
  interval: any;

  subscribed: boolean = false;
  readonly VapidKEY = "BLDLmm1FrOhRJsumFL3lZ8fgnC_c1rFoNp-mz6KWObQpgPkhWzUh66GCGPzioTWBc4u0SB8P4spimU8SH2eWNfg";
  weekDays: any = [
    { day: "Monday", startTime: null, endTime: null },
    { day: "Tuesday", startTime: null, endTime: null },
    { day: "Wednesday", startTime: null, endTime: null },
    { day: "Thursday", startTime: null, endTime: null },
    { day: "Friday", startTime: null, endTime: null },
    { day: "Saturday", startTime: null, endTime: null },
    { day: "Sunday", startTime: null, endTime: null },
  ];
  selectedNotification = "";

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
    private router: Router,
    private socketService: SocketService,
    private rolesService: NgxRolesService,
    public swUpdate: SwUpdate,
    public _swPush: SwPush,
    public notificationService: PushNotificationsService) {
    this.searchForm = new FormGroup({
      keyword: new FormControl('', Validators.required)
    });
    this.breadcrumbs = this.buildBreadCrumb(this.activatedRoute.root);
    this.routeUrl = this.breadcrumbs[this.breadcrumbs.length - 1]?.url;
    if (localStorage.getItem('collapsed') && this.breadcrumbs.filter((val => val.url.includes('visit-summary'))).length) {
      this.collapsed = true;
      this.routeUrl = this.breadcrumbs.filter((val => val.url.includes('visit-summary')))[0].url;
    }
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
        this.routeUrl = this.router.url;
        this.breadcrumbs = this.buildBreadCrumb(this.activatedRoute.root);
        document.getElementsByClassName('admin-sidenav-content')[0]?.scrollTo(0, 0);
        if (this.routeUrl.includes('visit-summary')) {
          localStorage.setItem('collapsed', JSON.stringify(this.collapsed));
          this.collapsed = true;
        } else {
          this.collapsed = !!JSON.parse(localStorage.getItem('collapsed'));
          localStorage.removeItem('collapsed');
        }
    });


    // If user role is admin then suscribe for support messages
    let role = this.rolesService.getRole('ORGANIZATIONAL: SYSTEM ADMINISTRATOR');
    if (role) {
      this.subscription1 = this.socketService.adminUnread.subscribe(res => {
        this.adminUnread = res;
      });
      this.socketInitialize();
    }

    this.introJs = introJs();
    this.getNotificationStatus();
    setTimeout(() => {
      this.requestSubscription();
      if (!this.notificationEnabled) {
        this.toggleNotification();
      }
    }, 5000);

    // this.authService.getFingerPrint();
    // setTimeout(() => {
    //   this.subscribeNotification(true);
    // }, 1000);
    // this.notificationService.getUserSettings().subscribe((res: { data: any; snooze_till: any }) => {
    //   if (res && res.data && res.data.snooze_till) {
    //     const snoozeTill = (() => {
    //       try {
    //         return JSON.parse(res.data.snooze_till);
    //       } catch (error) {
    //         return res.data.snooze_till;
    //       }
    //     })();
    //     if (Array.isArray(snoozeTill)) {
    //       this.weekDays = snoozeTill;
    //     } else {
    //       this.setSnoozeTimeout(res.snooze_till);
    //     }
    //   }
    // });

    // if (this.swPush.isEnabled) {
    //   this.notificationService.notificationHandler();
    // }
  }

  socketInitialize() {
    this.subscription2?.unsubscribe();
    this.subscription3?.unsubscribe();
    if (this.interval) {
      clearInterval(this.interval);
    }
    this.socketService.initSocketSupport(true);
    this.subscription2 = this.socketService.onEvent("adminUnreadCount").subscribe((data) => {
      this.socketService.addCount(data);
    });
    this.subscription3 = this.socketService.onEvent("disconnect").subscribe((data) => {
      this.socketInitialize();
    });
    setTimeout(() => {
      this.socketService.emitEvent('getAdminUnreadCount', null);
    }, 1500);
    this.interval = setInterval(() => {
      this.socketService.emitEvent('getAdminUnreadCount', null);
    }, 30000);
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
        if (this.dialogRef) {
          this.dialogRef.close();
        }
        // this.unsubscribeNotification();
        // setTimeout(() => {
          this.authService.logOut();
        // }, 100);
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
    this.authService.addTourStatus(true);
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
        {
          element: document.querySelector('.header-row'),
          intro: 'Click on the headings of the table to sort.'
        },
        {
          element: document.querySelector('.table-record'),
          intro: "Click on anywhere on row to add doctor's consultation for the patient."
        },
        {
          element: document.querySelector('.user-info-wrap'),
          intro: 'Click here to view and edit your profile.'
        },
        {
          intro: 'Great job, you have completed the tour'
        }
      ],
      showProgress: false,
      nextLabel: 'Next →',
      prevLabel: '← Back',
      doneLabel: 'Finish',
      skipLabel: 'X',
      hidePrev: true,
      showStepNumbers: true,
      stepNumbersOfLabel: '/',
      showBullets: false,
      autoPosition: false,
      tooltipClass: 'my-tooltip-class',
      highlightClass: 'my-highlight-class',
      helperElementPadding: 10,
      buttonClass: 'my-button-class',
      progressBarAdditionalClass: 'my-progress-bar-class',
      overlayOpacity: 1,
      exitOnOverlayClick: false,
      scrollToElement: true,
      scrollTo: 'element'
    }).start();

    this.introJs.onexit(() => {
      this.authService.addTourStatus(false);
    });
  }

  getNotificationStatus() {
    this.authService.getNotificationStatus(this.user?.uuid).subscribe((res: any) => {
      // console.log(res);
      if (res.success) {
        this.notificationEnabled = res.data?.notification_status;
      }
    });
  }

  async requestSubscription() {
    if (!this._swPush.isEnabled) {
      console.log("Notification is not enabled.");
      return;
    }
    console.log("Request subscription....");
    // this._swPush.subscription.subscribe(async (sub) => {
    //   console.log("Currently active subscription:", sub);
    //   if (!sub) {
        await this._swPush.requestSubscription({
          serverPublicKey: environment.vapidPublicKey
        }).then(async (_) => {
          console.log("New subscription: ", JSON.stringify(_));
          // (async () => {
            // Get the visitor identifier when you need it.
            const fp = await FingerprintJS.load();
            const result = await fp.get();
            console.log(result.visitorId);
            this.authService.subscribePushNotification(
              _,
              this.user.uuid,
              result.visitorId,
              this.provider.person.display,
              this.getSpecialization()
            ).subscribe(response => {
              console.log(response);
            });
          // })();
        }).catch((_) => console.log);
    //   } else {
    //     this._swPush.messages.subscribe(payload => {
    //       console.log(payload);
    //     });
    //   }
    // });
  }


  getSpecialization(attr: any = this.provider.attributes) {
    let specialization = null;
    for (let x = 0; x < attr.length; x++) {
      if (attr[x].attributeType.uuid == 'ed1715f5-93e2-404e-b3c9-2a2d9600f062' && !attr[x].voided) {
        specialization = attr[x].value;
        break;
      }
    }
    return specialization;
  }

  toggleNotification() {
    this.authService.toggleNotificationStatus(this.user.uuid).subscribe((res: any) => {
      // console.log(res);
      if (res.success) {
        this.notificationEnabled = res.data?.notification_status;
        // this.toastr.success(`Notifications turned ${ this.notificationEnabled ? 'on' : 'off' } successfully!`, `Notifications ${ this.notificationEnabled ? 'On' : 'Off' }`);
      }
    });
  }

  // subscribeNotification(reSubscribe = false) {
  //   if (this.swUpdate.isEnabled) {
  //     this.swPush
  //       .requestSubscription({
  //         serverPublicKey: this.VapidKEY,
  //       })
  //       .then((sub) => {
  //         const provider = JSON.parse(localStorage.getItem('provider'));
  //         if (provider) {
  //           const attributes = provider.attributes;
  //           attributes.forEach((element) => {
  //             if (
  //               element.attributeType.uuid ===
  //               "ed1715f5-93e2-404e-b3c9-2a2d9600f062" &&
  //               !element.voided
  //             ) {
  //               this.notificationService
  //                 .postSubscription(
  //                   sub,
  //                   element.value,
  //                   provider.person.display,
  //                   this.user.uuid,
  //                   this.authService.fingerPrint
  //                 )
  //                 .subscribe((response) => {
  //                   if (response) {
  //                     if (!reSubscribe) {
  //                       this.toastr.success('Notification subscribed successfully!', 'Subscribed');
  //                     }
  //                     localStorage.setItem("subscribed", JSON.stringify(true));
  //                     this.subscribed = true;
  //                   }
  //                 });
  //             }
  //           });
  //         }
  //       });
  //   }
  // }

  // unsubscribeNotification() {
  //   this.swPush.unsubscribe();
  //   localStorage.removeItem("subscribed");
  //   this.notificationService
  //     .unsubscribeNotification({
  //       user_uuid: this.user.uuid,
  //       finger_print: this.authService.fingerPrint,
  //     })
  //     .subscribe();
  // }

  setSnoozeTimeout(timeout: any) {
    if (this.notificationService.snoozeTimeout)
      clearTimeout(this.notificationService.snoozeTimeout);
    this.notificationService.snoozeTimeout = setTimeout(() => {
      this.notificationService.setSnoozeFor("off").subscribe((response) => {
        if (this.notificationService.snoozeTimeout)
          this.notificationService.snoozeTimeout = clearTimeout(
            this.notificationService.snoozeTimeout
          );
      });
    }, timeout);
  }

  setNotification(period: string) {
    if (period !== "custom") {
      this.selectedNotification = period;
      this.notificationService.setSnoozeFor(period).subscribe((response) => {
        if (!response["snooze_till"]) {
          this.notificationService.snoozeTimeout = clearTimeout(
            this.notificationService.snoozeTimeout
          );
        } else {
          this.setSnoozeTimeout(response["snooze_till"]);
        }
      });
    } else {

    }
  }

  ngOnDestroy(): void {
    this.subscription?.unsubscribe();
    this.subscription1?.unsubscribe();
    this.subscription2?.unsubscribe();
    this.subscription3?.unsubscribe();
    if (this.interval) {
      clearInterval(this.interval);
    }
  }

  get user() {
    return JSON.parse(localStorage.getItem('user'));
  }

  get provider() {
    return JSON.parse(localStorage.getItem('provider'));
  }

  get snoozeTimeout() {
    return this.notificationService.snoozeTimeout;
  }
}
