import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { AuthService } from 'src/app/services/auth.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';
import { ChangePasswordComponent } from '../../change-password/change-password.component';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { FindPatientComponent } from '../../find-patient/find-patient.component';
import { environment } from '../../../../environments/environment';
import { SwPush, SwUpdate } from "@angular/service-worker";
import { PushNotificationsService } from "src/app/services/push-notification.service";
declare var getFromStorage: any, saveToStorage: any;

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent implements OnInit {
  baseURL = environment.baseURL;
  baseURLLegacy = environment.baseURLLegacy;
  systemAccess = false;
  reportAccess = false;
  values: any = [];
  subscribeAccess = false;

  readonly VapidKEY =
  "BMtnHsFSrIqN6HpWWHd1w7pjkuPcpPqAT_DIOo-B9L6BwpTgXUk-HtlRiWECDy2-N8RYCeqm8O8N_WUWX9V_578"; // SS training
  //"BNJYiUVbYJre8_1XP5aSD9BhpyJ-gBcpXgRyWXgM5MbF4P5evFFuU3sNC_fuk3hg33q8NDKUV-qYPWY7BeTJp0Y"; //SS Production

  searchForm = new FormGroup({
    findInput: new FormControl('', [Validators.required])
  });

  @Output() messageEvent = new EventEmitter<string>();


  constructor(private authService: AuthService,
    private dialog: MatDialog,
    private snackbar: MatSnackBar,
    private http: HttpClient,
    public swUpdate: SwUpdate,
    public swPush: SwPush,
    public notificationService: PushNotificationsService) { }

  ngOnInit() {
    const userDetails = getFromStorage('user');
    this.subscribeAccess = getFromStorage("subscribed") || false;
    if (userDetails) {
      const roles = userDetails['roles'];
      roles.forEach(role => {
        if (role.name === "Organizational: System Administrator") {
          this.systemAccess = true;
        } if (role.name === "Project Manager" || role.name === "Reporting module" || role.name === "Organizational: System Administrator" ) {
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
    if (this.swPush.isEnabled) {
      this.notificationService.notificationHandler();
    }
  }

  logout() {
    this.authService.logout();
    this.unsubscribeNotification();
    setTimeout(() => {
      this.authService.logout();
    }, 0);
  }

  changePassword() {
    this.dialog.open(ChangePasswordComponent, { width: '500px' });
  }

  search() {
    const search = this.searchForm.value;
    if (search.findInput === null || search.findInput.length < 3) {
      this.dialog.open(FindPatientComponent, { width: '50%', data: { value: 'Please enter min 3 characters' } });
    } else {
      // tslint:disable-next-line: max-line-length
      const url = `${this.baseURL}/patient?q=${search.findInput}&v=custom:(uuid,identifiers:(identifierType:(name),identifier),person)`;
      this.http.get(url)
        .subscribe(response => {
          this.values = [];
          response['results'].forEach(value => {
            if (value) {
              if (value.identifiers.length) {
                this.values.push(value);
              }
            }
          });
          this.dialog.open(FindPatientComponent, { width: '90%', data: { value: this.values } });
        }, err => {
          if (err.error instanceof Error) {
            this.snackbar.open('Client-side error', null, { duration: 2000 });
          } else {
            this.snackbar.open('Server-side error', null, { duration: 2000 });
          }
        });
    }
    this.searchForm.reset();
  }

  callTour() {
    this.messageEvent.emit();
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
                        this.snackbar.open('"Notification Subscribed Successfully"', null, { duration: 2000 });
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

  get user() {
    try {
      return JSON.parse(localStorage.user);
    } catch (error) {
      return {};
    }
  }
}
