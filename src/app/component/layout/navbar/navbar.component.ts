import {
  Component,
  OnInit,
  Output,
  EventEmitter,
  ViewChild,
  ElementRef,
  Inject,
  OnDestroy,
} from "@angular/core";
import { AuthService } from "src/app/services/auth.service";
import { MatDialog } from "@angular/material/dialog";
import { ChangePasswordComponent } from "../../change-password/change-password.component";
import { UntypedFormGroup, UntypedFormControl, Validators } from "@angular/forms";
import { HttpClient } from "@angular/common/http";
import { FindPatientComponent } from "../../find-patient/find-patient.component";
import { environment } from "../../../../environments/environment";
import { SwPush, SwUpdate } from "@angular/service-worker";
import { PushNotificationsService } from "src/app/services/push-notification.service";
import { TranslateService } from "@ngx-translate/core";
import { TranslationService } from "src/app/services/translation.service";
import { UnsavedChangesService } from "src/app/services/unsaved-changes.service";
import { ComfirmationDialogService } from "src/app/component/visit-summary/confirmation-dialog/comfirmation-dialog.service";
import { Subscription } from "rxjs";
declare var getFromStorage: any, saveToStorage: any;

@Component({
  selector: "app-navbar",
  templateUrl: "./navbar.component.html",
  styleUrls: ["./navbar.component.css"],
})
export class NavbarComponent implements OnInit, OnDestroy {
  @ViewChild("closeBtn") closeBtn: ElementRef;
  baseURL = environment.baseURL;
  baseURLLegacy = environment.baseURLLegacy;
  systemAccess = false;
  reportAccess = false;
  subscribeAccess = false;
  notificationMenu = false;
  showBellIcon = false;
  selectedNotification = "";
  values: any = [];
  condition: any;
  condition1: any;
  fromDate: any;
  errorDays = false;
  customSnoozeData: any;
  startTimeData: any;
  endTimeData: any;
  showData: any;
  error: any = { isError: false, errorMessage: "" };
  langs = ['en', 'hi', 'ru', 'ar'];
  selectedLanguage: string = 'en';
  isProjectManger: boolean = false;
  subscription: Subscription;

  weekDays: any = [
    { day: "Monday", startTime: null, endTime: null },
    { day: "Tuesday", startTime: null, endTime: null },
    { day: "Wednesday", startTime: null, endTime: null },
    { day: "Thursday", startTime: null, endTime: null },
    { day: "Friday", startTime: null, endTime: null },
    { day: "Saturday", startTime: null, endTime: null },
    { day: "Sunday", startTime: null, endTime: null },
  ];
  readonly VapidKEY = "BJJvSw6ltFPN5GDxIOwbRtJUBBJp2CxftaRNGbntvE0kvzpe05D9zKr-SknKvNBihXDoyd09KuHrWwC3lFlTe54"; // training server
  // readonly VapidKEY = "BMGYasq0YzQ4B9RmKuaMJY3hWcOmN-3BMZfy4e9jXXUp8w7tcoNikwXAkS86Eb9nWANm_gU7CyOaVD9zMZ0QU2w"; // production server

  searchForm = new UntypedFormGroup({
    findInput: new UntypedFormControl("", [Validators.required]),
  });

  @Output() messageEvent = new EventEmitter<string>();

  constructor(
    private authService: AuthService,
    private dialog: MatDialog,
    private http: HttpClient,
    public swUpdate: SwUpdate,
    public swPush: SwPush,
    public notificationService: PushNotificationsService,
    private translateService: TranslateService,
    private translationService: TranslationService,
    private unsavedChangesService: UnsavedChangesService,
    private ComfirmationDialogService: ComfirmationDialogService,
  ) { }

  ngOnInit() {
    if (localStorage.getItem("selectedLanguage")) {
      this.translateService.setDefaultLang(
        localStorage.getItem("selectedLanguage")
      );
      this.selectedLanguage = localStorage.getItem("selectedLanguage");
    } else {
      let browserlang = this.translateService.getBrowserLang();
      if (this.langs.indexOf(browserlang) > -1) {
        this.translateService.setDefaultLang(browserlang);
        this.selectedLanguage = browserlang;
      } else {
        this.translateService.setDefaultLang("en");
      }
    }
    const userDetails = getFromStorage("user");
    this.subscribeAccess = getFromStorage("subscribed") || false;
    if (userDetails) {
      const roles = userDetails["roles"];
      roles.forEach((role) => {
        if (role.uuid === "f6de773b-277e-4ce2-9ee6-8622b8a293e8") {
          this.systemAccess = true;
        }
        if (
          role.uuid === "f6de773b-277e-4ce2-9ee6-8622b8a293e8" ||
          role.uuid === "a5df6aa5-d6e5-4b56-b0e7-315ee0899f97" || 
          role.uuid === "f99470e3-82a9-43cc-b3ee-e66c249f320a"
        ) {
          this.reportAccess = true;
        } 
        if(role.uuid === "f99470e3-82a9-43cc-b3ee-e66c249f320a") {
          this.isProjectManger = true;
        }
      });
    } else {
      this.logout();
    }
    this.authService.getFingerPrint();
    setTimeout(() => {
      this.subscribeNotification(true);
    }, 1000);

    this.notificationService
      .getUserSettings()
      .subscribe((res: { data; snooze_till }) => {
        if (res && res.data && res.data.snooze_till) {
          const snoozeTill = (() => {
            try {
              return JSON.parse(res.data.snooze_till);
            } catch (error) {
              return res.data.snooze_till;
            }
          })();
          if (Array.isArray(snoozeTill)) {
            this.weekDays = snoozeTill;
          } else {
            this.setSnoozeTimeout(res.snooze_till);
          }
        }
      });
    if (this.swPush.isEnabled) {
      this.notificationService.notificationHandler();
    }
    this.translationService.changeCssFile(localStorage.getItem("selectedLanguage"));
    this.subscription = this.unsavedChangesService.currentUnsavedChanges.subscribe(res => console.log("Unsaved changes: ", res));
  }

