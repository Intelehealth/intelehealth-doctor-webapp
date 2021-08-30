import { Component, OnInit, Output, EventEmitter } from "@angular/core";
import { AuthService } from "src/app/services/auth.service";
import { MatDialog } from "@angular/material/dialog";
import { MatSnackBar } from "@angular/material/snack-bar";
import { ChangePasswordComponent } from "../../change-password/change-password.component";
import { FormGroup, FormControl, Validators } from "@angular/forms";
import { HttpClient } from "@angular/common/http";
import { FindPatientComponent } from "../../find-patient/find-patient.component";
import { environment } from "../../../../environments/environment";
import { SwPush, SwUpdate } from "@angular/service-worker";
declare var getFromStorage: any;

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
  selectedNotification = "";
  values: any = [];
  pdfUrl = 'https://helpline.ekalarogya.org/intelehealth/assets/COVID19_Management_Algorithm_22042021_v1.pdf';
  pdfName = 'COVID19_Management_Algorithm';

  weekDays: any = [
    { day: "Monday", startTime: null, endTime: null },
    { day: "Tuesday", startTime: null, endTime: null },
    { day: "Wednesday", startTime: null, endTime: null },
    { day: "Thursday", startTime: null, endTime: null },
    { day: "Friday", startTime: null, endTime: null },
    { day: "Saturday", startTime: null, endTime: null },
    { day: "Sunday", startTime: null, endTime: null },
  ];

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
          role.uuid === "a5df6aa5-d6e5-4b56-b0e7-315ee0899f97" ||
          role.uuid === "f99470e3-82a9-43cc-b3ee-e66c249f320a" ||
          role.uuid === "04902b9c-4acd-4fbf-ab37-6d9a81fd98fe"
        ) {
          this.reportAccess = true;
        }
      });
    } else {
      this.logout();
    }
    this.authService.getFingerPrint();
  }

  // openDoc() {
  //   window.open(this.pdfUrl);  
  // }

  /**
   * Remove session and navigates to login screen
   */
  logout() {
    this.authService.logout();
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
    if (search.findInput.length < 3) {
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
}
