import { HttpClient } from "@angular/common/http";
import { Component, OnInit } from "@angular/core";
import { MatDialog } from "@angular/material/dialog";
import { MatSnackBar } from "@angular/material/snack-bar";
import { HeaderService } from "src/app/services/header.service";
import { ProfileService } from "src/app/services/profile.service";
import { environment } from "src/environments/environment";
import { FindPatientComponent } from "../find-patient/find-patient.component";
import { SelectLanguageComponent } from "../set-up-profile/select-language/select-language.component";
import { SetNewPasswordComponent } from "../set-new-password/set-new-password.component";
import { Router } from "@angular/router";
declare var getFromStorage: any;

@Component({
  selector: "app-header",
  templateUrl: "./header.component.html",
  styleUrls: ["./header.component.scss"],
})
export class HeaderComponent implements OnInit {
  baseURL = environment.baseURL;
  isShowNotification: boolean = false;
  showBreadCrumb: boolean = false;
  allNotification = [{}];
  selectedIndex: number = 0;
  showFourNotification = [
    {
      text: "muskan kala's appointment start in 15mints",
      lableIconPath: "assets/svgs/calender-dilog.svg",
      isActive: true,
    },

    {
      text: "muskan kala's appointment start in 15mints",
      lableIconPath: "assets/svgs/video-dilog.svg",
      isActive: false,
    },
    {
      text: "muskan kala's appointment start in 15mints",
      lableIconPath: "assets/svgs/priority-dilog.svg",
      isActive: false,
    },
    {
      text: "muskan kala's",
      lableIconPath: "assets/svgs/progress-dilog.svg",
      isActive: false,
    },
  ];

  breadCrumb = [
    {
      text: "Dashboard",
      route: "/dashboard",
    }
  ];

  userName: string;
  values: any = [];
  searchValue: string;
  personImgURL = "assets/images/profile/Frame 2609036.png";
  constructor(public headerService: HeaderService,
    private dialog: MatDialog,
    private snackbar: MatSnackBar,
    private http: HttpClient,
    private profileService: ProfileService,
    private router: Router) {
  }

  ngOnInit(): void {
    this.userName = getFromStorage("doctorName");
    let provider = getFromStorage("provider");
    this.profileService.getProfileImage(provider.person.uuid).subscribe((response) => {
      this.personImgURL = `${this.profileService.baseURL}/personimage/${provider.person.uuid}`;
    }, (err) => {
      this.personImgURL = this.personImgURL;
    });
    this.router.events.subscribe(() => {
      if (this.breadCrumb.length == 2) {
        this.breadCrumb.pop();
      }
      if (this.router.url.includes("visit-summary")) {
        this.breadCrumb.push({
          text: "Visit summary",
          route: "/dashboard/visit-summary",
        });
      } else if (this.router.url.includes("calendar")) {
        this.breadCrumb.push({
          text: "Calendar",
          route: "/dashboard/calendar",
        });
      }
    });
  }

  notificationClick() {
    this.isShowNotification = !this.isShowNotification;
  }

  get showSearchBar() {
    return this.headerService?.showSearchBar;
  }

  close() {
    this.isShowNotification = false;
  }

  search() {
    if (this.searchValue === null || this.searchValue.length < 3) {
      this.dialog.open(FindPatientComponent, {
        width: "50%",
        data: { value: "Please enter min 3 characters" },
      });
    } else {
      const url = `${this.baseURL}/patient?q=${this.searchValue}&v=custom:(uuid,identifiers:(identifierType:(name),identifier),person)`;
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
  }

  selectLanguage(): void {
    const dialogRef = this.dialog.open(SelectLanguageComponent, {
      data: {},
    });
  }

  changePassword() {
    this.dialog.open(SetNewPasswordComponent, {
      width: "40%"
    });
  }
}
