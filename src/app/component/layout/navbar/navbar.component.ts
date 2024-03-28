import { Component, OnInit, Output, EventEmitter } from "@angular/core";
import { AuthService } from "src/app/services/auth.service";
import { MatDialog } from "@angular/material/dialog";
import { MatSnackBar } from "@angular/material/snack-bar";
import { ChangePasswordComponent } from "../../change-password/change-password.component";
import { UntypedFormGroup, UntypedFormControl, Validators } from "@angular/forms";
import { HttpClient } from "@angular/common/http";
import { FindPatientComponent } from "../../find-patient/find-patient.component";
import { environment } from "../../../../environments/environment";
import { SwPush, SwUpdate } from "@angular/service-worker";
import { PushNotificationsService } from "src/app/services/push-notification.service";
import { MonitoringService } from "src/app/services/monitoring.service";
import { SocketService } from "src/app/services/socket.service";
import { suppress } from "src/app/utils/utility-functions";
declare var getFromStorage: any, saveToStorage: any;

@Component({
  selector: "app-navbar",
  templateUrl: "./navbar.component.html",
  styleUrls: ["./navbar.component.css"],
})
export class NavbarComponent implements OnInit {
  baseURL = environment.baseURL;
  baseURLLegacy = environment.baseURLLegacy;
  systemAccess = false;
  reportAccess = false;
  subscribeAccess = false;
  notificationMenu = false;
  showBellIcon = false;
  videoLibraryAccess = false;
  selectedNotification = "";
  values: any = [];
  weekDays: any = [
    { day: "Monday", startTime: null, endTime: null },
    { day: "Tuesday", startTime: null, endTime: null },
    { day: "Wednesday", startTime: null, endTime: null },
    { day: "Thursday", startTime: null, endTime: null },
    { day: "Friday", startTime: null, endTime: null },
    { day: "Saturday", startTime: null, endTime: null },
    { day: "Sunday", startTime: null, endTime: null },
  ];

  readonly VapidKEY = environment.vapidKey;

  searchForm = new UntypedFormGroup({
    findInput: new UntypedFormControl("", [Validators.required]),
  });

  @Output() messageEvent = new EventEmitter<string>();
  providerType: string = '';

  constructor(
    private authService: AuthService,
    private dialog: MatDialog,
    private snackbar: MatSnackBar,
    private http: HttpClient,
    public swUpdate: SwUpdate,
    public swPush: SwPush,
    public notificationService: PushNotificationsService,
    public monitor: MonitoringService,
    public socket: SocketService
  ) { }

  ngOnInit() {
    const userDetails = getFromStorage("user");
    this.providerType = getFromStorage("providerType");
    this.subscribeAccess = getFromStorage("subscribed") || false;
    if (userDetails) {
      const roles = userDetails["roles"];
      roles.forEach((role) => {
        if (role.uuid === "f6de773b-277e-4ce2-9ee6-8622b8a293e8" || role.uuid === "f99470e3-82a9-43cc-b3ee-e66c249f320a") {
          this.systemAccess = true;
        }
        if (
          role.uuid === "f6de773b-277e-4ce2-9ee6-8622b8a293e8" ||
          role.uuid === "f99470e3-82a9-43cc-b3ee-e66c249f320a" ||
          role.uuid === "b01d45ed-8539-409a-8b95-12b670017afa"
        ) {
          this.reportAccess = true;
        }
        if(role.uuid === "f8ecb440-3498-4901-a04a-05396ccca54a") {
          this.videoLibraryAccess = true;
        }
      });
    } else {
      this.logout();
    }
    this.authService.getFingerPrint();
    const duration = 1000 * 60 * 15; // hearbeat in every 15 mins
    setInterval(() => {
      this.createUpdateStatus();
    }, duration);
    setTimeout(() => {
      this.createUpdateStatus();
      this.subscribeNotification(true);
    }, 1000);
    this.socket.initSocket(true);
  }

  createUpdateStatus(status = "active") {
    const roles = this.user["roles"];
    var isDoctor = false;
    roles?.forEach((role) => {
      if (role.uuid === "a5df6aa5-d6e5-4b56-b0e7-315ee0899f97") {
        isDoctor = true;
      }
    });
    const payload = {
      userUuid: this.user?.uuid,
      status,
      name: this.user?.person?.display || this.user?.display,
    };
    if (isDoctor) this.monitor.createUpdateStatus(payload).subscribe();
  }

  /**
   * Remove session and navigates to login screen
   */
  logout() {
    this.unsubscribeNotification();
    this.createUpdateStatus("inactive");
    setTimeout(() => {
      this.authService.logout();
    }, 0);
  }

  /**
   * Opens dialog modal allow user to change password
   */
  changePassword() {
    this.dialog.open(ChangePasswordComponent, { width: "500px" });
  }

  /**
   * Take value from search input and show patient in the modal
   */
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

  /**
   * Initiates help tour
   */
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

  unsubscribeNotification() {
    setTimeout(() => {
      suppress(() => {
        this.swPush.unsubscribe();
      });
    }, 0);
    localStorage.removeItem("subscribed");
    this.notificationService
      .unsubscribeNotification({
        user_uuid: this.user.uuid,
        finger_print: this.authService.fingerPrint,
      })
      .subscribe();
  }

  subscribeNotification(reSubscribe = false) {
    this.swPush
      .requestSubscription({
        serverPublicKey: this.VapidKEY,
      })
      .then((sub) => {
        const providerDetails = getFromStorage("provider");
        if (providerDetails) {
          const attributes = providerDetails.attributes;
          const location = attributes.find((a) => {
            const display = a?.display || "";
            return display.toLowerCase().includes("visitstate");
          });
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
                  this.authService.fingerPrint,
                  location?.value
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
      })
      .catch((err) => { });
  }
}
