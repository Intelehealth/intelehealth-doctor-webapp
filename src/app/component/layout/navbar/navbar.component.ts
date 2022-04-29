import {
  Component,
  OnInit,
  Output,
  EventEmitter,
  ViewChild,
  ElementRef,
} from "@angular/core";
import { AuthService } from "src/app/services/auth.service";
import { MatDialog } from "@angular/material/dialog";
import { MatSnackBar } from "@angular/material/snack-bar";
import { ChangePasswordComponent } from "../../change-password/change-password.component";
import { FormGroup, FormControl, Validators } from "@angular/forms";
import { HttpClient } from "@angular/common/http";
import { FindPatientComponent } from "../../find-patient/find-patient.component";
import { environment } from "../../../../environments/environment";
import { SwPush, SwUpdate } from "@angular/service-worker";
import { PushNotificationsService } from "src/app/services/push-notification.service";
declare var getFromStorage: any, saveToStorage: any;

@Component({
  selector: "app-navbar",
  templateUrl: "./navbar.component.html",
  styleUrls: ["./navbar.component.css"],
})
export class NavbarComponent implements OnInit {
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

  weekDays: any = [
    { day: "Monday", startTime: null, endTime: null },
    { day: "Tuesday", startTime: null, endTime: null },
    { day: "Wednesday", startTime: null, endTime: null },
    { day: "Thursday", startTime: null, endTime: null },
    { day: "Friday", startTime: null, endTime: null },
    { day: "Saturday", startTime: null, endTime: null },
    { day: "Sunday", startTime: null, endTime: null },
  ];
  readonly VapidKEY =
    "BLDLmm1FrOhRJsumFL3lZ8fgnC_c1rFoNp-mz6KWObQpgPkhWzUh66GCGPzioTWBc4u0SB8P4spimU8SH2eWNfg";

  searchForm = new FormGroup({
    findInput: new FormControl("", [Validators.required]),
  });

  @Output() messageEvent = new EventEmitter<string>();

  constructor(
    private authService: AuthService,
    private dialog: MatDialog,
    private snackbar: MatSnackBar,
    private http: HttpClient,
    public swUpdate: SwUpdate,
    public swPush: SwPush,
    public notificationService: PushNotificationsService
  ) {}

  ngOnInit() {
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
          role.uuid === "a5df6aa5-d6e5-4b56-b0e7-315ee0899f97"
        ) {
          this.reportAccess = true;
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
  }

  logout() {
    this.unsubscribeNotification();
    setTimeout(() => {
      this.authService.logout();
    }, 0);
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
        data: { value: "Please enter min 3 characters" },
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
            this.snackbar.open("Client-side error", null, { duration: 2000 });
          } else {
            this.snackbar.open("Server-side error", null, { duration: 2000 });
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
                        this.snackbar.open(
                          `Notification Subscribed Successfully`,
                          null,
                          { duration: 4000 }
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

          this.snackbar.open("Snoozed Successfully!", null, { duration: 4000 });
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
}