  logout() {
    if (!this.unsavedChangesService.currentValue) {
      this.unsubscribeNotification();
      setTimeout(() => {
        this.authService.logout();
      }, 0);
    } else {
      const dialogRef = this.ComfirmationDialogService.openConfirmDialog("You have unsaved changes, do you want to proceed?");
      return dialogRef.afterClosed().subscribe(res => {
        if (res) {
          this.unsubscribeNotification();
          setTimeout(() => {
            this.authService.logout();
          }, 0);
        }
      });
    }
  }

  useLanguage(lang: string): void {
    this.translateService.use(lang);
    this.selectedLanguage = lang;
    localStorage.setItem("selectedLanguage", this.selectedLanguage);
    this.subscribeNotification(true);
    this.translationService.changeCssFile(lang);
    if(window.location.href.includes('/visitSummary')) {
      window.location.reload();
    }
  }

  unsubscribeNotification() {
    this.swPush.unsubscribe();
    localStorage.removeItem("subscribed");
    this.notificationService
      .unsubscribeNotification({
        user_uuid: this.user.uuid,
        finger_print: this.authService.fingerPrint,
      })
      .subscribe();
  }

  changePassword() {
    this.dialog.open(ChangePasswordComponent, { width: "500px" });
  }

  search() {
    const search = this.searchForm.value;
    if (search.findInput === null || search.findInput.length < 3) {
      this.dialog.open(FindPatientComponent, {
        width: "50%",
        data: { value: "Please Enter min 3 characters" },
      });
    } else {
      // tslint:disable-next-line: max-line-length
      const url = `${this.baseURL}/patient?q=${search.findInput}&v=custom:(uuid,identifiers:(identifierType:(name),identifier),person)`;
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
        },
        (err) => {
          if (err.error instanceof Error) {
            this.translationService.getTranslation("Client-side error");
          } else {
            this.translationService.getTranslation("Server-side error");
          }
        }
      );
    }
    this.searchForm.reset();
  }

  callTour() {
    this.messageEvent.emit();
  }

  get user() {
    try {
      return JSON.parse(localStorage.user);
    } catch (error) {
      return {};
    }
  }

  subscribeNotification(reSubscribe = false) {
    if (this.swUpdate.isEnabled) {
      this.swPush
        .requestSubscription({
          serverPublicKey: this.VapidKEY,
        })
        .then((sub) => {
          const providerDetails = getFromStorage("provider");
          if (providerDetails) {
            const attributes = providerDetails.attributes;
            attributes.forEach((element) => {
              if (
                element.attributeType.uuid ===
                "ed1715f5-93e2-404e-b3c9-2a2d9600f062" &&
                !element.voided
              ) {
                this.notificationService
                  .postSubscription(
                    sub,
                    element.value,
                    providerDetails.person.display,
                    this.user.uuid,
                    this.authService.fingerPrint
                  )
                  .subscribe((response) => {
                    if (response) {
                      if (!reSubscribe) {
                        this.translationService.getTranslation(
                          `Notification Subscribed Successfully`,
                        );
                      }
                      saveToStorage("subscribed", true);
                      this.subscribeAccess = true;
                    }
                  });
              }
            });
          }
        });
    }
  }

  public toggleIcon() {
    this.notificationMenu = !this.notificationMenu;
    if (this.notificationMenu) {
      localStorage.setItem("showNotification", "1");
    } else {
      localStorage.setItem("showNotification", "0");
    }
  }

  onSubmit() {
    let sDate = this.weekDays.filter((a) => a.startTime);
    let sDate1 = sDate[0].startTime;
    let eDate1 = sDate[0].endTime;

    this.condition = sDate1 ? eDate1 !== null : "";
    this.fromDate = eDate1 ? sDate1! == null : "";

    this.condition1 =
      eDate1 < sDate1
        ? (this.error = {
          isError: true,
          errorMessage: "End Date can't before start time",
        })
        : "Success";

    if (this.condition == true && this.condition1 == "Success") {
      this.notificationService
        .setSnoozeFor(JSON.stringify(this.weekDays), true)
        .subscribe((response) => {
          this.closeModal();

          this.translationService.getTranslation("Snoozed Successfully!");
        });
    }
  }

  private closeModal(): void {
    this.closeBtn.nativeElement.click();
  }

  setNotification(period) {
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
    }
    this.notificationMenu = false;
  }

  setSnoozeTimeout(timeout) {
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

  get snoozeTimeout() {
    return this.notificationService.snoozeTimeout;
  }

  getLang() {
    return localStorage.getItem("selectedLanguage");
  }

  ngOnDestroy(): void {
    this.subscription?.unsubscribe();
  }
}
